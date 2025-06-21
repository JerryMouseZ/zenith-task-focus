package com.zenith.taskfocus.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TaskDto(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val title: String,
    val description: String? = null,
    val status: String = "todo",
    val priority: String = "medium",
    @SerialName("due_date") val dueDate: String? = null,
    @SerialName("start_time") val startTime: String? = null,
    @SerialName("end_time") val endTime: String? = null,
    @SerialName("is_fixed_time") val isFixedTime: Boolean = false,
    val tags: List<String> = emptyList(),
    @SerialName("estimated_time") val estimatedTime: Int? = null,
    @SerialName("actual_time") val actualTime: Int? = null,
    @SerialName("project_id") val projectId: String? = null,
    @SerialName("parent_id") val parentId: String? = null,
    val completed: Boolean = false,
    val recurrence: String = "none",
    @SerialName("recurrence_end_date") val recurrenceEndDate: String? = null,
    val progress: Int = 0,
    val difficulty: String? = null,
    val energy: String? = null,
    val context: List<String> = emptyList(),
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String,
    val subtasks: List<SubtaskDto> = emptyList()
)

@Serializable
data class SubtaskDto(
    val id: String = "",
    @SerialName("task_id") val taskId: String,
    val title: String,
    val completed: Boolean = false,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class CreateTaskRequest(
    val title: String,
    val description: String? = null,
    val status: String = "todo",
    val priority: String = "medium",
    @SerialName("due_date") val dueDate: String? = null,
    @SerialName("start_time") val startTime: String? = null,
    @SerialName("end_time") val endTime: String? = null,
    @SerialName("is_fixed_time") val isFixedTime: Boolean = false,
    val tags: List<String> = emptyList(),
    @SerialName("estimated_time") val estimatedTime: Int? = null,
    @SerialName("project_id") val projectId: String? = null,
    @SerialName("parent_id") val parentId: String? = null,
    val recurrence: String = "none",
    @SerialName("recurrence_end_date") val recurrenceEndDate: String? = null,
    val progress: Int = 0,
    val difficulty: String? = null,
    val energy: String? = null,
    val context: List<String> = emptyList()
)

@Serializable
data class UpdateTaskRequest(
    val title: String? = null,
    val description: String? = null,
    val status: String? = null,
    val priority: String? = null,
    @SerialName("due_date") val dueDate: String? = null,
    @SerialName("start_time") val startTime: String? = null,
    @SerialName("end_time") val endTime: String? = null,
    @SerialName("is_fixed_time") val isFixedTime: Boolean? = null,
    val tags: List<String>? = null,
    @SerialName("estimated_time") val estimatedTime: Int? = null,
    @SerialName("actual_time") val actualTime: Int? = null,
    val completed: Boolean? = null,
    val recurrence: String? = null,
    @SerialName("recurrence_end_date") val recurrenceEndDate: String? = null,
    val progress: Int? = null,
    val difficulty: String? = null,
    val energy: String? = null,
    val context: List<String>? = null
)
