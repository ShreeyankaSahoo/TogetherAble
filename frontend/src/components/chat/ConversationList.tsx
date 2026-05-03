import type { ConversationWithDetails } from "@/hooks/useMessaging";
import { Search } from "lucide-react";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

const ConversationList = ({ conversations, selectedId, onSelect, loading }: ConversationListProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-heading text-xl font-bold">Messages</h2>
        <div className="mt-3 flex items-center gap-2 bg-background border border-input rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="bg-transparent text-sm flex-1 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground text-sm">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">No conversations yet</div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                selectedId === c.id ? "bg-secondary" : ""
              }`}
            >
              <div className="relative shrink-0">
                {c.avatar ? (
                  <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center text-primary font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {c.online && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-card" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-sm truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{c.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessage}</p>
              </div>

              {c.unread > 0 && (
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {c.unread}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
