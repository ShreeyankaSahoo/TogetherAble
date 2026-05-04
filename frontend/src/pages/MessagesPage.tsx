import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { MessageCircle, Send, Users } from "lucide-react";
import { apiUrl } from "@/lib/api";

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
  createdAt?: string;
}

const getStoredUser = (): StoredUser | null => {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;

    const user = JSON.parse(rawUser) as Partial<StoredUser>;
    if (!user._id) return null;

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
  } catch (err) {
    console.error("READ USER ERROR:", err);
    return null;
  }
};

const getDisplayName = (user: StoredUser | ChatUser) =>
  user.name || user.email || "Unknown user";

const MessagesPage = () => {
  const loggedInUser = useMemo(() => getStoredUser(), []);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loggedInUser?._id) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      setError("");

      try {
        const res = await fetch(apiUrl(`/users?userId=${loggedInUser._id}`));
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || data.error || "Failed to load users");
          return;
        }

        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("FETCH USERS ERROR:", err);
        setError("Could not load users. Please check the backend server.");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [loggedInUser?._id]);

  useEffect(() => {
    if (!loggedInUser?._id || !selectedUser?._id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setError("");

      try {
        const res = await fetch(apiUrl(`/messages/${loggedInUser._id}/${selectedUser._id}`));
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || data.error || "Failed to load messages");
          setMessages([]);
          return;
        }

        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("FETCH MESSAGES ERROR:", err);
        setError("Could not load messages. Please check the backend server.");
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [loggedInUser?._id, selectedUser?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!loggedInUser?._id || !selectedUser?._id || !text.trim() || sending) return;

    const messageText = text.trim();
    setSending(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/messages"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: loggedInUser._id,
          receiverId: selectedUser._id,
          text: messageText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Failed to send message");
        return;
      }

      setMessages((prev) => [...prev, data]);
      setText("");
    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err);
      setError("Could not send message. Please check the backend server.");
    } finally {
      setSending(false);
    }
  };

  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container py-6">
        <section className="h-[calc(100vh-8rem)] min-h-[560px] overflow-hidden rounded-lg border border-border bg-card shadow-card md:grid md:grid-cols-[320px_1fr]">
          <aside className="flex min-h-0 flex-col border-b border-border md:border-b-0 md:border-r">
            <header className="border-b border-border p-4">
              <h1 className="font-heading text-2xl font-extrabold">Messages</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Logged in as: {getDisplayName(loggedInUser)}
              </p>
              {loggedInUser.email && (
                <p className="text-xs text-muted-foreground">{loggedInUser.email}</p>
              )}
            </header>

            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <Users className="mx-auto mb-3 h-8 w-8 text-primary" />
                  No users found
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                      selectedUser?._id === user._id ? "bg-secondary" : ""
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 font-bold text-primary">
                      {getDisplayName(user).charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{getDisplayName(user)}</span>
                      {user.email && (
                        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            {selectedUser ? (
              <>
                <header className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-primary/10 font-bold text-primary">
                    {getDisplayName(selectedUser).charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-heading font-bold">{getDisplayName(selectedUser)}</h2>
                    {selectedUser.email && (
                      <p className="truncate text-xs text-muted-foreground">{selectedUser.email}</p>
                    )}
                  </div>
                </header>

                {error && (
                  <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex-1 space-y-3 overflow-y-auto bg-background p-4">
                  {loadingMessages ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">No messages yet</p>
                  ) : (
                    messages.map((message) => {
                      const sentByMe = String(message.sender) === loggedInUser._id;

                      return (
                        <div
                          key={message._id}
                          className={`flex ${sentByMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              sentByMe
                                ? "rounded-br-md bg-primary text-primary-foreground"
                                : "rounded-bl-md bg-card text-card-foreground shadow-card"
                            }`}
                          >
                            <p>{message.text}</p>
                            {message.createdAt && (
                              <p
                                className={`mt-1 text-[10px] ${
                                  sentByMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
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
                      value={text}
                      onChange={(event) => setText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleSendMessage();
                      }}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      aria-label="Message input"
                    />
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!text.trim() || sending}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div className="max-w-sm">
                  <MessageCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                  <h2 className="mb-2 font-heading text-xl font-bold">Select a Chat</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a user from the left panel to start messaging.
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
};

export default MessagesPage;
