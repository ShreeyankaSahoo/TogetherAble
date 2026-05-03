-- Create a secure function to start a conversation
CREATE OR REPLACE FUNCTION public.create_conversation_with_participant(_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conv_id uuid;
BEGIN
  -- Create conversation
  INSERT INTO public.conversations DEFAULT VALUES RETURNING id INTO _conv_id;
  
  -- Add both participants
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (_conv_id, auth.uid()), (_conv_id, _other_user_id);
  
  RETURN _conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_conversation_with_participant(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_conversation_with_participant(uuid) FROM anon;

-- Remove the client INSERT policy on conversation_participants
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;