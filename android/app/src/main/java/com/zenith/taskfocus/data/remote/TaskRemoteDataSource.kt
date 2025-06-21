package com.zenith.taskfocus.data.remote

import com.zenith.taskfocus.data.mapper.TaskMapper.toDomain
import com.zenith.taskfocus.data.mapper.TaskMapper.toCreateRequest
import com.zenith.taskfocus.data.mapper.TaskMapper.toUpdateRequest
import com.zenith.taskfocus.data.remote.dto.TaskDto
import com.zenith.taskfocus.domain.model.Task
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TaskRemoteDataSource @Inject constructor() {
    
    private val supabase = SupabaseClient.client
    
    suspend fun getTasks(): List<Task> {
        return supabase.from("tasks")
            .select(
                columns = Columns.raw("""
                    *,
                    subtasks (*)
                """.trimIndent())
            ) {
                order("created_at", ascending = false)
            }
            .decodeList<TaskDto>()
            .map { it.toDomain() }
    }
    
    suspend fun getTaskById(id: String): Task? {
        return supabase.from("tasks")
            .select(
                columns = Columns.raw("""
                    *,
                    subtasks (*)
                """.trimIndent())
            ) {
                filter {
                    eq("id", id)
                }
            }
            .decodeSingleOrNull<TaskDto>()
            ?.toDomain()
    }
    
    suspend fun getChildTasks(parentId: String): List<Task> {
        return supabase.from("tasks")
            .select(
                columns = Columns.raw("""
                    *,
                    subtasks (*)
                """.trimIndent())
            ) {
                filter {
                    eq("parent_id", parentId)
                }
                order("created_at", ascending = false)
            }
            .decodeList<TaskDto>()
            .map { it.toDomain() }
    }
    
    suspend fun createTask(task: Task): Task {
        val request = task.toCreateRequest()
        return supabase.from("tasks")
            .insert(request) {
                select(
                    columns = Columns.raw("""
                        *,
                        subtasks (*)
                    """.trimIndent())
                )
            }
            .decodeSingle<TaskDto>()
            .toDomain()
    }
    
    suspend fun updateTask(task: Task): Task {
        val request = task.toUpdateRequest()
        return supabase.from("tasks")
            .update(request) {
                filter {
                    eq("id", task.id)
                }
                select(
                    columns = Columns.raw("""
                        *,
                        subtasks (*)
                    """.trimIndent())
                )
            }
            .decodeSingle<TaskDto>()
            .toDomain()
    }
    
    suspend fun deleteTask(id: String) {
        supabase.from("tasks")
            .delete {
                filter {
                    eq("id", id)
                }
            }
    }
    
    suspend fun searchTasksByTags(tags: List<String>): List<Task> {
        return supabase.from("tasks")
            .rpc("search_tasks_by_tags") {
                param("search_tags", tags)
            }
            .decodeList<TaskDto>()
            .map { it.toDomain() }
    }
    
    suspend fun getTasksByStatus(status: String): List<Task> {
        return supabase.from("tasks")
            .select(
                columns = Columns.raw("""
                    *,
                    subtasks (*)
                """.trimIndent())
            ) {
                filter {
                    eq("status", status)
                }
                order("created_at", ascending = false)
            }
            .decodeList<TaskDto>()
            .map { it.toDomain() }
    }
    
    suspend fun getTasksByPriority(priority: String): List<Task> {
        return supabase.from("tasks")
            .select(
                columns = Columns.raw("""
                    *,
                    subtasks (*)
                """.trimIndent())
            ) {
                filter {
                    eq("priority", priority)
                }
                order("created_at", ascending = false)
            }
            .decodeList<TaskDto>()
            .map { it.toDomain() }
    }
}
