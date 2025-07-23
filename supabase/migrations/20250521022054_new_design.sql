DO
$$
    DECLARE
        r RECORD;
    BEGIN
        -- Drop all tables
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
            LOOP
                EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
    END
$$;

create table teacher_codes
(
    id       serial primary key,
    name     text,
    username text,
    code     text unique
);

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

create table users
(
    id           uuid primary key     default gen_random_uuid(),
    user_id      text unique,
    name         text        not null,
    email        text        not null,
    role         text        not null,
    created_at   timestamptz not null default now(),
    teacher_code text references teacher_codes (code)
);

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

create table staging_class_data
(
    class_code   text,
    class_name   text,
    subject_name text,
    teacher_code text
);

INSERT INTO "public"."staging_class_data" ("class_code", "class_name", "subject_name", "teacher_code")
VALUES ('ACC2', 'Accounting 2', 'Social Science', 'TA'),
       ('ACC2', 'Accounting 2', 'Social Science', 'KC'),
       ('ACC3', 'Accounting 3', 'Social Science', 'CC'),
       ('ACC3', 'Accounting 3', 'Social Science', 'TA'),
       ('BIO2', 'Biology 2', 'Science', 'TN'),
       ('BIO2', 'Biology 2', 'Science', 'RE'),
       ('BIO2', 'Biology 2', 'Science', 'RY'),
       ('BIO2', 'Biology 2', 'Science', 'JH'),
       ('BIO2', 'Biology 2', 'Science', 'JH'),
       ('BIO2', 'Biology 2', 'Science', 'RY'),
       ('BIO3', 'Biology 3', 'Science', 'RY'),
       ('BIO3', 'Biology 3', 'Science', 'LH'),
       ('BIO3', 'Biology 3', 'Science', 'LH'),
       ('BIO3', 'Biology 3', 'Science', 'TN'),
       ('BUS2', 'Business Studies 2', 'Social Science', 'SZ'),
       ('BUS2', 'Business Studies 2', 'Social Science', 'SX'),
       ('BUS2', 'Business Studies 2', 'Social Science', 'DO'),
       ('BUS2', 'Business Studies 2', 'Social Science', 'KN'),
       ('BUS2', 'Business Studies 2', 'Social Science', 'JU'),
       ('BUS3', 'Business Studies 3', 'Social Science', 'SX'),
       ('BUS3', 'Business Studies 3', 'Social Science', 'DO'),
       ('BUS3', 'Business Studies 3', 'Social Science', 'JU'),
       ('BUS3', 'Business Studies 3', 'Social Science', 'SZ'),
       ('CAL3', 'Calculus 3', 'Mathematics', 'AI'),
       ('CAL3', 'Calculus 3', 'Mathematics', 'LX'),
       ('CAL3', 'Calculus 3', 'Mathematics', 'LS'),
       ('CAL3', 'Calculus 3', 'Mathematics', 'PI'),
       ('CAL3', 'Calculus 3', 'Mathematics', 'SI'),
       ('CARCS', 'Careers Customer Service', 'Pathways', 'DALY'),
       ('CARDL', 'STAR Drivers Licence', 'Pathways', 'DALY'),
       ('CARFA', 'First Aid', 'Pathways', 'DALY'),
       ('CARHS1', 'Health and Safety 1', 'Pathways', 'DALY'),
       ('CARHS2', 'Health and Safety 2', 'Pathways', 'DALY'),
       ('CARHS3', 'Health and Safety 3', 'Pathways', 'DALY'),
       ('CHE 2.00', 'Chemistry 2', 'Science', 'KO'),
       ('CHE 2.00', 'Chemistry 2', 'Science', 'LM'),
       ('CHE 2.00', 'Chemistry 2', 'Science', 'DG'),
       ('CHE 2.00', 'Chemistry 2', 'Science', 'DG'),
       ('CHE 2.00', 'Chemistry 2', 'Science', 'NS'),
       ('CHE 2.00', 'Chemistry 2', 'Science', 'LM'),
       ('CHE 3.00', 'Chemistry 3', 'Science', 'KO'),
       ('CHE 3.00', 'Chemistry 3', 'Science', 'LM'),
       ('CHE 3.00', 'Chemistry 3', 'Science', 'NS'),
       ('CHE 3.00', 'Chemistry 3', 'Science', 'KO'),
       ('CHE 3.00', 'Chemistry 3', 'Science', 'DG'),
       ('COT2', 'Construction Technology', 'Technology', 'RO'),
       ('COT2', 'Construction Technology', 'Technology', 'RO'),
       ('CSC2', 'Computer Science', 'Technology', 'AR'),
       ('CSC2', 'Computer Science', 'Technology', 'BRD'),
       ('CSC3', 'Computer Science', 'Technology', 'AR'),
       ('CSC3', 'Computer Science', 'Technology', 'AR'),
       ('DAN2', 'Dance', 'Art', 'SL'),
       ('DAN3', 'DANCE 3', 'Art', 'SL'),
       ('DES2', 'Design 2', 'Art', 'RS'),
       ('DES2', 'Design 2', 'Art', 'DR'),
       ('DES3', 'Design 3', 'Art', 'HS'),
       ('DES3', 'Design 3', 'Art', 'HS'),
       ('DRA2', 'Drama 2', 'Art', 'SC'),
       ('DRA3', 'Drama 3', 'Art', 'SC'),
       ('DVC2', 'Design & Visual Communication 2', 'Technology', 'MG'),
       ('DVC2', 'Design & Visual Communication 2', 'Technology', 'MG'),
       ('DVC2', 'Design & Visual Communication 2', 'Technology', 'EA'),
       ('DVC3', 'Design & Visual Communication 3', 'Technology', 'MG'),
       ('DVC3', 'Design & Visual Communication 3', 'Technology', 'MG'),
       ('DVC3', 'Design & Visual Communication 3', 'Technology', 'IE'),
       ('EAP', 'English for academic purposes', 'English', 'AA'),
       ('ECO2', 'Economics 2', 'Social Science', 'KC'),
       ('ECO2', 'Economics 2', 'Social Science', 'ST'),
       ('ECO3', 'Economics 3', 'Social Science', 'CC'),
       ('ECO3', 'Economics 3', 'Social Science', 'ST'),
       ('EFS3', 'Education For Sustainability 3', 'Social Science', 'HY'),
       ('ENG2', 'English 2', 'English', 'SN'),
       ('ENG2', 'English 2', 'English', 'RN'),
       ('ENG2', 'English 2', 'English', 'PL'),
       ('ENG2', 'English 2', 'English', 'PL'),
       ('ENG2', 'English 2', 'English', 'FE'),
       ('ENG2', 'English 2', 'English', 'CX'),
       ('ENG2', 'English 2', 'English', 'SN'),
       ('ENG2', 'English 2', 'English', 'TE'),
       ('ENG2', 'English 2', 'English', 'BA'),
       ('ENG2', 'English 2', 'English', 'BA'),
       ('ENG2', 'English 2', 'English', 'AX'),
       ('ENG2', 'English 2', 'English', 'AD'),
       ('ENG2', 'English 2', 'English', 'AB'),
       ('ENG2', 'English 2', 'English', 'AB'),
       ('ENG2', 'English 2', 'English', 'RN'),
       ('ENG3', 'English 3', 'English', 'DA'),
       ('ENG3', 'English 3', 'English', 'TE'),
       ('ENG3', 'English 3', 'English', 'AX'),
       ('ENG3', 'English 3', 'English', 'AX'),
       ('ENG3', 'English 3', 'English', 'GAIL'),
       ('ENG3', 'English 3', 'English', 'DA'),
       ('ENP23', 'English Projects', 'English', 'GAIL'),
       ('ENP23', 'English Projects', 'English', 'GAIL'),
       ('ENP23', 'English Projects', 'English', 'AB'),
       ('ENP23', 'English Projects', 'English', 'CX'),
       ('ENP23', 'English Projects', 'English', 'PY'),
       ('ENP23', 'English Projects', 'English', 'PY'),
       ('ENP23', 'English Projects', 'English', 'CX'),
       ('ENP23', 'English Projects', 'English', 'FE'),
       ('ENP23', 'English Projects', 'English', 'FE'),
       ('ENP23', 'English Projects', 'English', 'AB'),
       ('ESL', 'English for Speakers of Other Languages', 'ESOL', 'JI'),
       ('ESL', 'English for Speakers of Other Languages', 'ESOL', 'NN'),
       ('ESL', 'English for Speakers of Other Languages', 'ESOL', 'NN'),
       ('ESL', 'English for Speakers of Other Languages', 'ESOL', 'XG'),
       ('ESL', 'English for Speakers of Other Languages', 'ESOL', 'AA'),
       ('ESL', 'English for Speakers of Other Languages', 'ESOL', 'JI'),
       ('ESL', 'English for Speakers of Other Languages', 'ESOL', 'JI'),
       ('ESL', 'English for Speakers of Other Languages', 'ESOL', 'AA'),
       ('FIN2', 'Financial Literacy 2', 'Social Science', 'LE'),
       ('FIN3', 'Financial Literacy 3', 'Social Science', 'SZ'),
       ('FIN3', 'Financial Literacy 3', 'Social Science', 'ST'),
       ('GEO2', 'Geography 2', 'Social Science', 'VK'),
       ('GEO3', 'Geography 3', 'Social Science', 'HY'),
       ('GEO3', 'Geography 3', 'Social Science', 'HY'),
       ('GTWAY', 'Pathways and Gateway', 'Pathways', 'DALY'),
       ('HEA2', 'Health 2', 'Physical Education & Health', 'CO'),
       ('HEA2', 'Health 2', 'Physical Education & Health', 'RR'),
       ('HEA2', 'Health 2', 'Physical Education & Health', 'GL'),
       ('HEA3', 'Health 3', 'Physical Education & Health', 'CN'),
       ('HEA3', 'Health 3', 'Physical Education & Health', 'CL'),
       ('HEA3', 'Health 3', 'Physical Education & Health', 'GT'),
       ('HEA3', 'Health 3', 'Physical Education & Health', 'AU'),
       ('HIS2', 'History 2', 'Social Science', 'GD'),
       ('HIS2', 'History 2', 'Social Science', 'MT'),
       ('HIS3', 'History 3', 'Social Science', 'MT'),
       ('HIS3', 'History 3', 'Social Science', 'GD'),
       ('HOS2', 'Hospitality and Culinary 2', 'Technology', 'GO'),
       ('HOS2', 'Hospitality and Culinary 2', 'Technology', 'CA'),
       ('HOS2', 'Hospitality and Culinary 2', 'Technology', 'GO'),
       ('HOS3', 'Hospitality and Culinary 3', 'Technology', 'CA'),
       ('HOS3', 'Hospitality and Culinary 3', 'Technology', 'CA'),
       ('MAO2', 'Te Reo Maori', 'English', 'RP'),
       ('MAO3', 'Te Reo Maori', 'English', 'RP'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'YA'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'SI'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'DI'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'PI'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'CH'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'PH'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'PC'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'LX'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'AS'),
       ('MAT2', 'Mathematics 2', 'Mathematics', 'YA'),
       ('MAT3', 'Mathematics 3', 'Mathematics', 'YE'),
       ('MAT3', 'Mathematics 3', 'Mathematics', 'DI'),
       ('MAT3', 'Mathematics 3', 'Mathematics', 'LU'),
       ('MAT3', 'Mathematics 3', 'Mathematics', 'LX'),
       ('MAT3', 'Mathematics 3', 'Mathematics', 'PR'),
       ('MED2', 'Media Studies 2', 'English', 'BE'),
       ('MED3', 'Media Studies 3', 'English', 'JN'),
       ('MED3', 'Media Studies 3', 'English', 'JN'),
       ('MUS2', 'Music 2', 'Art', 'RM'),
       ('MUS2', 'Music 2', 'Art', 'GT'),
       ('MUS3', 'Music 3', 'Art', 'GT'),
       ('MUS3', 'Music 3', 'Art', 'RM'),
       ('OED2', 'Outdoor Education 2', 'Physical Education & Health', 'CL'),
       ('OED2', 'Outdoor Education 2', 'Physical Education & Health', 'AU'),
       ('OED3', 'Outdoor Education 3', 'Physical Education & Health', 'CL'),
       ('OED3', 'Outdoor Education 3', 'Physical Education & Health', 'AU'),
       ('PAI2', 'Painting 2', 'Art', 'HN'),
       ('PAI2', 'Painting 2', 'Art', 'DR'),
       ('PAI3', 'Painting 3', 'Art', 'SA'),
       ('PAI3', 'Painting 3', 'Art', 'DR'),
       ('PAS2', 'Pacific Studies 2', 'Social Science', 'KN'),
       ('PAS3', 'Pacific Studies 3', 'Social Science', 'TE'),
       ('PDT2', 'Product Design 2', 'Technology', 'RO'),
       ('PDT2', 'Product Design 2', 'Technology', 'EA'),
       ('PDT3', 'Product Design 3', 'Technology', 'MG'),
       ('PDT3', 'Product Design 3', 'Technology', 'IE'),
       ('PDT3', 'Product Design 3', 'Technology', 'IE'),
       ('PED2', 'Physical Education 2', 'Physical Education & Health', 'XX'),
       ('PED2', 'Physical Education 2', 'Physical Education & Health', 'CN'),
       ('PED2', 'Physical Education 2', 'Physical Education & Health', 'GL'),
       ('PED3', 'Physical Education 3', 'Physical Education & Health', 'CN'),
       ('PED3', 'Physical Education 3', 'Physical Education & Health', 'GL'),
       ('PED3', 'Physical Education 3', 'Physical Education & Health', 'CO'),
       ('PHO2', 'Photography 2', 'Art', 'SA'),
       ('PHO2', 'Photography 2', 'Art', 'HS'),
       ('PHO3', 'Photography 3', 'Art', 'SA'),
       ('PHY2', 'Physics 2', 'Science', 'SH'),
       ('PHY2', 'Physics 2', 'Science', 'RA'),
       ('PHY2', 'Physics 2', 'Science', 'KR'),
       ('PHY2', 'Physics 2', 'Science', 'KR'),
       ('PHY2', 'Physics 2', 'Science', 'CB'),
       ('PHY2', 'Physics 2', 'Science', 'HI'),
       ('PHY2', 'Physics 2', 'Science', 'RA'),
       ('PHY2', 'Physics 2', 'Science', 'RA'),
       ('PHY2', 'Physics 2', 'Science', 'SH'),
       ('PHY3', 'Physics 3', 'Science', 'RA'),
       ('PHY3', 'Physics 3', 'Science', 'HI'),
       ('PHY3', 'Physics 3', 'Science', 'HI'),
       ('PHY3', 'Physics 3', 'Science', 'KR'),
       ('PHY3', 'Physics 3', 'Science', 'SH'),
       ('PHY3', 'Physics 3', 'Science', 'CB'),
       ('SCI2', 'General Science 2', 'Science', 'BR'),
       ('SCI3', 'General Science 3', 'Science', 'BR'),
       ('SCI3', 'General Science 3', 'Science', 'BR'),
       ('SPO3', 'Sport and Recreation 3', 'Physical Education & Health', 'CL'),
       ('STA2', 'Statistics 2', 'Mathematics', 'PC'),
       ('STA2', 'Statistics 2', 'Mathematics', 'PR'),
       ('STA2', 'Statistics 2', 'Mathematics', 'DI'),
       ('STA2', 'Statistics 2', 'Mathematics', 'SR'),
       ('STA2', 'Statistics 2', 'Mathematics', 'CH'),
       ('STA2', 'Statistics 2', 'Mathematics', 'PH'),
       ('STA2', 'Statistics 2', 'Mathematics', 'PH'),
       ('STA2', 'Statistics 2', 'Mathematics', 'LU'),
       ('STA2', 'Statistics 2', 'Mathematics', 'AS'),
       ('STA2', 'Statistics 2', 'Mathematics', 'AL'),
       ('STA3', 'Statistics 3', 'Mathematics', 'CH'),
       ('STA3', 'Statistics 3', 'Mathematics', 'AI'),
       ('STA3', 'Statistics 3', 'Mathematics', 'AL'),
       ('STA3', 'Statistics 3', 'Mathematics', 'YE'),
       ('STA3', 'Statistics 3', 'Mathematics', 'SR'),
       ('STA3', 'Statistics 3', 'Mathematics', 'LS'),
       ('STA3', 'Statistics 3', 'Mathematics', 'LU'),
       ('STAR', 'Pathways STAR', 'Pathways', 'DALY'),
       ('STPR', 'Trades', 'Pathways', 'DALY'),
       ('TAH2', 'Te Ao Haka', 'English', 'RP'),
       ('TAH2', 'Te Ao Haka', 'English', 'NG'),
       ('TEF2', 'Food Technology 2', 'Technology', 'GO'),
       ('TEF2', 'Food Technology 2', 'Technology', 'SJ'),
       ('TEF3', 'Food Technology 3', 'Technology', 'SJ'),
       ('TEF3', 'Food Technology 3', 'Technology', 'SJ');

create table subjects
(
    id   uuid primary key default gen_random_uuid(),
    code text,
    name text not null
);

create table commons
(
    id   uuid primary key default gen_random_uuid(),
    name text not null
);

INSERT INTO commons (id, name)
VALUES ('7fc0deb1-8003-4341-a777-c8d859af7e5a', 'Pukeko'),
       ('314f8d80-12f9-49a6-882a-2a9737ef3238', 'Kahikatea'),
       ('a3e508bb-1c24-4eb4-9867-c9b590183624', 'Pungawerewere'),
       ('e760a179-7c60-4de9-a805-34758dd887cf', 'Papatuanuku'),
       ('8b5dfb23-056c-434d-9317-deb1c8f1bdab', 'Harekeke'),
       ('7386e779-adaf-40de-898c-207aefe7f1bb', 'Mokorora'),
       ('8dc6b32c-fd85-4432-b16b-b47efa9ad2af', 'Waka'),
       ('1b77a039-6dfe-4fac-9eb4-4f42418f5a5d', 'Kea'),
       ('2594e0f4-89e8-4357-8f05-b54adacfd5f9', 'Owhanga'),
       ('0875d62a-4b89-4ca1-b598-ecd27274f7f2', 'Puriri');

create table rooms
(
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    is_bookable boolean,
    common_id   uuid references commons (id),
    type        text
);

-- Insert rooms for each common
INSERT INTO rooms (id, name, common_id, is_bookable)
VALUES
-- Kahikatea
(gen_random_uuid(), 'Presentation Room', '314f8d80-12f9-49a6-882a-2a9737ef3238', true),
(gen_random_uuid(), 'Inner Common 1', '314f8d80-12f9-49a6-882a-2a9737ef3238', true),
(gen_random_uuid(), 'Inner Common 2', '314f8d80-12f9-49a6-882a-2a9737ef3238', true),
(gen_random_uuid(), 'Outer Common', '314f8d80-12f9-49a6-882a-2a9737ef3238', true),
(gen_random_uuid(), 'Pod', '314f8d80-12f9-49a6-882a-2a9737ef3238', true),

-- Pukeko
(gen_random_uuid(), 'Presentation Room', '7fc0deb1-8003-4341-a777-c8d859af7e5a', true),
(gen_random_uuid(), 'Inner Common 1', '7fc0deb1-8003-4341-a777-c8d859af7e5a', true),
(gen_random_uuid(), 'Inner Common 2', '7fc0deb1-8003-4341-a777-c8d859af7e5a', true),
(gen_random_uuid(), 'Outer Common', '7fc0deb1-8003-4341-a777-c8d859af7e5a', true),
(gen_random_uuid(), 'Pod', '7fc0deb1-8003-4341-a777-c8d859af7e5a', true),

-- Pungawerewere
(gen_random_uuid(), 'Presentation Room', 'a3e508bb-1c24-4eb4-9867-c9b590183624', true),
(gen_random_uuid(), 'Inner Common 1', 'a3e508bb-1c24-4eb4-9867-c9b590183624', true),
(gen_random_uuid(), 'Inner Common 2', 'a3e508bb-1c24-4eb4-9867-c9b590183624', true),
(gen_random_uuid(), 'Outer Common', 'a3e508bb-1c24-4eb4-9867-c9b590183624', true),
(gen_random_uuid(), 'Pod', 'a3e508bb-1c24-4eb4-9867-c9b590183624', true),

-- Papatuanuku
(gen_random_uuid(), 'Presentation Room', 'e760a179-7c60-4de9-a805-34758dd887cf', true),
(gen_random_uuid(), 'Inner Common 1', 'e760a179-7c60-4de9-a805-34758dd887cf', true),
(gen_random_uuid(), 'Inner Common 2', 'e760a179-7c60-4de9-a805-34758dd887cf', true),
(gen_random_uuid(), 'Outer Common', 'e760a179-7c60-4de9-a805-34758dd887cf', true),
(gen_random_uuid(), 'Pod', 'e760a179-7c60-4de9-a805-34758dd887cf', true),

-- Harekeke
(gen_random_uuid(), 'Presentation Room', '8b5dfb23-056c-434d-9317-deb1c8f1bdab', true),
(gen_random_uuid(), 'Inner Common 1', '8b5dfb23-056c-434d-9317-deb1c8f1bdab', true),
(gen_random_uuid(), 'Inner Common 2', '8b5dfb23-056c-434d-9317-deb1c8f1bdab', true),
(gen_random_uuid(), 'Outer Common', '8b5dfb23-056c-434d-9317-deb1c8f1bdab', true),
(gen_random_uuid(), 'Pod', '8b5dfb23-056c-434d-9317-deb1c8f1bdab', true),

-- Mokorora
(gen_random_uuid(), 'Presentation Room', '7386e779-adaf-40de-898c-207aefe7f1bb', true),
(gen_random_uuid(), 'Inner Common 1', '7386e779-adaf-40de-898c-207aefe7f1bb', true),
(gen_random_uuid(), 'Inner Common 2', '7386e779-adaf-40de-898c-207aefe7f1bb', true),
(gen_random_uuid(), 'Outer Common', '7386e779-adaf-40de-898c-207aefe7f1bb', true),
(gen_random_uuid(), 'Pod', '7386e779-adaf-40de-898c-207aefe7f1bb', true),

-- Waka
(gen_random_uuid(), 'Presentation Room', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af', true),
(gen_random_uuid(), 'Inner Common 1', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af', true),
(gen_random_uuid(), 'Inner Common 2', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af', true),
(gen_random_uuid(), 'Outer Common', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af', true),
(gen_random_uuid(), 'Pod', '8dc6b32c-fd85-4432-b16b-b47efa9ad2af', true),

-- Kea
(gen_random_uuid(), 'Presentation Room', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d', true),
(gen_random_uuid(), 'Inner Common 1', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d', true),
(gen_random_uuid(), 'Inner Common 2', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d', true),
(gen_random_uuid(), 'Outer Common', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d', true),
(gen_random_uuid(), 'Pod', '1b77a039-6dfe-4fac-9eb4-4f42418f5a5d', true);


-- Non Common Rooms
INSERT INTO rooms (id, name, common_id, is_bookable, type)
VALUES
    -- Downstairs
    (gen_random_uuid(), 'Media Room', NULL, false, 'fixed'),
    (gen_random_uuid(), 'Dance Room', NULL, false, 'fixed'),
    (gen_random_uuid(), 'DVC Room', NULL, false, 'fixed'),
    (gen_random_uuid(), 'Industrial Workshop', NULL, false, 'fixed'),
    (gen_random_uuid(), 'Music Room', NULL, false, 'fixed'),
    (gen_random_uuid(), 'Food Tech', NULL, true, 'fixed'),
    -- Upstairs
    (gen_random_uuid(), 'Art Room 1', NULL, false, 'fixed'),
    (gen_random_uuid(), 'Art Room 2', NULL, false, 'fixed'),
    (gen_random_uuid(), 'Library', NULL, true, 'fixed'),
    (gen_random_uuid(), 'Wet Lab', NULL, true, 'fixed'),
    (gen_random_uuid(), 'Dry Lab', NULL, true, 'fixed');

-- For outside blocks
INSERT INTO rooms (id, name, common_id, is_bookable, type)
VALUES
-- Owhanga
(gen_random_uuid(), 'Owhanga 1', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
(gen_random_uuid(), 'Owhanga 2', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
(gen_random_uuid(), 'Owhanga 3', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
(gen_random_uuid(), 'Owhanga 4', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
(gen_random_uuid(), 'Owhanga 5', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
(gen_random_uuid(), 'Owhanga 6', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
(gen_random_uuid(), 'Owhanga 7', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
(gen_random_uuid(), 'Owhanga 8', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
(gen_random_uuid(), 'Owhanga 9', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
(gen_random_uuid(), 'Owhanga 10', '2594e0f4-89e8-4357-8f05-b54adacfd5f9', false, 'fixed'),
-- Puriri
(gen_random_uuid(), 'Puriri 1', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed'),
(gen_random_uuid(), 'Puriri 2', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed'),
(gen_random_uuid(), 'Puriri 3', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed'),
(gen_random_uuid(), 'Puriri 4', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed'),
(gen_random_uuid(), 'Puriri 5', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed'),
(gen_random_uuid(), 'Puriri 6', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed'),
(gen_random_uuid(), 'Puriri 7', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed'),
(gen_random_uuid(), 'Puriri 8', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed'),
(gen_random_uuid(), 'Puriri 9', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed'),
(gen_random_uuid(), 'Puriri 10', '0875d62a-4b89-4ca1-b598-ecd27274f7f2', false, 'fixed');

create table subject_common_access
(
    subject_id uuid not null references subjects (id),
    common_id  uuid not null references commons (id),
    primary key (subject_id, common_id)
);

create table subject_teachers
(
    subject_id uuid not null references subjects (id),
    teacher_id text not null references users (user_id),
    primary key (subject_id, teacher_id)
);

create table bookings
(
    id            uuid primary key     default gen_random_uuid(),
    user_id       text        not null references users (user_id),
    room_id       uuid        references rooms (id),
    date          date        not null,
    period        text        not null,
    justification text,
    created_at    timestamptz not null default now(),
    subject_id    uuid references subjects (id)
);

CREATE TABLE slots
(
    id          SERIAL PRIMARY KEY,
    slot_number INTEGER UNIQUE -- 1 to 9
);

CREATE TABLE slot_times
(
    id          SERIAL PRIMARY KEY,
    slot_number INTEGER REFERENCES slots (slot_number),
    weekday     TEXT CHECK (weekday IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
    start_time  TIME,
    end_time    TIME,
    UNIQUE (slot_number, weekday)
);

CREATE TABLE lines
(
    id          SERIAL PRIMARY KEY,
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

-- scripts

SELECT DISTINCT t.class_code AS code,
                t.class_name AS name
FROM staging_class_data t
ORDER BY t.class_code, t.class_name;

INSERT INTO subjects (code, name)
SELECT DISTINCT t.class_code AS code, t.class_name AS name
FROM staging_class_data t;

-- alan's script :3 to insert teacher_id and subject_id into subject_teachers
-- INSERT INTO subject_teachers
SELECT DISTINCT
--     u.teacher_code AS user_code,
--     t.teacher_code AS temp_code
--     t.teacher_code AS temp_code, -- provided code
-- t.class_code, -u.user_id AS teacher_ID,
-- guid teacher ID- provided class code
    s.id                  as subject_ID -- guid subject ID
              , u.user_id AS teacher_ID -- guid teacher ID
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