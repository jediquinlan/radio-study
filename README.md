# Roger That Radio

Amateur radio license study app for iOS and Android. Covers Technician, General, and Extra class question pools.

Built by KC1YWN

## Project Structure

```
apps/mobile/    Expo React Native app (iOS + Android)
apps/web/       Vite React web app (admin dashboard, email confirmation)
packages/ui/    Shared UI components and theme
```

The animated character lives in a separate repo: [radio-character](https://github.com/jediquinlan/radio-character), installed as a GitHub dependency.

## Prerequisites

- Node.js 18+
- Yarn 4 (corepack enabled: `corepack enable`)
- Xcode 16+ (for iOS builds)
- Android Studio (for Android builds)
- A [Supabase](https://supabase.com) project (free tier works)

## 1. Supabase Setup

Create a new Supabase project, then run **all of this SQL in one go** in the **SQL Editor**:

```sql
-- =============================================
-- Run this entire block in one SQL Editor call
-- =============================================

-- 1. Question response tracking
create table public.user_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  question_id text not null,
  pool_id text not null,
  is_correct boolean not null,
  answered_at timestamptz default now()
);
create index on public.user_responses (user_id, question_id);
create index on public.user_responses (user_id, pool_id);

-- 2. Practice exams
create table public.practice_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  pool_id text not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  score int,
  total int
);

create table public.practice_exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.practice_exams(id) on delete cascade,
  question_id text not null,
  answer_order int[],
  user_answer int,
  is_correct boolean
);

-- 3. User profiles (synced from auth.users for admin panel)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  call_sign text,
  first_name text,
  last_name text
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, call_sign, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'call_sign',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Row Level Security
alter table public.user_responses enable row level security;
alter table public.practice_exams enable row level security;
alter table public.practice_exam_questions enable row level security;
alter table public.profiles enable row level security;

-- Users can access their own data
create policy "Own responses" on public.user_responses for all using (auth.uid() = user_id);
create policy "Own exams" on public.practice_exams for all using (auth.uid() = user_id);
create policy "Own exam questions" on public.practice_exam_questions for all
  using (exam_id in (select id from public.practice_exams where user_id = auth.uid()));
create policy "Own profile" on public.profiles for all using (auth.uid() = id);

-- Admins can read all data (for web admin panel)
create policy "Admin read all responses" on public.user_responses
  for select using (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
create policy "Admin read all exams" on public.practice_exams
  for select using (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
create policy "Admin read all profiles" on public.profiles
  for select using (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
  );
```

### Make a user an admin

Run this in the SQL Editor (replace the email):

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE email = 'you@example.com';
```

### Backfill profiles for existing users

If you already have users before adding the profiles table, run:

```sql
insert into public.profiles (id, email, call_sign, first_name, last_name)
select
  id, email,
  raw_user_meta_data ->> 'call_sign',
  raw_user_meta_data ->> 'first_name',
  raw_user_meta_data ->> 'last_name'
from auth.users
on conflict (id) do nothing;
```

### Supabase Auth settings

In the Supabase dashboard:

1. **Auth > URL Configuration > Site URL**: Set to your deployed web URL
2. **Auth > URL Configuration > Redirect URLs**: Add `https://yourdomain.com/confirmed`

Admin users see an "Admin Panel" button on the web dashboard that shows all users' progress.

## 2. Environment Variables

Create two `.env` files (these are gitignored and must NOT be committed):

**`apps/mobile/.env`**

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_WEB_URL=https://your-website-domain.com
```

**`apps/web/.env`**

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Find your Supabase URL and anon key in: **Supabase Dashboard > Settings > API**.

The anon key is a _public_ key (safe for client-side use). Supabase uses Row Level Security to protect data, not the key itself. Still, keep `.env` files out of version control.

To share credentials with collaborators, use a secure channel (1Password, encrypted message, etc.) — never commit `.env` files.

## 3. Install Dependencies

```bash
git clone <this-repo>
cd radio-lingo
corepack enable
yarn install
```

The `@radio-lingo/character` package is installed automatically from GitHub during `yarn install`.

## 4. Run the Mobile App

Expo Go does **not** work — you must use a development build.

### First time (native build required)

```bash
yarn mobile:prebuild && yarn mobile:fix-splash && yarn mobile:ios
```

This generates the iOS project, fixes the splash screen, and builds to a connected device or simulator.

For Android:

```bash
npx expo run:android --device
```

### After first install

Just start Metro:

```bash
yarn mobile:tunnel
```

Then open the Roger That Radio app on your phone/simulator.

### When to rebuild

You need `yarn mobile:prebuild && yarn mobile:fix-splash && yarn mobile:ios` again when:

- Native dependencies change (adding/removing packages with native code)
- `app.json` config changes (app name, icon, splash, bundle ID)
- Expo SDK upgrades

JavaScript-only changes just need a Metro reload.

## 5. Build and Deploy the Website

### Build

```bash
yarn build:web
```

Output goes to `apps/web/dist/`.

### Host on AWS S3 + CloudFront

1. Create an S3 bucket with **Static website hosting** enabled
2. Set **Index document** to `index.html`
3. Set **Error document** to `index.html` (required for SPA routing — `/confirmed` etc.)
4. Upload the contents of `apps/web/dist/` to the bucket
5. Set the bucket policy to allow public reads
6. Create a **CloudFront** distribution pointing to the S3 bucket (needed for HTTPS)
7. Set CloudFront's default root object to `index.html`
8. Add a custom error response: 403/404 -> `/index.html` with 200 status

Other hosting options (Vercel, Netlify, Cloudflare Pages) also work — they handle SPA routing automatically.

### Configure Supabase for the website

In the Supabase dashboard:

1. **Auth > URL Configuration > Site URL**: Set to your deployed URL
2. **Auth > URL Configuration > Redirect URLs**: Add `https://yourdomain.com/confirmed`

This makes email confirmation work — users click the link in their email and land on a confirmation page on your website.

## Available Scripts

| Command                  | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `yarn mobile:tunnel`     | Start Metro bundler with tunnel (for phone testing) |
| `yarn mobile:prebuild`   | Generate native iOS/Android projects                |
| `yarn mobile:fix-splash` | Fix splash screen after prebuild                    |
| `yarn mobile:ios`        | Build and run on iOS device                         |
| `yarn mobile:rebuild`    | Full rebuild: prebuild + fix-splash + ios           |
| `yarn web`               | Start web dev server                                |
| `yarn build:web`         | Build web app for production                        |

## Question Pools

Question data lives in `apps/mobile/assets/images/data/` as JSON files:

- `technician-2022-2026.json` + `-syllabus.json` + `-hints.json` + `-book-references.json`
- `general-2023-2027.json` + `-syllabus.json` + `-hints.json` + `-book-references.json`
- `extra-2024-2028.json` + `-syllabus.json` + `-hints.json` + `-book-references.json`

To update pools, replace the JSON files with new NCVEC data in the same format.

### Book References

Each pool has a `-book-references.json` file that maps questions to study guide chapters. Format:

```json
[
  {
    "question": "T1A01",
    "chapter": 7,
    "section": 2,
    "page": null,
    "book": "ARRL Ham Radio License Manual"
  }
]
```
