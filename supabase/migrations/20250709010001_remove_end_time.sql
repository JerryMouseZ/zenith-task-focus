-- 删除结束时间字段
alter table "public"."tasks" drop column if exists "end_time";