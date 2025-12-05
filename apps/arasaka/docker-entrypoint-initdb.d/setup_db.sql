CREATE TABLE IF NOT EXISTS students
(
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(64),
    pass      VARCHAR(64),
    otchislen BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS professors
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(64),
    pass VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS exams
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(32)
);

INSERT INTO exams(name)
VALUES ('SecureityStressAudit'),
       ('CorrporateLoyalty'),
       ('TacticalAnalysis'),
       ('Blackmailing'),
       ('CrisisCommunications');

CREATE TABLE IF NOT EXISTS session
(
    id                      SERIAL PRIMARY KEY,
    stud_id                 INTEGER NOT NULL,
    CONSTRAINT fk_student   FOREIGN KEY (stud_id) REFERENCES students (id) ON DELETE CASCADE,
    exam_id                 INTEGER NOT NULL,
    CONSTRAINT fk_exam      FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
    status                  VARCHAR(32) NOT NULL,
    timestamp               TIMESTAMP   NOT NULL
);

ALTER TABLE session ALTER timestamp SET DEFAULT now();