
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender_identity text,
ADD COLUMN IF NOT EXISTS pronouns text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS contact_number text,
ADD COLUMN IF NOT EXISTS disability_percentage text,
ADD COLUMN IF NOT EXISTS accessibility_preferences text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
