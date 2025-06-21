package com.zenith.taskfocus.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import kotlinx.serialization.Serializable
import java.time.LocalDateTime

@Parcelize
@Serializable
data class Task(
    val id: String = "",
    val userId: String = "",
    val title: String,
    val description: String? = null,
    val status: TaskStatus = TaskStatus.TODO,
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val dueDate: LocalDateTime? = null,
    val startTime: LocalDateTime? = null,
    val endTime: LocalDateTime? = null,
    val isFixedTime: Boolean = false,
    val tags: List<String> = emptyList(),
    val estimatedTime: Int? = null, // in minutes
    val actualTime: Int? = null, // in minutes
    val subtasks: List<Subtask> = emptyList(),
    val projectId: String? = null,
    val parentId: String? = null,
    val completed: Boolean = false,
    val recurrence: RecurrenceType = RecurrenceType.NONE,
    val recurrenceEndDate: LocalDateTime? = null,
    val attachments: List<TaskAttachment> = emptyList(),
    val reminders: List<TaskReminder> = emptyList(),
    val progress: Int = 0, // 0-100
    val difficulty: TaskDifficulty? = null,
    val energy: TaskEnergy? = null,
    val context: List<String> = emptyList(),
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) : Parcelable

@Parcelize
@Serializable
enum class TaskStatus : Parcelable {
    TODO,
    IN_PROGRESS,
    COMPLETED,
    OVERDUE,
    CANCELLED
}

@Parcelize
@Serializable
enum class TaskPriority : Parcelable {
    LOW,
    MEDIUM,
    HIGH
}

@Parcelize
@Serializable
enum class RecurrenceType : Parcelable {
    NONE,
    DAILY,
    WEEKLY,
    MONTHLY
}

@Parcelize
@Serializable
enum class TaskDifficulty : Parcelable {
    EASY,
    MEDIUM,
    HARD
}

@Parcelize
@Serializable
enum class TaskEnergy : Parcelable {
    LOW,
    MEDIUM,
    HIGH
}

@Parcelize
@Serializable
data class Subtask(
    val id: String = "",
    val taskId: String,
    val title: String,
    val completed: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now()
) : Parcelable

@Parcelize
@Serializable
data class TaskAttachment(
    val id: String = "",
    val taskId: String,
    val fileName: String,
    val fileUrl: String,
    val fileSize: Long,
    val mimeType: String,
    val createdAt: LocalDateTime = LocalDateTime.now()
) : Parcelable

@Parcelize
@Serializable
data class TaskReminder(
    val id: String = "",
    val taskId: String,
    val reminderTime: LocalDateTime,
    val message: String? = null,
    val sent: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now()
) : Parcelable

// Priority Matrix Quadrant
data class TaskQuadrant(
    val title: String,
    val description: String,
    val tasks: List<Task>,
    val color: String
)
