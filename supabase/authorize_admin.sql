-- ==============================================================================
-- PHASE 16 — ADMINISTRATOR AUTHORIZATION SCRIPT
-- Target Account: mohamed13alaa12@gmail.com
-- ==============================================================================
-- Security Principle:
-- User authentication is handled exclusively by Supabase Auth (auth.users).
-- User authorization is verified through public.admin_users (user_id = auth.uid())
-- and JWT app_metadata.role = 'admin'.
--
-- This script safely links the user's stable UUID to the admin_users table
-- without hardcoding passwords, emails in application code, or altering schemas.
-- ==============================================================================

DO $$
DECLARE
    target_user_id UUID;
    target_email TEXT := 'mohamed13alaa12@gmail.com';
BEGIN
    -- 1. Locate user in auth.users (case-insensitive)
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE lower(email) = lower(target_email);

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User "%" not found in auth.users. Please create the user first in Supabase Dashboard (Authentication -> Users -> Add User) or via setup-admin script.', target_email;
    ELSE
        -- 2. Ensure public.admin_users table exists
        CREATE TABLE IF NOT EXISTS public.admin_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'admin',
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
        );

        -- 3. Insert or update Admin authorization record
        INSERT INTO public.admin_users (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

        -- 4. Sync app_metadata in auth.users for fast-path JWT role verification
        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
        WHERE id = target_user_id;

        RAISE NOTICE 'SUCCESS: User "%" (UUID: %) has been authorized as Administrator in public.admin_users.', target_email, target_user_id;
    END IF;
END $$;

-- 5. Verification Query: Confirm Administrator authorization status
SELECT
    u.id AS auth_user_id,
    u.email,
    u.created_at AS user_created_at,
    a.role AS admin_role,
    a.created_at AS authorized_at
FROM auth.users u
JOIN public.admin_users a ON u.id = a.user_id
WHERE lower(u.email) = lower('mohamed13alaa12@gmail.com');
