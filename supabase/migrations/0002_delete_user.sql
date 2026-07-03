-- In-app account deletion (Apple App Store Guideline 5.1.1(v) requires apps that
-- support account creation to also support account deletion from within the app).
--
-- The client uses the anon key and cannot delete its own auth.users row, so we
-- expose a SECURITY DEFINER function that a signed-in user can call via
-- supabase.rpc('delete_user'). It only ever deletes the CALLER's own data
-- (auth.uid()), so there is no way to delete another user's account.
--
-- Run this in the Supabase SQL editor (which executes as a privileged role, so
-- the function is owned by a role that can delete from auth.users).

create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Best-effort cleanup of this user's app data. Each delete is guarded so a
  -- renamed/absent table or column can't abort the whole deletion. Adjust the
  -- table/column names below if your schema differs.
  begin
    delete from public.practice_exam_questions
      where exam_id in (select id from public.practice_exams where user_id = uid);
  exception when undefined_table or undefined_column then null;
  end;

  begin
    delete from public.practice_exams where user_id = uid;
  exception when undefined_table or undefined_column then null;
  end;

  begin
    delete from public.user_responses where user_id = uid;
  exception when undefined_table or undefined_column then null;
  end;

  begin
    delete from public.profiles where id = uid;
  exception when undefined_table or undefined_column then null;
  end;

  -- Finally, the auth user itself.
  delete from auth.users where id = uid;
end;
$$;

-- Only signed-in users may call it; never anon or the public role.
revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;
