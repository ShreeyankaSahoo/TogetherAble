
-- Anonymous profiles for anonymous dating mode
CREATE TABLE public.anonymous_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.anonymous_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own anonymous profile"
ON public.anonymous_profiles FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Active anonymous profiles are viewable"
ON public.anonymous_profiles FOR SELECT
TO authenticated
USING (is_active = true);

-- Anonymous matches
CREATE TABLE public.anonymous_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compatibility_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  user1_reveal_level text NOT NULL DEFAULT 'anonymous',
  user2_reveal_level text NOT NULL DEFAULT 'anonymous',
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE public.anonymous_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches"
ON public.anonymous_matches FOR SELECT
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Authenticated users can create matches"
ON public.anonymous_matches FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own matches"
ON public.anonymous_matches FOR UPDATE
TO authenticated
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Anonymous messages
CREATE TABLE public.anonymous_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.anonymous_matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.anonymous_messages ENABLE ROW LEVEL SECURITY;

-- Function to check match membership
CREATE OR REPLACE FUNCTION public.is_anon_match_member(_user_id uuid, _match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.anonymous_matches
    WHERE id = _match_id
    AND status = 'active'
    AND (user1_id = _user_id OR user2_id = _user_id)
  )
$$;

CREATE POLICY "Users can view messages in their matches"
ON public.anonymous_messages FOR SELECT
TO authenticated
USING (public.is_anon_match_member(auth.uid(), match_id));

CREATE POLICY "Users can send messages in their matches"
ON public.anonymous_messages FOR INSERT
TO authenticated
WITH CHECK (public.is_anon_match_member(auth.uid(), match_id) AND auth.uid() = sender_id);

-- Enable realtime for anonymous messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_messages;
