-- Fix 1: Recreate all RESTRICTIVE policies as PERMISSIVE

-- profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT TO authenticated USING (is_conversation_member(auth.uid(), id));

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- conversation_participants (also fix the injection vulnerability)
DROP POLICY IF EXISTS "Users can view their participation" ON public.conversation_participants;
CREATE POLICY "Users can view their participation" ON public.conversation_participants FOR SELECT TO authenticated USING (is_conversation_member(auth.uid(), conversation_id));

DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants" ON public.conversation_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- messages
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT TO authenticated USING (is_conversation_member(auth.uid(), conversation_id));

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations" ON public.messages FOR INSERT TO authenticated WITH CHECK (is_conversation_member(auth.uid(), conversation_id) AND (auth.uid() = sender_id));

-- anonymous_profiles
DROP POLICY IF EXISTS "Users can manage their own anonymous profile" ON public.anonymous_profiles;
CREATE POLICY "Users can manage their own anonymous profile" ON public.anonymous_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- anonymous_matches
DROP POLICY IF EXISTS "Users can view their own matches" ON public.anonymous_matches;
CREATE POLICY "Users can view their own matches" ON public.anonymous_matches FOR SELECT TO authenticated USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.anonymous_matches;
CREATE POLICY "Authenticated users can create matches" ON public.anonymous_matches FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

DROP POLICY IF EXISTS "Users can update their own matches" ON public.anonymous_matches;
CREATE POLICY "Users can update their own matches" ON public.anonymous_matches FOR UPDATE TO authenticated USING ((auth.uid() = user1_id) OR (auth.uid() = user2_id));

-- anonymous_messages
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.anonymous_messages;
CREATE POLICY "Users can view messages in their matches" ON public.anonymous_messages FOR SELECT TO authenticated USING (is_anon_match_member(auth.uid(), match_id));

DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.anonymous_messages;
CREATE POLICY "Users can send messages in their matches" ON public.anonymous_messages FOR INSERT TO authenticated WITH CHECK (is_anon_match_member(auth.uid(), match_id) AND (auth.uid() = sender_id));

-- anonymous_blocks
DROP POLICY IF EXISTS "Users can view their blocks" ON public.anonymous_blocks;
CREATE POLICY "Users can view their blocks" ON public.anonymous_blocks FOR SELECT TO authenticated USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can block others" ON public.anonymous_blocks;
CREATE POLICY "Users can block others" ON public.anonymous_blocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can unblock" ON public.anonymous_blocks;
CREATE POLICY "Users can unblock" ON public.anonymous_blocks FOR DELETE TO authenticated USING (auth.uid() = blocker_id);

-- anonymous_reports
DROP POLICY IF EXISTS "Users can view their own reports" ON public.anonymous_reports;
CREATE POLICY "Users can view their own reports" ON public.anonymous_reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can create reports" ON public.anonymous_reports;
CREATE POLICY "Users can create reports" ON public.anonymous_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);