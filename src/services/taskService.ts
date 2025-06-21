
// Create a combined service that includes both task and subtask operations
// This maintains backward compatibility while using the new modular structure
import { taskService as coreTaskService } from './task/taskService';
import { subtaskService } from './task/subtaskService';

export const taskService = {
  // Task operations
  ...coreTaskService,

  // Subtask operations (for backward compatibility)
  createSubtask: subtaskService.createSubtask,
  updateSubtask: subtaskService.updateSubtask,
  deleteSubtask: subtaskService.deleteSubtask,
};

// For backward compatibility, export the combined service as default
export default taskService;

// Re-export services for direct access if needed
export { subtaskService } from './task/subtaskService';
