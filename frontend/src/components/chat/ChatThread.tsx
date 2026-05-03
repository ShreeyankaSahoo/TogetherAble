import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, sendMessage } from "@/hooks/useMessaging";
import AACToolbar from "@/components/chat/AACToolbar";
import VoiceNoteButton from "@/components/chat/VoiceNoteButton";
import { Send, Smile, MoreVertical, Phone, Video, Mic } from "lucide-react";

interface ChatThreadProps {
  conversationId: string;
  otherName: string;
  otherAvatar: string;
  onMessageSent?: () => void;
}

const ChatThread = ({ conversationId, otherName, otherAvatar, onMessageSent }: ChatThreadProps) => {
  const { user } = useAuth();
  const { messages, loading } = useMessages(conversationId);
  const [input, setInput] = useState("");
  const [showAAC, setShowAAC] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInput("");
    setShowAAC(false);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string, type: "text" | "aac" = "text") => {
    if (!content.trim() || !user) return;
    await sendMessage(conversationId, user.id, content.trim(), type);
    setInput("");
    onMessageSent?.();
  };

  const handleVoiceNote = async (duration: number) => {
    if (!user) return;
    await sendMessage(conversationId, user.id, "Voice note", "voice", duration);
    onMessageSent?.();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <div className="relative">
          {otherAvatar ? (
            <img src={otherAvatar} alt={otherName} className="w-10 h-10 rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center text-primary font-bold text-sm">
              {otherName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-sm truncate">{otherName}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Voice call">
            <Phone className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Video call">
            <Video className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-full hover:bg-muted transition-colors" aria-label="More options">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello! 👋</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card text-card-foreground shadow-card rounded-bl-md"
                  }`}
                >
                  {msg.type === "voice" ? (
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 shrink-0" />
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-0.5 rounded-full ${isMe ? "bg-primary-foreground/60" : "bg-foreground/30"}`}
                            style={{ height: `${Math.random() * 16 + 4}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs opacity-70">{msg.duration}s</span>
                    </div>
                  ) : msg.type === "aac" ? (
                    <div>
                      <span className="text-xs opacity-60 block mb-0.5">AAC</span>
                      <span>{msg.content}</span>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                  <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* AAC toolbar */}
      {showAAC && <AACToolbar onSelect={(phrase) => handleSend(phrase, "aac")} />}

      {/* Input bar */}
      <div className="border-t border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAAC(!showAAC)}
            className={`p-2 rounded-full transition-colors ${showAAC ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
            aria-label="Toggle AAC tools"
            title="AAC Communication Tools"
          >
            <Smile className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center bg-background border border-input rounded-full px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Type a message..."
              className="bg-transparent text-sm flex-1 outline-none"
              aria-label="Message input"
            />
          </div>

          {input.trim() ? (
            <button
              onClick={() => handleSend(input)}
              className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-warm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <VoiceNoteButton onSend={handleVoiceNote} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatThread;
