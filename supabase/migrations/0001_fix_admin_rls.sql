-- Fix privilege escalation in admin RLS policies.
--
-- The original "Admin read all …" policies keyed on `user_metadata`, which is
-- writable by the end user (supabase.auth.updateUser({ data: {...} })). Any
-- logged-in user could set user_metadata.is_admin = true and then read every
-- other user's responses and profile (email, name, call sign, address).
--
-- app_metadata can only be written with the service-role key (server side), so
-- it is safe to trust in an RLS policy. This migration repoints both admin
-- policies at app_metadata.

-- user_responses: admin read-all
drop policy if exists "Admin read all responses" on public.user_responses;
create policy "Admin read all responses"
  on public.user_responses
  for select
  using (
    coalesce(((auth.jwt() -> 'app_metadata' ->> 'is_admin'))::boolean, false)
  );

-- profiles: admin read-all
drop policy if exists "Admin read all profiles" on public.profiles;
create policy "Admin read all profiles"
  on public.profiles
  for select
  using (
    coalesce(((auth.jwt() -> 'app_metadata' ->> 'is_admin'))::boolean, false)
  );

-- ---------------------------------------------------------------------------
-- Granting admin (run manually in the SQL editor, which uses the service role).
-- app_metadata cannot be set from the client, so there is no self-promotion.
--
--   update auth.users
--      set raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
--    where email = 'you@example.com';
--
-- To revoke:
--
--   update auth.users
--      set raw_app_meta_data = raw_app_meta_data - 'is_admin'
--    where email = 'you@example.com';
--
-- After changing app_metadata the user must get a fresh JWT (sign out / in, or
-- let the token auto-refresh) before the new claim takes effect.
-- ---------------------------------------------------------------------------
