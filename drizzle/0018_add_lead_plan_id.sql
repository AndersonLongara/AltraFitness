-- Migration: Add planId to leads table
-- This allows linking a service plan to a lead throughout the sales pipeline

ALTER TABLE leads ADD COLUMN plan_id TEXT REFERENCES plans(id);
