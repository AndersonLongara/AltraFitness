-- Add lead forms tables for sales pipeline questionnaires

CREATE TABLE lead_forms (
    id TEXT PRIMARY KEY NOT NULL,
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'pending',
    assigned_at INTEGER DEFAULT (strftime('%s', 'now')),
    completed_at INTEGER,
    expires_at INTEGER
);

CREATE TABLE lead_form_answers (
    id TEXT PRIMARY KEY NOT NULL,
    response_id TEXT NOT NULL REFERENCES lead_forms(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES form_questions(id),
    answer TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
