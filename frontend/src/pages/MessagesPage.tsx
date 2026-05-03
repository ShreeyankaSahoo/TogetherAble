import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { MessageCircle, Search, Send, Users } from "lucide-react";

const API_URL = "http://localhost:10000";

interface StoredUser {
  _id: string;
  name?: string;
  email?: string;
}

interface ChatUser {
  _id: string;
  name?: string;
  email?: string;
}

interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  text: string;
  createdAt: string;
  optimistic?: boolean;
}

const getStoredUser = (): StoredUser | null => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;

    const parsedUser = JSON.parse(rawUser) as Partial<StoredUser>;
    if (!parsedUser?._id) return null;

    return {
      _id: parsedUser._id,
      name: parsedUser.name,
      email: parsedUser.email,
    };
  } catch (err) {
    console.log("Failed to read logged-in user:", err);
    return null;
  }
};

const getDisplayName = (user: ChatUser | StoredUser) =>
  user.name || user.email || "Unknown user";

const MessagesPage = () => {
  const currentUser = useMemo(() => getStoredUser(), []);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = io(API_URL);
    socketRef.current = socket;

    socket.emit("join", currentUser._id);

    socket.on("receiveMessage", (message: ChatMessage) => {
      const belongsToOpenChat =
        selectedUser &&
        ((message.sender === currentUser._id && message.receiver === selectedUser._id) ||
          (message.sender === selectedUser._id && message.receiver === currentUser._id));

      if (!belongsToOpenChat) return;

      setMessages((prev) => {
        const withoutOptimisticCopy = prev.filter(
          (item) =>
            !(
              item.optimistic &&
              item.sender === message.sender &&
              item.receiver === message.receiver &&
              item.text === message.text
            )
        );

        if (withoutOptimisticCopy.some((item) => item._id === message._id)) {
          return withoutOptimisticCopy;
        }

        return [...withoutOptimisticCopy, message];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?._id, selectedUser]);

  useEffect(() => {
    if (!currentUser?._id) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      setError("");

      try {
        // TODO: Reintroduce match-based filtering later.
        const res = await fetch(`${API_URL}/users?userId=${currentUser._id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load users");
          return;
        }

        const otherUsers = Array.isArray(data)
          ? data.filter((user) => String(user._id) !== currentUser._id)
          : [];

        setUsers(otherUsers);
      } catch (err) {
        console.log("FETCH USERS ERROR:", err);
        setError("Could not load users. Please check the backend server.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id || !selectedUser?._id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setError("");

      try {
        const res = await fetch(`${API_URL}/messages/${currentUser._id}/${selectedUser._id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load messages");
          setMessages([]);
          return;
        }

        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("FETCH MESSAGES ERROR:", err);
        setError("Could not load messages. Please check the backend server.");
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [currentUser?._id, selectedUser?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!currentUser?._id || !selectedUser?._id || !input.trim()) return;

    const text = input.trim();
    const optimisticMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
      sender: currentUser._id,
      receiver: selectedUser._id,
      text,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          text,
        }),
      });

      const savedMessage = await res.json();

      if (!res.ok) {
        setMessages((prev) => prev.filter((message) => message._id !== optimisticMessage._id));
        setError(savedMessage.error || "Failed to send message");
      }
    } catch (err) {
      console.log("SEND MESSAGE ERROR:", err);
      setMessages((prev) => prev.filter((message) => message._id !== optimisticMessage._id));
      setError("Could not send message. Please check the backend server.");
    }
  };

  if (!currentUser) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="font-heading text-2xl font-bold">Please log in</h1>
          <p className="text-muted-foreground mt-2">You need to be logged in to use messages.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container py-6">
        <section className="h-[calc(100vh-8rem)] min-h-[560px] border border-border bg-card shadow-card rounded-lg overflow-hidden grid md:grid-cols-[320px_1fr]">
          <aside className="flex flex-col border-b md:border-b-0 md:border-r border-border min-h-0">
            <div className="p-4 border-b border-border">
              <h1 className="font-heading text-2xl font-extrabold">Messages</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Signed in as {getDisplayName(currentUser)}
              </p>
              <div className="mt-4 flex items-center gap-2 bg-background border border-input rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="bg-transparent text-sm flex-1 outline-none"
                  aria-label="Search users"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
                  No users found
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                      selectedUser?._id === user._id ? "bg-secondary" : ""
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-primary/10 border border-border flex items-center justify-center text-primary font-bold shrink-0">
                      {getDisplayName(user).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-semibold text-sm truncate">{getDisplayName(user)}</p>
                      {user.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <div className="flex flex-col min-h-0">
            {selectedUser ? (
              <>
                <header className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-border flex items-center justify-center text-primary font-bold">
                    {getDisplayName(selectedUser).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-heading font-bold">{getDisplayName(selectedUser)}</h2>
                    {selectedUser.email && <p className="text-xs text-muted-foreground">{selectedUser.email}</p>}
                  </div>
                </header>

                {error && (
                  <div className="px-4 py-2 text-sm text-destructive bg-destructive/10 border-b border-destructive/20">
                    {error}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                  {loadingMessages ? (
                    <div className="text-center text-sm text-muted-foreground py-10">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-10">No messages yet</div>
                  ) : (
                    messages.map((message) => {
                      const isSent = String(message.sender) === currentUser._id;

                      return (
                        <div key={message._id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              isSent
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-card text-card-foreground shadow-card rounded-bl-md"
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className={`text-[10px] mt-1 ${isSent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {message.optimistic ? "Sending..." : new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <footer className="border-t border-border p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleSend();
                      }}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      aria-label="Message input"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div className="max-w-sm">
                  <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h2 className="font-heading text-xl font-bold mb-2">Select a Chat</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a user from the left panel to start messaging in real time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default MessagesPage;
