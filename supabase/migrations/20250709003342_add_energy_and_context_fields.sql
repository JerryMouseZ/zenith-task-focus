-- Add energy_level and context_tags fields to tasks table
alter table "public"."tasks" add column "energy_level" text default 'medium'::text;
alter table "public"."tasks" add column "context_tags" text[] default '{}'::text[];

-- Add check constraint for energy_level
alter table "public"."tasks" add constraint "tasks_energy_level_check" 
CHECK ((energy_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))) not valid;

alter table "public"."tasks" validate constraint "tasks_energy_level_check";

-- Add comment for documentation
comment on column "public"."tasks"."energy_level" is 'Energy level required for this task: low, medium, or high';
comment on column "public"."tasks"."context_tags" is 'Context tags for this task (e.g., @电脑前, @通勤路上, @碎片时间)';