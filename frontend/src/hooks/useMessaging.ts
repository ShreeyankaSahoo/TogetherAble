import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface ConversationWithDetails {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  participantId: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  type: string;
  content: string;
  duration: number | null;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;

    // Get user's conversation IDs
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participations?.length) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convIds = participations.map((p) => p.conversation_id);

    // Get other participants' profiles for each conversation
    const { data: otherParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds)
      .neq("user_id", user.id);

    const otherUserIds = [...new Set(otherParticipants?.map((p) => p.user_id) || [])];
    const { data: profiles } = await supabase
      .rpc("get_public_profiles", { _ids: otherUserIds }) as { data: { id: string; display_name: string; avatar_url: string }[] | null };

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    // Get last message per conversation
    const results: ConversationWithDetails[] = [];

    for (const convId of convIds) {
      const otherP = otherParticipants?.find((p) => p.conversation_id === convId);
      const profile = otherP ? profileMap.get(otherP.user_id) : null;

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, type, created_at, duration")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const timeAgo = lastMsg ? getTimeAgo(new Date(lastMsg.created_at)) : "";
      const lastContent = lastMsg
        ? lastMsg.type === "voice"
          ? `🎤 Voice note (${lastMsg.duration || 0}s)`
          : lastMsg.content
        : "No messages yet";

      results.push({
        id: convId,
        name: profile?.display_name || "Unknown",
        avatar: profile?.avatar_url || "",
        lastMessage: lastContent,
        time: timeAgo,
        unread: 0,
        online: false,
        participantId: otherP?.user_id || "",
      });
    }

    setConversations(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });

    // Real-time subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<MessageRow>) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => {
              if (prev.some((m) => m.id === (payload.new as MessageRow).id)) return prev;
              return [...prev, payload.new as MessageRow];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, loading };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  type: "text" | "voice" | "aac" = "text",
  duration?: number
) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
    type,
    duration: duration ?? null,
  });
  return { error };
}

export async function createConversation(userId: string, otherUserId: string) {
  // Check if conversation already exists
  const { data: myConvs } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (myConvs?.length) {
    const { data: shared } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", myConvs.map((c) => c.conversation_id));

    if (shared?.length) return shared[0].conversation_id;
  }

  // Create new conversation with participant via secure function
  const { data: convId, error: convError } = await supabase
    .rpc("create_conversation_with_participant", { _other_user_id: otherUserId });

  if (convError || !convId) throw convError;

  return convId as string;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr`;
  return `${Math.floor(diffHr / 24)}d`;
}
