-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text not null,
  email       text not null,
  phone       text,
  avatar_url  text,
  role        text not null default 'student' check (role in ('admin', 'student')),
  status      text not null default 'pending' check (status in ('pending', 'active', 'inactive')),
  invited_at  timestamptz,
  activated_at timestamptz,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admin can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'status', 'pending')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- INVITATIONS
-- ─────────────────────────────────────────────
create table public.invitations (
  id          uuid primary key default uuid_generate_v4(),
  token       text unique not null default encode(gen_random_bytes(32), 'hex'),
  email       text,
  phone       text,
  name        text,
  created_by  uuid references public.profiles,
  used_at     timestamptz,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  status      text not null default 'pending' check (status in ('pending', 'used', 'expired')),
  created_at  timestamptz default now()
);

alter table public.invitations enable row level security;

create policy "Admin can manage invitations"
  on public.invitations for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Public can read invitation by token"
  on public.invitations for select
  using (true);

-- ─────────────────────────────────────────────
-- USER BODY PROFILES (onboarding)
-- ─────────────────────────────────────────────
create table public.user_body_profiles (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid unique references public.profiles on delete cascade,
  birth_date            date,
  sex                   text check (sex in ('male', 'female')),
  height_cm             numeric(5,1),
  initial_weight_kg     numeric(5,2),
  goal                  text check (goal in ('lose_fat', 'gain_muscle', 'maintain', 'endurance')),
  activity_level        text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  dietary_preferences   text[],
  dietary_restrictions  text,
  target_weight_kg      numeric(5,2),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

alter table public.user_body_profiles enable row level security;

create policy "Users can manage own body profile"
  on public.user_body_profiles for all
  using (auth.uid() = user_id);

create policy "Admin can read all body profiles"
  on public.user_body_profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- BODY MEASUREMENTS
-- ─────────────────────────────────────────────
create table public.body_measurements (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.profiles on delete cascade,
  measured_at   date not null,
  weight_kg     numeric(5,2),
  neck_cm       numeric(5,1),
  waist_cm      numeric(5,1),
  hip_cm        numeric(5,1),
  bicep_cm      numeric(5,1),
  thigh_cm      numeric(5,1),
  body_fat_pct  numeric(4,1),
  notes         text,
  photo_url     text,
  created_at    timestamptz default now()
);

alter table public.body_measurements enable row level security;

create policy "Users can manage own measurements"
  on public.body_measurements for all
  using (auth.uid() = user_id);

create policy "Admin can read all measurements"
  on public.body_measurements for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- SCHEDULE SESSIONS
-- ─────────────────────────────────────────────
create table public.schedule_sessions (
  id                  uuid primary key default uuid_generate_v4(),
  week_start          date not null,
  day_of_week         int not null check (day_of_week between 1 and 6),
  time_block          text not null check (time_block in ('morning_a', 'morning_b', 'evening_a', 'evening_b', 'special')),
  title               text not null,
  description         text,
  level               text check (level in ('beginner', 'intermediate', 'advanced', 'all')),
  materials           text,
  location            text default 'Parque Las Américas',
  is_cancelled        boolean default false,
  cancellation_note   text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (week_start, day_of_week, time_block)
);

alter table public.schedule_sessions enable row level security;

create policy "Everyone can read sessions"
  on public.schedule_sessions for select
  using (auth.uid() is not null);

create policy "Admin can manage sessions"
  on public.schedule_sessions for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────────
create table public.attendance (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references public.profiles on delete cascade,
  session_id      uuid references public.schedule_sessions on delete cascade,
  checked_in_at   timestamptz default now(),
  unique (user_id, session_id)
);

alter table public.attendance enable row level security;

create policy "Users can manage own attendance"
  on public.attendance for all
  using (auth.uid() = user_id);

create policy "Admin can read all attendance"
  on public.attendance for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- POSTS (feed)
-- ─────────────────────────────────────────────
create table public.posts (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid references public.profiles on delete cascade,
  content     text not null,
  image_url   text,
  post_type   text not null default 'general'
                check (post_type in ('general', 'motivation', 'result', 'nutrition', 'announcement')),
  is_pinned   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Active users can read posts"
  on public.posts for select
  using (auth.uid() is not null);

create policy "Admin can manage posts"
  on public.posts for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- POST REACTIONS
-- ─────────────────────────────────────────────
create table public.post_reactions (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid references public.posts on delete cascade,
  user_id     uuid references public.profiles on delete cascade,
  emoji       text not null check (emoji in ('💪', '🔥', '❤️', '👏')),
  created_at  timestamptz default now(),
  unique (post_id, user_id, emoji)
);

alter table public.post_reactions enable row level security;

create policy "Users can manage own reactions"
  on public.post_reactions for all
  using (auth.uid() = user_id);

create policy "All can read reactions"
  on public.post_reactions for select
  using (auth.uid() is not null);

-- ─────────────────────────────────────────────
-- POST COMMENTS
-- ─────────────────────────────────────────────
create table public.post_comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid references public.posts on delete cascade,
  author_id   uuid references public.profiles on delete cascade,
  parent_id   uuid references public.post_comments,
  content     text not null,
  is_deleted  boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.post_comments enable row level security;

create policy "Active users can read comments"
  on public.post_comments for select
  using (auth.uid() is not null);

create policy "Users can insert own comments"
  on public.post_comments for insert
  with check (auth.uid() = author_id);

create policy "Users can update own comments"
  on public.post_comments for update
  using (auth.uid() = author_id);

create policy "Admin can update any comment"
  on public.post_comments for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- PUSH SUBSCRIPTIONS
-- ─────────────────────────────────────────────
create table public.push_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth_key    text not null,
  created_at  timestamptz default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "Users can manage own subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id);

create policy "Admin can read all subscriptions"
  on public.push_subscriptions for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- NOTIFICATIONS LOG
-- ─────────────────────────────────────────────
create table public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles on delete cascade,
  type        text not null,
  title       text not null,
  body        text not null,
  data        jsonb,
  sent_at     timestamptz,
  read_at     timestamptz,
  created_at  timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

create policy "Admin can manage all notifications"
  on public.notifications for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
