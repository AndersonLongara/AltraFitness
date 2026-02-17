-- Add closed_value column to leads table for final value when won or lost
ALTER TABLE leads ADD COLUMN closed_value INTEGER;
