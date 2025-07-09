-- 删除开始时间字段，添加当前已进行时间字段
alter table "public"."tasks" drop column if exists "start_time";
alter table "public"."tasks" add column "current_time" integer default 0;

-- 添加注释说明
comment on column "public"."tasks"."current_time" is '当前已进行的时间（分钟）';
comment on column "public"."tasks"."actual_time" is '实际完成时间（分钟）';
comment on column "public"."tasks"."estimated_time" is '预计完成时间（分钟）';