
-- Table for reports
CREATE TABLE public.anonymous_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  match_id uuid NOT NULL REFERENCES public.anonymous_matches(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.anonymous_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.anonymous_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.anonymous_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

-- Table for blocks
CREATE TABLE public.anonymous_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  match_id uuid NOT NULL REFERENCES public.anonymous_matches(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_user_id)
);

ALTER TABLE public.anonymous_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can block others" ON public.anonymous_blocks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can view their blocks" ON public.anonymous_blocks
  FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock" ON public.anonymous_blocks
  FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);
