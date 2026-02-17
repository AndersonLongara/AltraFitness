-- Add student_id column to leads table to track converted students and prevent duplicate conversions
ALTER TABLE leads ADD COLUMN student_id TEXT REFERENCES students(id);
