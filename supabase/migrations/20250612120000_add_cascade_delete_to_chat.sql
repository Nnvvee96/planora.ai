-- Drop existing foreign key constraints
ALTER TABLE public.conversations DROP CONSTRAINT conversations_creator_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT messages_sender_id_fkey;

-- Add new foreign key constraints with ON DELETE CASCADE
ALTER TABLE public.conversations
ADD CONSTRAINT conversations_creator_id_fkey
FOREIGN KEY (creator_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey
FOREIGN KEY (sender_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
