package com.zenith.taskfocus.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import kotlinx.serialization.Serializable
import java.time.LocalDateTime

@Parcelize
@Serializable
data class User(
    val id: String,
    val email: String,
    val fullName: String? = null,
    val avatarUrl: String? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) : Parcelable

@Parcelize
@Serializable
data class UserProfile(
    val id: String,
    val email: String? = null,
    val fullName: String? = null,
    val avatarUrl: String? = null,
    val timezone: String? = null,
    val aiApiKey: String? = null,
    val aiBaseUrl: String? = null,
    val aiModel: String? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
) : Parcelable

@Parcelize
@Serializable
data class AuthState(
    val isAuthenticated: Boolean = false,
    val user: User? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null
) : Parcelable
