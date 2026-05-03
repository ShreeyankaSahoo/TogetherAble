
-- Fix: conversations INSERT - any authenticated user can create, but we add a check that they must also add themselves as participant
DROP POLICY "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix: conversation_participants INSERT - users can only add themselves or others to conversations they belong to
DROP POLICY "Authenticated users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants" ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_conversation_member(auth.uid(), conversation_id));
