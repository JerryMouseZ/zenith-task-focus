package com.zenith.taskfocus.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserProfileDto(
    val id: String,
    val email: String? = null,
    @SerialName("full_name") val fullName: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    val timezone: String? = null,
    @SerialName("ai_api_key") val aiApiKey: String? = null,
    @SerialName("ai_base_url") val aiBaseUrl: String? = null,
    @SerialName("ai_model") val aiModel: String? = null,
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String
)

@Serializable
data class UpdateProfileRequest(
    @SerialName("full_name") val fullName: String? = null,
    @SerialName("avatar_url") val avatarUrl: String? = null,
    val timezone: String? = null,
    @SerialName("ai_api_key") val aiApiKey: String? = null,
    @SerialName("ai_base_url") val aiBaseUrl: String? = null,
    @SerialName("ai_model") val aiModel: String? = null
)

@Serializable
data class SignUpRequest(
    val email: String,
    val password: String,
    @SerialName("full_name") val fullName: String
)

@Serializable
data class SignInRequest(
    val email: String,
    val password: String
)
