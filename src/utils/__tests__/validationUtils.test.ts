import { describe, it, expect } from 'vitest';
import { validateTask, validateSubtask, validateTimeSlot, sanitizeInput, validateEmail } from '../validationUtils';
import { TaskStatus, TaskPriority } from '@/types/task';

describe('validationUtils', () => {
  describe('validateTask', () => {
    it('should validate a valid task', () => {
      const task = {
        title: 'Test Task',
        description: 'Test description',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        tags: ['test'],
        estimatedTime: 60,
      };

      const result = validateTask(task);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject task with empty title', () => {
      const task = {
        title: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };

      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('任务标题不能为空');
    });

    it('should reject task with title too long', () => {
      const task = {
        title: 'a'.repeat(201),
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };

      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('任务标题不能超过200个字符');
    });

    it('should reject task with description too long', () => {
      const task = {
        title: 'Test Task',
        description: 'a'.repeat(1001),
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
      };

      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('任务描述不能超过1000个字符');
    });

    it('should reject task with invalid date range', () => {
      const startTime = new Date('2024-01-02');
      const dueDate = new Date('2024-01-01');

      const task = {
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        startTime,
        dueDate,
      };

      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('截止日期不能早于开始时间');
    });

    it('should reject task with negative estimated time', () => {
      const task = {
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        estimatedTime: -10,
      };

      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('预估时间不能为负数');
    });

    it('should reject task with too many tags', () => {
      const task = {
        title: 'Test Task',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        tags: Array(11).fill('tag'),
      };

      const result = validateTask(task);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('标签数量不能超过10个');
    });
  });

  describe('validateSubtask', () => {
    it('should validate a valid subtask title', () => {
      const result = validateSubtask('Valid subtask title');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty subtask title', () => {
      const result = validateSubtask('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('子任务标题不能为空');
    });

    it('should reject subtask title too long', () => {
      const result = validateSubtask('a'.repeat(101));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('子任务标题不能超过100个字符');
    });
  });

  describe('validateTimeSlot', () => {
    it('should validate a valid time slot', () => {
      const startTime = new Date(Date.now() + 60000); // 1 minute from now
      const endTime = new Date(Date.now() + 120000); // 2 minutes from now

      const result = validateTimeSlot(startTime, endTime);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject time slot with end before start', () => {
      const startTime = new Date(Date.now() + 120000);
      const endTime = new Date(Date.now() + 60000);

      const result = validateTimeSlot(startTime, endTime);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('结束时间必须晚于开始时间');
    });

    it('should reject time slot in the past', () => {
      const startTime = new Date(Date.now() - 60000); // 1 minute ago
      const endTime = new Date(Date.now() + 60000); // 1 minute from now

      const result = validateTimeSlot(startTime, endTime);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('开始时间不能早于当前时间');
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace and normalize spaces', () => {
      const input = '  hello    world  ';
      const result = sanitizeInput(input);
      expect(result).toBe('hello world');
    });

    it('should handle empty string', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test.example.com')).toBe(false);
    });
  });
});
