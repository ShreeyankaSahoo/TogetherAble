import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface AnonMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  status: string;
  user1_reveal_level: string;
  user2_reveal_level: string;
  created_at: string;
}

export interface AnonMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export function useAnonymousProfile() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("anonymous_profiles")
      .select("nickname")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        setNickname(data?.nickname ?? null);
        setLoading(false);
      });
  }, [user]);

  const createProfile = async (nick: string) => {
    if (!user) return;
    // Upsert
    const { error } = await supabase.from("anonymous_profiles").upsert(
      { user_id: user.id, nickname: nick, is_active: true },
      { onConflict: "user_id" }
    );
    if (!error) setNickname(nick);
    return { error };
  };

  const deactivate = async () => {
    if (!user) return;
    await supabase
      .from("anonymous_profiles")
      .update({ is_active: false })
      .eq("user_id", user.id);
    setNickname(null);
  };

  return { nickname, loading, createProfile, deactivate };
}

export function useActiveMatch() {
  const { user } = useAuth();
  const [match, setMatch] = useState<AnonMatch | null>(null);
  const [partnerNickname, setPartnerNickname] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchMatch = async () => {
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("anonymous_matches")
      .select("*")
      .eq("status", "active")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .maybeSingle();

    if (data) {
      setMatch(data as AnonMatch);
      const partnerId = data.user1_id === user.id ? data.user2_id : data.user1_id;
      const { data: profile } = await supabase
        .from("anonymous_profiles")
        .select("nickname")
        .eq("user_id", partnerId)
        .maybeSingle();
      setPartnerNickname(profile?.nickname ?? "Anonymous");
    } else {
      setMatch(null);
      setPartnerNickname("");
    }
    setLoading(false);
  };

  useEffect(() => { fetchMatch(); }, [user]);

  const endMatch = async () => {
    if (!match) return;
    await supabase
      .from("anonymous_matches")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", match.id);
    setMatch(null);
  };

  const updateRevealLevel = async (level: string) => {
    if (!match || !user) return;
    const field = match.user1_id === user.id ? "user1_reveal_level" : "user2_reveal_level";
    await supabase
      .from("anonymous_matches")
      .update({ [field]: level })
      .eq("id", match.id);
    await fetchMatch();
  };

  return { match, partnerNickname, loading, endMatch, updateRevealLevel, refetch: fetchMatch };
}

export function useAnonMessages(matchId: string | null) {
  const [messages, setMessages] = useState<AnonMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!matchId) { setMessages([]); return; }

    setLoading(true);
    supabase
      .from("anonymous_messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data as AnonMessage[]) || []);
        setLoading(false);
      });

    const channel = supabase
      .channel(`anon-msgs:${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "anonymous_messages", filter: `match_id=eq.${matchId}` },
        (payload: RealtimePostgresChangesPayload<AnonMessage>) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => {
              const newMsg = payload.new as AnonMessage;
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  return { messages, loading };
}

export async function sendAnonMessage(matchId: string, senderId: string, content: string) {
  return supabase.from("anonymous_messages").insert({
    match_id: matchId,
    sender_id: senderId,
    content: content.trim(),
  });
}

export async function findMatch(userId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  if (!accessToken) {
    throw new Error("You must be logged in to find a match");
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anonymous-match`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Matching failed");
  }

  return response.json();
}
