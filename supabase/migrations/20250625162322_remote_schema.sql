create table "public"."scheduled_blocks" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "task_id" uuid not null,
    "start_time" timestamp with time zone not null,
    "end_time" timestamp with time zone not null,
    "type" text not null,
    "status" text not null default 'scheduled'::text,
    "actual_end_time" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."scheduled_blocks" enable row level security;

alter table "public"."profiles" add column "break_duration_minutes" integer default 15;

alter table "public"."profiles" add column "focus_duration_minutes" integer default 45;

alter table "public"."profiles" add column "planning_buffer_minutes" integer default 10;

alter table "public"."profiles" add column "work_end_time" time with time zone default '18:00:00+08'::time with time zone;

alter table "public"."profiles" add column "work_start_time" time with time zone default '09:00:00+08'::time with time zone;

CREATE INDEX idx_scheduled_blocks_task_id ON public.scheduled_blocks USING btree (task_id);

CREATE INDEX idx_scheduled_blocks_user_id_start_time ON public.scheduled_blocks USING btree (user_id, start_time);

CREATE UNIQUE INDEX scheduled_blocks_pkey ON public.scheduled_blocks USING btree (id);

alter table "public"."scheduled_blocks" add constraint "scheduled_blocks_pkey" PRIMARY KEY using index "scheduled_blocks_pkey";

alter table "public"."scheduled_blocks" add constraint "scheduled_blocks_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'skipped'::text, 'in_progress'::text]))) not valid;

alter table "public"."scheduled_blocks" validate constraint "scheduled_blocks_status_check";

alter table "public"."scheduled_blocks" add constraint "scheduled_blocks_task_id_fkey" FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE not valid;

alter table "public"."scheduled_blocks" validate constraint "scheduled_blocks_task_id_fkey";

alter table "public"."scheduled_blocks" add constraint "scheduled_blocks_type_check" CHECK ((type = ANY (ARRAY['focus'::text, 'break'::text, 'unavailable'::text]))) not valid;

alter table "public"."scheduled_blocks" validate constraint "scheduled_blocks_type_check";

alter table "public"."scheduled_blocks" add constraint "scheduled_blocks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."scheduled_blocks" validate constraint "scheduled_blocks_user_id_fkey";

grant delete on table "public"."scheduled_blocks" to "anon";

grant insert on table "public"."scheduled_blocks" to "anon";

grant references on table "public"."scheduled_blocks" to "anon";

grant select on table "public"."scheduled_blocks" to "anon";

grant trigger on table "public"."scheduled_blocks" to "anon";

grant truncate on table "public"."scheduled_blocks" to "anon";

grant update on table "public"."scheduled_blocks" to "anon";

grant delete on table "public"."scheduled_blocks" to "authenticated";

grant insert on table "public"."scheduled_blocks" to "authenticated";

grant references on table "public"."scheduled_blocks" to "authenticated";

grant select on table "public"."scheduled_blocks" to "authenticated";

grant trigger on table "public"."scheduled_blocks" to "authenticated";

grant truncate on table "public"."scheduled_blocks" to "authenticated";

grant update on table "public"."scheduled_blocks" to "authenticated";

grant delete on table "public"."scheduled_blocks" to "service_role";

grant insert on table "public"."scheduled_blocks" to "service_role";

grant references on table "public"."scheduled_blocks" to "service_role";

grant select on table "public"."scheduled_blocks" to "service_role";

grant trigger on table "public"."scheduled_blocks" to "service_role";

grant truncate on table "public"."scheduled_blocks" to "service_role";

grant update on table "public"."scheduled_blocks" to "service_role";

create policy "用户可以管理自己的规划块"
on "public"."scheduled_blocks"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



