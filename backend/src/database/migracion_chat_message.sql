-- ============================================================================
-- Migración: Chat por Proyecto (Módulo Miembro - "Mis Chats")
-- ------------------------------------------------------------------------
-- Agrega la tabla chat_message. No existía ninguna tabla de chat/mensajes
-- en el esquema original (flowsheet_db2.sql), así que esto es una migración
-- real de esquema, no solo datos de permisos.
--
-- La "membresía" del chat de un proyecto se deriva de proyect_role_user
-- (cualquier persona con un rol en ese proyecto puede ver/participar en su
-- chat) - no hace falta una tabla aparte de miembros de chat.
--
-- Este script es IDEMPOTENTE (CREATE TABLE IF NOT EXISTS).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_message (
    chat_message_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    proyect_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message_text text NOT NULL,
    sent_at timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT chat_message_pkey PRIMARY KEY (chat_message_id),
    CONSTRAINT chat_message_proyect_fk FOREIGN KEY (proyect_id) REFERENCES public.proyect(id),
    CONSTRAINT chat_message_user_fk FOREIGN KEY (user_id) REFERENCES public."user"(user_id)
);

ALTER TABLE public.chat_message OWNER TO postgres;

CREATE INDEX IF NOT EXISTS idx_chat_message_proyect_fecha
    ON public.chat_message (proyect_id, sent_at);
