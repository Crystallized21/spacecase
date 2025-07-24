INSERT INTO slots (slot_number)
VALUES (1),
       (2),
       (3),
       (4),
       (5),
       (6),
       (7),
       (8),
       (9);

INSERT INTO lines (line_number)
VALUES (1),
       (2),
       (3),
       (4),
       (5),
       (6);

INSERT INTO slot_times (weekday, slot_number, start_time, end_time)
VALUES
-- Monday
('Monday', 1, '08:30', '09:00'),
('Monday', 2, '09:00', '10:30'),
('Monday', 3, '10:30', '10:50'),
('Monday', 4, '10:50', '12:20'),
('Monday', 5, '12:20', '13:10'),
('Monday', 6, '13:10', '13:35'),
('Monday', 7, '13:40', '14:30'),
('Monday', 8, '14:30', '15:25'),

-- Tuesday
('Tuesday', 1, '08:30', '09:00'),
('Tuesday', 2, '09:00', '10:30'),
('Tuesday', 3, '10:30', '10:50'),
('Tuesday', 4, '10:50', '12:20'),
('Tuesday', 5, '12:20', '13:10'),
('Tuesday', 6, '13:10', '14:00'),
('Tuesday', 7, '14:00', '14:55'),

-- Wednesday
('Wednesday', 1, '08:30', '09:00'),
('Wednesday', 2, '09:00', '10:30'),
('Wednesday', 3, '10:30', '10:50'),
('Wednesday', 4, '10:50', '12:20'),
('Wednesday', 5, '12:20', '13:10'),
('Wednesday', 6, '13:10', '13:35'),
('Wednesday', 7, '13:40', '14:30'),
('Wednesday', 8, '14:35', '15:25'),

-- Thursday
('Thursday', 1, '08:30', '09:00'),
('Thursday', 2, '09:00', '09:50'),
('Thursday', 3, '09:55', '10:45'),
('Thursday', 4, '10:45', '11:05'),
('Thursday', 5, '11:05', '11:55'),
('Thursday', 6, '12:20', '13:10'),
('Thursday', 7, '13:10', '13:55'),
('Thursday', 8, '13:40', '14:30'),
('Thursday', 9, '14:35', '15:25'),

-- Friday
('Friday', 1, '08:30', '09:00'),
('Friday', 2, '09:00', '09:50'),
('Friday', 3, '09:55', '10:45'),
('Friday', 4, '10:45', '11:05'),
('Friday', 5, '11:05', '11:55'),
('Friday', 6, '11:55', '12:40'),
('Friday', 7, '12:40', '13:30'),
('Friday', 8, '13:40', '14:55');

INSERT INTO line_slots (line_number, weekday, slot_number)
VALUES
    -- Line 1
    (1, 'Monday', 2),
    (1, 'Tuesday', 7),
    (1, 'Thursday', 8),
    (1, 'Friday', 5),
    -- Line 2
    (2, 'Monday', 4),
    (2, 'Wednesday', 7),
    (2, 'Thursday', 9),
    (2, 'Friday', 3),
    -- Line 3
    (3, 'Monday', 7),
    (3, 'Wednesday', 2),
    (3, 'Thursday', 5),
    (3, 'Friday', 7),
    -- Line 4
    (4, 'Monday', 8),
    (4, 'Tuesday', 6),
    (4, 'Wednesday', 4),
    (4, 'Thursday', 2),
    -- Line 5
    (5, 'Tuesday', 4),
    (5, 'Wednesday', 8),
    (5, 'Thursday', 3),
    (5, 'Friday', 2);

