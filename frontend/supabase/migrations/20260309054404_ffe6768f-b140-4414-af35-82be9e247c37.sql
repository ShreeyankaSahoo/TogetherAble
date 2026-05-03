-- Fix security definer view by using SECURITY INVOKER
ALTER VIEW public.public_profiles SET (security_invoker = on);
