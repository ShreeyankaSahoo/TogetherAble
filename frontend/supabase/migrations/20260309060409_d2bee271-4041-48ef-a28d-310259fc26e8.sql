-- 1. Drop the overly permissive SELECT policy that leaks user_id
DROP POLICY IF EXISTS "Active anonymous profiles are viewable" ON public.anonymous_profiles;

-- 2. Create a safe view without user_id for general consumption
CREATE OR REPLACE VIEW public.public_anonymous_profiles AS
  SELECT id, nickname, is_active, created_at
  FROM public.anonymous_profiles
  WHERE is_active = true;

-- Grant to authenticated only
GRANT SELECT ON public.public_anonymous_profiles TO authenticated;
REVOKE SELECT ON public.public_anonymous_profiles FROM anon;

-- 3. Fix public_profiles view: drop security_invoker so it can read across users,
--    and restrict access to authenticated only
ALTER VIEW public.public_profiles SET (security_invoker = off);
REVOKE ALL ON public.public_profiles FROM anon;
GRANT SELECT ON public.public_profiles TO authenticated;