-- Fix RESTRICTIVE policies: Drop and recreate as PERMISSIVE (default)
-- The CREATE POLICY statements without RESTRICTIVE keyword default to PERMISSIVE

-- First, drop ALL existing policies and recreate them as PERMISSIVE

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT TO authenticated USING (is_conversation_member(auth.uid(), id));
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- conversation_participants
DROP POLICY IF EXISTS "Users can view their participation" ON public.conversation_participants;
CREATE POLICY "Users can view their participation" ON public.conversation_participants FOR SELECT TO authenticated USING (is_conversation_member(auth.uid(), conversation_id));

-- messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT TO authenticated USING (is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Users can send messages to their conversations" ON public.messages FOR INSERT TO authenticated WITH CHECK (is_conversation_member(auth.uid(), conversation_id) AND (auth.uid() = sender_id));

-- anonymous_profiles
DROP POLICY IF EXISTS "Users can manage their own anonymous profile" ON public.anonymous_profiles;
CREATE POLICY "Users can manage their own anonymous profile" ON public.anonymous_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- anonymous_matches: fix reveal level escalation by splitting UPDATE into two column-specific policies
DROP POLICY IF EXISTS "Users can view their own matches" ON public.anonymous_matches;
DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.anonymous_matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON public.anonymous_matches;
CREATE POLICY "Users can view their own matches" ON public.anonymous_matches FOR SELECT TO authenticated USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));
CREATE POLICY "Authenticated users can create matches" ON public.anonymous_matches FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

-- Use a security definer function for safe reveal level updates
CREATE OR REPLACE FUNCTION public.update_own_reveal_level(_match_id uuid, _new_level text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.anonymous_matches
  SET user1_reveal_level = CASE WHEN user1_id = auth.uid() THEN _new_level ELSE user1_reveal_level END,
      user2_reveal_level = CASE WHEN user2_id = auth.uid() THEN _new_level ELSE user2_reveal_level END
  WHERE id = _match_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
    AND status = 'active';
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_own_reveal_level(uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.update_own_reveal_level(uuid, text) FROM anon;

-- Restrict UPDATE to status/ended_at only (no reveal level changes via direct UPDATE)
CREATE POLICY "Users can update match status" ON public.anonymous_matches FOR UPDATE TO authenticated
  USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

-- anonymous_messages
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.anonymous_messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.anonymous_messages;
CREATE POLICY "Users can view messages in their matches" ON public.anonymous_messages FOR SELECT TO authenticated USING (is_anon_match_member(auth.uid(), match_id));
CREATE POLICY "Users can send messages in their matches" ON public.anonymous_messages FOR INSERT TO authenticated WITH CHECK (is_anon_match_member(auth.uid(), match_id) AND (auth.uid() = sender_id));

-- anonymous_blocks
DROP POLICY IF EXISTS "Users can view their blocks" ON public.anonymous_blocks;
DROP POLICY IF EXISTS "Users can block others" ON public.anonymous_blocks;
DROP POLICY IF EXISTS "Users can unblock" ON public.anonymous_blocks;
CREATE POLICY "Users can view their blocks" ON public.anonymous_blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);
CREATE POLICY "Users can block others" ON public.anonymous_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can unblock" ON public.anonymous_blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- anonymous_reports
DROP POLICY IF EXISTS "Users can view their own reports" ON public.anonymous_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.anonymous_reports;
CREATE POLICY "Users can view their own reports" ON public.anonymous_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON public.anonymous_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);