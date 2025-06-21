package com.zenith.taskfocus.data.mapper

import com.zenith.taskfocus.data.remote.dto.CreateTaskRequest
import com.zenith.taskfocus.data.remote.dto.SubtaskDto
import com.zenith.taskfocus.data.remote.dto.TaskDto
import com.zenith.taskfocus.data.remote.dto.UpdateTaskRequest
import com.zenith.taskfocus.domain.model.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object TaskMapper {
    
    private val dateTimeFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME
    
    fun TaskDto.toDomain(): Task {
        return Task(
            id = id,
            userId = userId,
            title = title,
            description = description,
            status = status.toTaskStatus(),
            priority = priority.toTaskPriority(),
            dueDate = dueDate?.let { LocalDateTime.parse(it.removeSuffix("Z")) },
            startTime = startTime?.let { LocalDateTime.parse(it.removeSuffix("Z")) },
            endTime = endTime?.let { LocalDateTime.parse(it.removeSuffix("Z")) },
            isFixedTime = isFixedTime,
            tags = tags,
            estimatedTime = estimatedTime,
            actualTime = actualTime,
            subtasks = subtasks.map { it.toDomain() },
            projectId = projectId,
            parentId = parentId,
            completed = completed,
            recurrence = recurrence.toRecurrenceType(),
            recurrenceEndDate = recurrenceEndDate?.let { LocalDateTime.parse(it.removeSuffix("Z")) },
            progress = progress,
            difficulty = difficulty?.toTaskDifficulty(),
            energy = energy?.toTaskEnergy(),
            context = context,
            createdAt = LocalDateTime.parse(createdAt.removeSuffix("Z")),
            updatedAt = LocalDateTime.parse(updatedAt.removeSuffix("Z"))
        )
    }
    
    fun SubtaskDto.toDomain(): Subtask {
        return Subtask(
            id = id,
            taskId = taskId,
            title = title,
            completed = completed,
            createdAt = LocalDateTime.parse(createdAt.removeSuffix("Z"))
        )
    }
    
    fun Task.toCreateRequest(): CreateTaskRequest {
        return CreateTaskRequest(
            title = title,
            description = description,
            status = status.toApiString(),
            priority = priority.toApiString(),
            dueDate = dueDate?.format(dateTimeFormatter)?.plus("Z"),
            startTime = startTime?.format(dateTimeFormatter)?.plus("Z"),
            endTime = endTime?.format(dateTimeFormatter)?.plus("Z"),
            isFixedTime = isFixedTime,
            tags = tags,
            estimatedTime = estimatedTime,
            projectId = projectId,
            parentId = parentId,
            recurrence = recurrence.toApiString(),
            recurrenceEndDate = recurrenceEndDate?.format(dateTimeFormatter)?.plus("Z"),
            progress = progress,
            difficulty = difficulty?.toApiString(),
            energy = energy?.toApiString(),
            context = context
        )
    }
    
    fun Task.toUpdateRequest(): UpdateTaskRequest {
        return UpdateTaskRequest(
            title = title,
            description = description,
            status = status.toApiString(),
            priority = priority.toApiString(),
            dueDate = dueDate?.format(dateTimeFormatter)?.plus("Z"),
            startTime = startTime?.format(dateTimeFormatter)?.plus("Z"),
            endTime = endTime?.format(dateTimeFormatter)?.plus("Z"),
            isFixedTime = isFixedTime,
            tags = tags,
            estimatedTime = estimatedTime,
            actualTime = actualTime,
            completed = completed,
            recurrence = recurrence.toApiString(),
            recurrenceEndDate = recurrenceEndDate?.format(dateTimeFormatter)?.plus("Z"),
            progress = progress,
            difficulty = difficulty?.toApiString(),
            energy = energy?.toApiString(),
            context = context
        )
    }
    
    // Extension functions for enum conversions
    private fun String.toTaskStatus(): TaskStatus {
        return when (this.lowercase()) {
            "todo" -> TaskStatus.TODO
            "in_progress" -> TaskStatus.IN_PROGRESS
            "completed" -> TaskStatus.COMPLETED
            "overdue" -> TaskStatus.OVERDUE
            "cancelled" -> TaskStatus.CANCELLED
            else -> TaskStatus.TODO
        }
    }
    
    private fun String.toTaskPriority(): TaskPriority {
        return when (this.lowercase()) {
            "low" -> TaskPriority.LOW
            "medium" -> TaskPriority.MEDIUM
            "high" -> TaskPriority.HIGH
            else -> TaskPriority.MEDIUM
        }
    }
    
    private fun String.toRecurrenceType(): RecurrenceType {
        return when (this.lowercase()) {
            "none" -> RecurrenceType.NONE
            "daily" -> RecurrenceType.DAILY
            "weekly" -> RecurrenceType.WEEKLY
            "monthly" -> RecurrenceType.MONTHLY
            else -> RecurrenceType.NONE
        }
    }
    
    private fun String.toTaskDifficulty(): TaskDifficulty {
        return when (this.lowercase()) {
            "easy" -> TaskDifficulty.EASY
            "medium" -> TaskDifficulty.MEDIUM
            "hard" -> TaskDifficulty.HARD
            else -> TaskDifficulty.MEDIUM
        }
    }
    
    private fun String.toTaskEnergy(): TaskEnergy {
        return when (this.lowercase()) {
            "low" -> TaskEnergy.LOW
            "medium" -> TaskEnergy.MEDIUM
            "high" -> TaskEnergy.HIGH
            else -> TaskEnergy.MEDIUM
        }
    }
    
    private fun TaskStatus.toApiString(): String {
        return when (this) {
            TaskStatus.TODO -> "todo"
            TaskStatus.IN_PROGRESS -> "in_progress"
            TaskStatus.COMPLETED -> "completed"
            TaskStatus.OVERDUE -> "overdue"
            TaskStatus.CANCELLED -> "cancelled"
        }
    }
    
    private fun TaskPriority.toApiString(): String {
        return when (this) {
            TaskPriority.LOW -> "low"
            TaskPriority.MEDIUM -> "medium"
            TaskPriority.HIGH -> "high"
        }
    }
    
    private fun RecurrenceType.toApiString(): String {
        return when (this) {
            RecurrenceType.NONE -> "none"
            RecurrenceType.DAILY -> "daily"
            RecurrenceType.WEEKLY -> "weekly"
            RecurrenceType.MONTHLY -> "monthly"
        }
    }
    
    private fun TaskDifficulty.toApiString(): String {
        return when (this) {
            TaskDifficulty.EASY -> "easy"
            TaskDifficulty.MEDIUM -> "medium"
            TaskDifficulty.HARD -> "hard"
        }
    }
    
    private fun TaskEnergy.toApiString(): String {
        return when (this) {
            TaskEnergy.LOW -> "low"
            TaskEnergy.MEDIUM -> "medium"
            TaskEnergy.HIGH -> "high"
        }
    }
}
