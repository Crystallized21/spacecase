create table subjects
(
    id         uuid primary key default gen_random_uuid(),
    code       text not null, -- e.g. "ENG1"
    name       text,
    teacher_id text references users (user_id) on delete cascade
);

create table commons
(
    id   uuid primary key default gen_random_uuid(),
    name text not null -- e.g punga
);

alter table rooms
    add column common_id uuid references commons (id) on delete set null;

alter table bookings
    add column subject_id uuid references subjects (id) on delete set null;

create table subject_common_access
(
    subject_id uuid references subjects (id) on delete cascade,
    common_id  uuid references commons (id) on delete cascade,
    primary key (subject_id, common_id)
);

alter table subjects
    drop column teacher_id;

create table subject_teachers
(
    subject_id uuid references subjects (id) on delete cascade,
    teacher_id text references users (user_id) on delete cascade,
    primary key (subject_id, teacher_id)
);

ALTER TABLE rooms
    ALTER COLUMN id TYPE uuid USING (gen_random_uuid());

alter table bookings
    alter column room_id type uuid using (gen_random_uuid());

ALTER TABLE rooms
    ALTER COLUMN id TYPE uuid USING (gen_random_uuid());

alter table bookings
    alter column room_id type text using (gen_random_uuid());

ALTER TABLE commons
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

INSERT INTO rooms (id, name, common_id)
VALUES (gen_random_uuid(), 'Inner Common 1', '7fc0deb1-8003-4341-a777-c8d859af7e5a'),
       (gen_random_uuid(), 'Inner Common 1', '314f8d80-12f9-49a6-882a-2a9737ef3238'),
       (gen_random_uuid(), 'Outer Common', '7fc0deb1-8003-4341-a777-c8d859af7e5a');

-- Insert rooms for each common
INSERT INTO rooms (id, name, common_id)
VALUES
-- Kahikatea
(gen_random_uuid(), 'Presentation Room', '314f8d80-12f9-49a6-882a-2a9737ef3238'),
(gen_random_uuid(), 'Inner Common 1', '314f8d80-12f9-49a6-882a-2a9737ef3238'),
(gen_random_uuid(), 'Inner Common 2', '314f8d80-12f9-49a6-882a-2a9737ef3238'),
(gen_random_uuid(), 'Outer Common', '314f8d80-12f9-49a6-882a-2a9737ef3238'),
(gen_random_uuid(), 'Pod', '314f8d80-12f9-49a6-882a-2a9737ef3238'),

-- Pukeko
(gen_random_uuid(), 'Presentation Room', '7fc0deb1-8003-4341-a777-c8d859af7e5a'),
(gen_random_uuid(), 'Inner Common 1', '7fc0deb1-8003-4341-a777-c8d859af7e5a'),
(gen_random_uuid(), 'Inner Common 2', '7fc0deb1-8003-4341-a777-c8d859af7e5a'),
(gen_random_uuid(), 'Outer Common', '7fc0deb1-8003-4341-a777-c8d859af7e5a'),
(gen_random_uuid(), 'Pod', '7fc0deb1-8003-4341-a777-c8d859af7e5a'),

-- Pungawerewere
(gen_random_uuid(), 'Presentation Room', 'a3e508bb-1c24-4eb4-9867-c9b590183624'),
(gen_random_uuid(), 'Inner Common 1', 'a3e508bb-1c24-4eb4-9867-c9b590183624'),
(gen_random_uuid(), 'Inner Common 2', 'a3e508bb-1c24-4eb4-9867-c9b590183624'),
(gen_random_uuid(), 'Outer Common', 'a3e508bb-1c24-4eb4-9867-c9b590183624'),
(gen_random_uuid(), 'Pod', 'a3e508bb-1c24-4eb4-9867-c9b590183624'),

-- Papatuanuku
(gen_random_uuid(), 'Presentation Room', 'e760a179-7c60-4de9-a805-34758dd887cf'),
(gen_random_uuid(), 'Inner Common 1', 'e760a179-7c60-4de9-a805-34758dd887cf'),
(gen_random_uuid(), 'Inner Common 2', 'e760a179-7c60-4de9-a805-34758dd887cf'),
(gen_random_uuid(), 'Outer Common', 'e760a179-7c60-4de9-a805-34758dd887cf'),
(gen_random_uuid(), 'Pod', 'e760a179-7c60-4de9-a805-34758dd887cf'),

-- Harekeke
(gen_random_uuid(), 'Presentation Room', '8b5dfb23-056c-434d-9317-deb1c8f1bdab'),
(gen_random_uuid(), 'Inner Common 1', '8b5dfb23-056c-434d-9317-deb1c8f1bdab'),
(gen_random_uuid(), 'Inner Common 2', '8b5dfb23-056c-434d-9317-deb1c8f1bdab'),
(gen_random_uuid(), 'Outer Common', '8b5dfb23-056c-434d-9317-deb1c8f1bdab'),
(gen_random_uuid(), 'Pod', '8b5dfb23-056c-434d-9317-deb1c8f1bdab'),

-- Mokorora
(gen_random_uuid(), 'Presentation Room', '7386e779-adaf-40de-898c-207aefe7f1bb'),
(gen_random_uuid(), 'Inner Common 1', '7386e779-adaf-40de-898c-207aefe7f1bb'),
(gen_random_uuid(), 'Inner Common 2', '7386e779-adaf-40de-898c-207aefe7f1bb'),
(gen_random_uuid(), 'Outer Common', '7386e779-adaf-40de-898c-207aefe7f1bb'),
(gen_random_uuid(), 'Pod', '7386e779-adaf-40de-898c-207aefe7f1bb'),

-- Waka
(gen_random_uuid(), 'Presentation Room', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af'),
(gen_random_uuid(), 'Inner Common 1', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af'),
(gen_random_uuid(), 'Inner Common 2', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af'),
(gen_random_uuid(), 'Outer Common', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af'),
(gen_random_uuid(), 'Pod', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af'),

-- Kea
(gen_random_uuid(), 'Presentation Room', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d'),
(gen_random_uuid(), 'Inner Common 1', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d'),
(gen_random_uuid(), 'Inner Common 2', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d'),
(gen_random_uuid(), 'Outer Common', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d'),
(gen_random_uuid(), 'Pod', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d');

-- For outside blocks
INSERT INTO rooms (id, name, common_id)
VALUES
-- Owhanga
(gen_random_uuid(), 'Owhanga 1', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
(gen_random_uuid(), 'Owhanga 2', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
(gen_random_uuid(), 'Owhanga 3', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
(gen_random_uuid(), 'Owhanga 4', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
(gen_random_uuid(), 'Owhanga 5', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
(gen_random_uuid(), 'Owhanga 6', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
(gen_random_uuid(), 'Owhanga 7', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
(gen_random_uuid(), 'Owhanga 8', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
(gen_random_uuid(), 'Owhanga 9', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
(gen_random_uuid(), 'Owhanga 10', '2594e0f4-89e8-4357-8f05-b54adacfd5f9'),
-- Puriri
(gen_random_uuid(), 'Puriri 1', '0875d62a-4b89-4ca1-b598-ecd27274f7f2'),
(gen_random_uuid(), 'Puriri 2', '0875d62a-4b89-4ca1-b598-ecd27274f7f2'),
(gen_random_uuid(), 'Puriri 3', '0875d62a-4b89-4ca1-b598-ecd27274f7f2'),
(gen_random_uuid(), 'Puriri 4', '0875d62a-4b89-4ca1-b598-ecd27274f7f2'),
(gen_random_uuid(), 'Puriri 5', '0875d62a-4b89-4ca1-b598-ecd27274f7f2'),
(gen_random_uuid(), 'Puriri 6', '0875d62a-4b89-4ca1-b598-ecd27274f7f2'),
(gen_random_uuid(), 'Puriri 7', '0875d62a-4b89-4ca1-b598-ecd27274f7f2'),
(gen_random_uuid(), 'Puriri 8', '0875d62a-4b89-4ca1-b598-ecd27274f7f2'),
(gen_random_uuid(), 'Puriri 9', '0875d62a-4b89-4ca1-b598-ecd27274f7f2'),
(gen_random_uuid(), 'Puriri 10', '0875d62a-4b89-4ca1-b598-ecd27274f7f2');


ALTER TABLE rooms
    ADD COLUMN type TEXT CHECK (type IN ('standard', 'fixed')) DEFAULT 'standard';

alter table users
    add column teacher_code text unique;

insert into users (id, user_id, name, email, role, created_at, teacher_code)
values (default, gen_random_uuid(), 'Neil Bather', 'nbather@ormiston.school.nz', 'teacher', now(), 'BE'),
       (default, gen_random_uuid(), 'Shalu Aara', 'saara@ormiston.school.nz', 'teacher', now(), 'AX'),
       (default, gen_random_uuid(), 'Sheenal Chandra', 'schandra@ormiston.school.nz', 'teacher', now(), 'CX'),
       (default, gen_random_uuid(), 'Shirley Closey', 'sclosey@ormiston.school.nz', 'teacher', now(), 'CS'),
       (default, gen_random_uuid(), 'Nicole DaSilva', 'ndasilva@ormiston.school.nz', 'teacher', now(), 'DA'),
       (default, gen_random_uuid(), 'Angela Finestone', 'afinestone@ormiston.school.nz', 'teacher', now(), 'FE'),
       (default, gen_random_uuid(), 'Andrew Johnson', 'ajohnson@ormiston.school.nz', 'teacher', now(), 'JN'),
       (default, gen_random_uuid(), 'Rajesh Joshi', 'rjoshi@ormiston.school.nz', 'teacher', now(), 'JI'),
       (default, gen_random_uuid(), 'Kylie Nguyen', 'knguyen@ormiston.school.nz', 'teacher', now(), 'NN'),
       (default, gen_random_uuid(), 'Swati Patel', 'spatel@ormiston.school.nz', 'teacher', now(), 'PL');

insert into users (id, user_id, name, email, role, created_at, teacher_code)
values (default, gen_random_uuid(), 'Neil Bather', 'nbather@ormiston.school.nz', 'teacher', now(), null),
       (default, gen_random_uuid(), 'Shalu Aara', 'saara@ormiston.school.nz', 'teacher', now(), null),
       (default, gen_random_uuid(), 'Sheenal Chandra', 'schandra@ormiston.school.nz', 'teacher', now(), null),
       (default, gen_random_uuid(), 'Shirley Closey', 'sclosey@ormiston.school.nz', 'teacher', now(), null),
       (default, gen_random_uuid(), 'Nicole DaSilva', 'ndasilva@ormiston.school.nz', 'teacher', now(), null),
       (default, gen_random_uuid(), 'Angela Finestone', 'afinestone@ormiston.school.nz', 'teacher', now(), null),
       (default, gen_random_uuid(), 'Andrew Johnson', 'ajohnson@ormiston.school.nz', 'teacher', now(), null),
       (default, gen_random_uuid(), 'Rajesh Joshi', 'rjoshi@ormiston.school.nz', 'teacher', now(), null),
       (default, gen_random_uuid(), 'Kylie Nguyen', 'knguyen@ormiston.school.nz', 'teacher', now(), null),
       (default, gen_random_uuid(), 'Swati Patel', 'spatel@ormiston.school.nz', 'teacher', now(), null);

insert into teacher_codes (name, username, code)
values ('Neil Bather', 'nbather', 'BE'),
       ('Shalu Aara', 'saara', 'AX'),
       ('Sheenal Chandra', 'schandra', 'CX'),
       ('Shirley Closey', 'sclosey', 'CS'),
       ('Nicole DaSilva', 'ndasilva', 'DA'),
       ('Angela Finestone', 'afinestone', 'FE'),
       ('Andrew Johnson', 'ajohnson', 'JN'),
       ('Rajesh Joshi', 'rjoshi', 'JI'),
       ('Kylie Nguyen', 'knguyen', 'NN'),
       ('Swati Patel', 'spatel', 'PL'),
       ('Christopher Pretty', 'cpretty', 'PY');

UPDATE users
SET teacher_code = tc.code
FROM teacher_codes tc
WHERE users.name = tc.name
  AND users.role = 'teacher';

CREATE TABLE temp_class_data
(
    class_code   TEXT,
    class_name   TEXT,
    subject_name TEXT,
    teacher_code TEXT
);

SELECT DISTINCT s.id      AS subject_id,
                u.user_id AS teacher_id
FROM staging_class_data t
         JOIN subjects s ON s.name = t.subject_name
         JOIN users u ON u.teacher_code = t.teacher_code
WHERE u.role = 'teacher';

SELECT DISTINCT s.id      AS subject_id,
                u.user_id AS teacher_id
FROM staging_class_data t
         JOIN subjects s ON LOWER(TRIM(s.name)) = LOWER(TRIM(t.subject_name))
         JOIN users u ON TRIM(u.teacher_code) = TRIM(t.teacher_code)
WHERE u.role = 'teacher';


-- alan's script :3 to insert teacher_id and subject_id into subject_teachers
-- INSERT INTO subject_teachers
SELECT
    DISTINCT
--     u.teacher_code AS user_code,
--     t.teacher_code AS temp_code
--     t.teacher_code AS temp_code, -- provided code
-- t.class_code, -u.user_id AS teacher_ID,
-- guid teacher ID- provided class code
        s.id as subject_ID -- guid subject ID
    ,   u.user_id AS teacher_ID -- guid teacher ID
FROM staging_class_data t
    INNER JOIN users u ON TRIM(u.teacher_code) = TRIM(t.teacher_code)
    INNER JOIN subjects s ON s.code = t.class_code
--     INNER JOIN (SELECT teacher_ID FROM subject_teachers) as a
--         ON a.teacher_id != u.user_id;
WHERE u.user_id NOT IN (SELECT teacher_ID FROM subject_teachers);


SELECT DISTINCT s.id      AS subject_id,
                u.user_id AS teacher_id
FROM staging_class_data t
         JOIN subjects s ON LOWER(TRIM(s.name)) = LOWER(TRIM(t.subject_name))
         JOIN users u ON TRIM(u.teacher_code) = TRIM(t.teacher_code)
WHERE u.role = 'teacher';


SELECT DISTINCT s.name         AS subject_in_db,
                t.subject_name AS subject_in_temp
FROM staging_class_data t
         LEFT JOIN subjects s ON LOWER(TRIM(s.name)) = LOWER(TRIM(t.subject_name))
WHERE s.id IS NULL;

CREATE TABLE slots (
  id SERIAL PRIMARY KEY,
  slot_number INTEGER UNIQUE -- 1 to 9
);

CREATE TABLE slot_times (
  id SERIAL PRIMARY KEY,
  slot_number INTEGER REFERENCES slots(slot_number),
  weekday TEXT CHECK (weekday IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  start_time TIME,
  end_time TIME,
  UNIQUE (slot_number, weekday)
);

CREATE TABLE lines (
  id SERIAL PRIMARY KEY,
  line_number INTEGER UNIQUE -- 1 to 5
);

CREATE TABLE line_slots
(
    id          SERIAL PRIMARY KEY,
    line_number INTEGER REFERENCES lines (line_number),
    weekday     TEXT CHECK (weekday IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
    slot_number INTEGER REFERENCES slots (slot_number),
    UNIQUE (line_number, weekday)
);

ALTER TABLE subjects ADD COLUMN line_number INTEGER REFERENCES lines(line_number);

CREATE TABLE subject_lines (
  id SERIAL PRIMARY KEY,
  teacher_id UUID REFERENCES users(user_id),
  subject_id UUID REFERENCES subjects(id),
  line_number INTEGER REFERENCES lines(line_number),
  UNIQUE (teacher_id, subject_id, line_number)
);
