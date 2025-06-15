
-- 为 profiles 表新增“工作偏好”相关字段

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS work_start_time TIME WITH TIME ZONE DEFAULT '09:00:00+08',  -- 每日工作开始时间
ADD COLUMN IF NOT EXISTS work_end_time TIME WITH TIME ZONE DEFAULT '18:00:00+08',    -- 每日工作结束时间
ADD COLUMN IF NOT EXISTS focus_duration_minutes INTEGER DEFAULT 45,                  -- 专注块时长（分钟）
ADD COLUMN IF NOT EXISTS break_duration_minutes INTEGER DEFAULT 15,                  -- 休息块时长（分钟）
ADD COLUMN IF NOT EXISTS planning_buffer_minutes INTEGER DEFAULT 10;                 -- 任务间缓冲（分钟）

COMMENT ON COLUMN public.profiles.work_start_time IS '用户每日工作开始时间';
COMMENT ON COLUMN public.profiles.work_end_time IS '用户每日工作结束时间';
COMMENT ON COLUMN public.profiles.focus_duration_minutes IS '单个专注块的默认时长（分钟）';
COMMENT ON COLUMN public.profiles.break_duration_minutes IS '默认休息时长（分钟）';
COMMENT ON COLUMN public.profiles.planning_buffer_minutes IS '不同任务之间的缓冲时间（分钟）';
