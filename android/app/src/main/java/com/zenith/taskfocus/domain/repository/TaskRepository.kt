package com.zenith.taskfocus.domain.repository

import com.zenith.taskfocus.domain.model.Subtask
import com.zenith.taskfocus.domain.model.Task
import kotlinx.coroutines.flow.Flow

interface TaskRepository {
    
    // Task CRUD operations
    suspend fun getTasks(): Flow<List<Task>>
    suspend fun getTaskById(id: String): Task?
    suspend fun getChildTasks(parentId: String): List<Task>
    suspend fun createTask(task: Task): Task
    suspend fun updateTask(task: Task): Task
    suspend fun deleteTask(id: String)
    suspend fun markTaskCompleted(id: String, completed: Boolean)
    
    // Task filtering and search
    suspend fun searchTasks(query: String): List<Task>
    suspend fun getTasksByStatus(status: String): List<Task>
    suspend fun getTasksByPriority(priority: String): List<Task>
    suspend fun getTasksByTags(tags: List<String>): List<Task>
    suspend fun getTasksByDateRange(startDate: String?, endDate: String?): List<Task>
    
    // Subtask operations
    suspend fun createSubtask(subtask: Subtask): Subtask
    suspend fun updateSubtask(subtask: Subtask): Subtask
    suspend fun deleteSubtask(id: String)
    
    // Sync operations
    suspend fun syncTasks()
    suspend fun refreshTasks()
}
