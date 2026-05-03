-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Allow users to read their own full profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Create a view with only safe public columns for other users to query
CREATE OR REPLACE VIEW public.public_profiles AS
  SELECT id, display_name, avatar_url, bio, disability_type, mobility_aids,
         communication_style, support_needs, interests
  FROM public.profiles;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;
