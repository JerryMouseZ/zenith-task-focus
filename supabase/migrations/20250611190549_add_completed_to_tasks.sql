-- 添加 completed 字段到 tasks 表，默认为 false
ALTER TABLE tasks ADD COLUMN completed boolean NOT NULL DEFAULT false;

-- 可选：如果你希望将已完成的任务与 status 字段保持同步，可以考虑写一个触发器，但这里只做字段添加。
