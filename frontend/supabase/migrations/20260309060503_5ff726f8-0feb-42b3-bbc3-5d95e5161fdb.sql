-- Drop the security definer views and replace with security definer functions

-- 1. Drop views
DROP VIEW IF EXISTS public.public_profiles;
DROP VIEW IF EXISTS public.public_anonymous_profiles;

-- 2. Create security definer function for public profiles
CREATE OR REPLACE FUNCTION public.get_public_profiles(_ids uuid[] DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  display_name text,
  avatar_url text,
  bio text,
  disability_type text,
  mobility_aids text,
  communication_style text,
  support_needs text,
  interests text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.avatar_url, p.bio, p.disability_type,
         p.mobility_aids, p.communication_style, p.support_needs, p.interests
  FROM public.profiles p
  WHERE (_ids IS NULL OR p.id = ANY(_ids));
$$;

-- Grant execute to authenticated only
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) FROM anon;

-- 3. Create security definer function for public anonymous profiles
CREATE OR REPLACE FUNCTION public.get_public_anonymous_profiles()
RETURNS TABLE(
  id uuid,
  nickname text,
  is_active boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ap.id, ap.nickname, ap.is_active, ap.created_at
  FROM public.anonymous_profiles ap
  WHERE ap.is_active = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_anonymous_profiles() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_anonymous_profiles() FROM anon;