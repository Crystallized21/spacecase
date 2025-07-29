INSERT INTO public.commons (id, name) VALUES (DEFAULT, 'Other');

UPDATE public.rooms SET common_id = '49a12066-0b2a-4367-808e-80743ab8e2ab' WHERE id = '92751fc0-f3f8-4fbe-8410-8addbff2f393';
UPDATE public.rooms SET common_id = '49a12066-0b2a-4367-808e-80743ab8e2ab' WHERE id = '5007bda8-bd7a-45ed-831e-749b1e256e79';
UPDATE public.rooms SET common_id = '49a12066-0b2a-4367-808e-80743ab8e2ab' WHERE id = '3261deb7-6d37-4925-b8bc-8918cdb70e0e';
UPDATE public.rooms SET common_id = '49a12066-0b2a-4367-808e-80743ab8e2ab' WHERE id = 'c14d4075-45b1-4608-8766-420823b73e56';

UPDATE public.subjects SET name = 'Computer Science 2' WHERE id = '3e12809b-6d3d-4eff-8c53-53817ac2bb43';
UPDATE public.subjects SET name = 'Computer Science 3' WHERE id = '0eca37b0-5b4e-41d5-9d64-c5ab4e38ec1a';

INSERT INTO subject_common_access (subject_id, common_id)
SELECT s.id, c.id
FROM subjects s
         JOIN commons c ON c.name IN ('Waka', 'Kea')
WHERE s.name IN ('Physics 3', 'Physics 2', 'Chemistry 3', 'Chemistry 2', 'Biology 3', 'Biology 2');

INSERT INTO subject_common_access (subject_id, common_id)
SELECT s.id, c.id
FROM subjects s
         JOIN commons c ON c.name IN ('Pungawerewere', 'Papatuanuku')
WHERE s.name IN ('Mathematics 3', 'Mathematics 2', 'Calculus 3', 'Statistics 3', 'Statistics 2');

INSERT INTO subject_common_access (subject_id, common_id)
SELECT s.id, c.id
FROM subjects s
         JOIN commons c ON c.name IN ('Puriri')
WHERE s.name IN ('Calculus 3');


INSERT INTO subject_common_access (subject_id, common_id)
SELECT s.id, c.id
FROM subjects s
         JOIN commons c ON c.name IN ('Puriri')
WHERE s.name IN ('Computer Science 3', 'Computer Science 2');

INSERT INTO subject_common_access (subject_id, common_id)
SELECT s.id, c.id
FROM subjects s
         JOIN commons c ON c.name IN ('Pukeko', 'Kahikatea')
WHERE s.name IN ('English 2', 'English 3', 'English for academic purposes', 'English Projects');