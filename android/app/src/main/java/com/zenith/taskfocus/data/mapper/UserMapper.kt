package com.zenith.taskfocus.data.mapper

import com.zenith.taskfocus.data.remote.dto.UpdateProfileRequest
import com.zenith.taskfocus.data.remote.dto.UserProfileDto
import com.zenith.taskfocus.domain.model.User
import com.zenith.taskfocus.domain.model.UserProfile
import io.github.jan.supabase.gotrue.user.UserInfo
import java.time.LocalDateTime

object UserMapper {
    
    fun UserInfo.toDomain(): User {
        return User(
            id = id,
            email = email ?: "",
            fullName = userMetadata?.get("full_name") as? String,
            avatarUrl = userMetadata?.get("avatar_url") as? String,
            createdAt = LocalDateTime.now(), // Supabase UserInfo doesn't provide these
            updatedAt = LocalDateTime.now()
        )
    }
    
    fun UserProfileDto.toDomain(): UserProfile {
        return UserProfile(
            id = id,
            email = email,
            fullName = fullName,
            avatarUrl = avatarUrl,
            timezone = timezone,
            aiApiKey = aiApiKey,
            aiBaseUrl = aiBaseUrl,
            aiModel = aiModel,
            createdAt = LocalDateTime.parse(createdAt.removeSuffix("Z")),
            updatedAt = LocalDateTime.parse(updatedAt.removeSuffix("Z"))
        )
    }
    
    fun UserProfile.toUpdateRequest(): UpdateProfileRequest {
        return UpdateProfileRequest(
            fullName = fullName,
            avatarUrl = avatarUrl,
            timezone = timezone,
            aiApiKey = aiApiKey,
            aiBaseUrl = aiBaseUrl,
            aiModel = aiModel
        )
    }
}
