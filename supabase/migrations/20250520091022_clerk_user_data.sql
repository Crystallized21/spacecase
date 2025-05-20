create table users
(
    id         serial primary key,
    user_id    text not null unique     default auth.jwt() ->> 'sub', -- to get access to clerk user id
    name       text,
    email      text not null,
    role       text                     default 'student',
    created_at timestamp with time zone default now()
);

create table rooms
(
    id          text primary key, -- e.g. "waka-a"
    name        text not null,
    building    text not null,
    is_bookable boolean default true
);

create table bookings
(
    id            uuid primary key         default gen_random_uuid(),
    user_id       text references users (user_id),
    room_id       text references rooms (id),
    date          date not null,
    period        text not null, -- "P1", "P2", etc
    justification text,
    created_at    timestamp with time zone default now()
);

alter table bookings
    enable row level security;

create policy "Teachers can view all bookings"
    on bookings for select
    using (
    exists (select 1
            from users
            where user_id = auth.uid()::text
              and role = 'teacher')
    );

create policy "Only booking owner can insert bookings"
    on bookings for insert
    with check (
    auth.uid()::text = user_id
        and exists (select 1
                    from users
                    where user_id = auth.uid()::text
                      and role = 'teacher')
    );

create policy "Only booking owner can delete bookings"
    on bookings for delete
    using (
    auth.uid()::text = user_id
        and exists (select 1
                    from users
                    where user_id = auth.uid()::text
                      and role = 'teacher')
    );

