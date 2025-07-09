-- Create table for AI suggestion caching
create table "public"."ai_suggestions_cache" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "suggestions" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "expires_at" timestamp with time zone not null default (now() + interval '24 hours')
);

-- Enable row level security
alter table "public"."ai_suggestions_cache" enable row level security;

-- Create indexes
CREATE INDEX idx_ai_suggestions_cache_user_id ON public.ai_suggestions_cache USING btree (user_id);
CREATE INDEX idx_ai_suggestions_cache_expires_at ON public.ai_suggestions_cache USING btree (expires_at);
CREATE UNIQUE INDEX ai_suggestions_cache_pkey ON public.ai_suggestions_cache USING btree (id);

-- Add constraints
alter table "public"."ai_suggestions_cache" add constraint "ai_suggestions_cache_pkey" PRIMARY KEY using index "ai_suggestions_cache_pkey";
alter table "public"."ai_suggestions_cache" add constraint "ai_suggestions_cache_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;
alter table "public"."ai_suggestions_cache" validate constraint "ai_suggestions_cache_user_id_fkey";

-- Grant permissions
grant delete on table "public"."ai_suggestions_cache" to "anon";
grant insert on table "public"."ai_suggestions_cache" to "anon";
grant references on table "public"."ai_suggestions_cache" to "anon";
grant select on table "public"."ai_suggestions_cache" to "anon";
grant trigger on table "public"."ai_suggestions_cache" to "anon";
grant truncate on table "public"."ai_suggestions_cache" to "anon";
grant update on table "public"."ai_suggestions_cache" to "anon";

grant delete on table "public"."ai_suggestions_cache" to "authenticated";
grant insert on table "public"."ai_suggestions_cache" to "authenticated";
grant references on table "public"."ai_suggestions_cache" to "authenticated";
grant select on table "public"."ai_suggestions_cache" to "authenticated";
grant trigger on table "public"."ai_suggestions_cache" to "authenticated";
grant truncate on table "public"."ai_suggestions_cache" to "authenticated";
grant update on table "public"."ai_suggestions_cache" to "authenticated";

grant delete on table "public"."ai_suggestions_cache" to "service_role";
grant insert on table "public"."ai_suggestions_cache" to "service_role";
grant references on table "public"."ai_suggestions_cache" to "service_role";
grant select on table "public"."ai_suggestions_cache" to "service_role";
grant trigger on table "public"."ai_suggestions_cache" to "service_role";
grant truncate on table "public"."ai_suggestions_cache" to "service_role";
grant update on table "public"."ai_suggestions_cache" to "service_role";

-- Create RLS policy
create policy "用户可以管理自己的AI建议缓存"
on "public"."ai_suggestions_cache"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_ai_suggestions_cache() 
RETURNS void AS $$
BEGIN
    DELETE FROM public.ai_suggestions_cache 
    WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create unique constraint to ensure only one cache entry per user
CREATE UNIQUE INDEX ai_suggestions_cache_user_id_unique ON public.ai_suggestions_cache USING btree (user_id);