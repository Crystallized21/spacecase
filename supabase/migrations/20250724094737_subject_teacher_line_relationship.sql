-- 1. Add line_number column (nullable for now)
ALTER TABLE public.subject_teachers
    ADD COLUMN line_number integer;

-- 2. Drop the existing primary key constraint
ALTER TABLE public.subject_teachers
    DROP CONSTRAINT subject_teachers_pkey;

-- 3. Add new primary key including line_number
ALTER TABLE public.subject_teachers
    ADD CONSTRAINT subject_teachers_pkey PRIMARY KEY (subject_id, teacher_id, line_number);

-- 4. Add foreign key constraint for line_number
ALTER TABLE public.subject_teachers
    ADD CONSTRAINT subject_teachers_line_number_fkey FOREIGN KEY (line_number) REFERENCES public.lines (line_number);


-- Run this query to PREVIEW the data before inserting.
-- Step 1: Create the raw_teachers table
create temporary table raw_teachers
(
    teacher          text,
    "username/email" text,
    code             text,
    subject1         text,
    line1            int,
    subject2         text,
    line2            int,
    subject3         text,
    line3            int,
    subject4         text,
    line4            int
);

-- Step 2: Insert your data
insert into raw_teachers
values ('Neil Bather', 'nbather', 'BE', 'ENG1A', 81, 'MED2', 2, 'MED1', 83, 'ENG1A', 85),
       ('Shalu Aara', 'saara', 'AX', 'ENG1A', 82, 'ENG3', 3, 'ENG3', 4, 'ENG2', 5),
       ('Sheenal Chandra', 'schandra', 'CX', 'ENG2', 1, 'ENP23', 2, 'ENG1', 83, 'ENP23', 5),
       ('Nicole DaSilva', 'ndasilva', 'DA', 'ENG3', 2, 'ENG3', 5, 'ENG3', 2, null, null),
       ('Angela Finestone', 'afinestone', 'FE', 'ENP23', 1, 'ENG1A', 82, 'ENP23', 3, 'ENG2', 4),
       ('Andrew Johnson', 'ajohnson', 'JN', 'ENG1A', 82, 'MED3', 4, 'MED3', 5, null, null),
       ('Rajesh Joshi', 'rjoshi', 'JI', 'ESL', 1, 'ESL', 3, 'ENG1A', 84, 'ESL', 5),
       ('Kylie Nguyen', 'knguyen', 'NN', 'ELL', 81, 'ELL', 82, 'ESL', 3, 'ESL', 5),
       ('Swati Patel', 'spatel', 'PL', 'ENG2', 2, 'ENG2', 5, 'ENG1A', 84, null, null),
       ('Christopher Pretty', 'cpretty', 'PY', 'ENG1A', 82, 'ENG1A', 83, 'ENP23', 4, 'ENP23', 5);

-- Step 3: Query to get user_id, id, and lines
with exploded as (
    select
        u.user_id,
        u.id,
        s.subject,
        s.line
    from raw_teachers rt
             join users u on split_part(u.email, '@', 1) = rt."username/email"
             join lateral (
        select *
        from unnest(
                     array[rt.subject1, rt.subject2, rt.subject3, rt.subject4],
                     array[rt.line1, rt.line2, rt.line3, rt.line4]
             ) as s(subject, line)
        ) s on true
)
select
    user_id,
    id,
    line
from exploded
where subject not ilike '%1%' and line < 81;