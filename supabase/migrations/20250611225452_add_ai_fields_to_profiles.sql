-- Add AI-related fields to profiles table
alter table profiles add column if not exists ai_model text;
alter table profiles add column if not exists ai_base_url text;
alter table profiles add column if not exists ai_api_key text;
