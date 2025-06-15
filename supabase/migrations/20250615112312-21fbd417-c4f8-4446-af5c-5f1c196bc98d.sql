
-- 创建 scheduled_blocks 表
CREATE TABLE public.scheduled_blocks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('focus', 'break', 'unavailable')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'in_progress')),
    actual_end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.scheduled_blocks IS '存储由智能规划算法生成的专注、休息和不可用时间块。';
COMMENT ON COLUMN public.scheduled_blocks.type IS '区分是专注工作时间、休息时间还是用户标记的不可用时间。';
COMMENT ON COLUMN public.scheduled_blocks.status IS '追踪时间块的执行状态，用于动态调整。in_progress表示正在进行。';
COMMENT ON COLUMN public.scheduled_blocks.actual_end_time IS '用于记录专注块的实际完成时间，与计划的end_time对比，以判断是否超时。';

-- 启用 Row Level Security
ALTER TABLE public.scheduled_blocks ENABLE ROW LEVEL SECURITY;

-- 用户只能操作自己的时间块
CREATE POLICY "用户可以管理自己的规划块"
  ON public.scheduled_blocks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建索引提升查询性能
CREATE INDEX idx_scheduled_blocks_user_id_start_time ON public.scheduled_blocks(user_id, start_time);
CREATE INDEX idx_scheduled_blocks_task_id ON public.scheduled_blocks(task_id);
