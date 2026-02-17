-- Migration: Add pipeline_configs table for configuring which questionnaire to use in each pipeline stage

CREATE TABLE pipeline_configs (
    id TEXT PRIMARY KEY NOT NULL,
    trainer_id TEXT NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    pipeline_stage TEXT NOT NULL,
    form_id TEXT REFERENCES forms(id) ON DELETE SET NULL,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE UNIQUE INDEX idx_pipeline_configs_trainer_stage ON pipeline_configs(trainer_id, pipeline_stage);
