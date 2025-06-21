package com.zenith.taskfocus.domain.repository

import com.zenith.taskfocus.domain.model.AuthState
import com.zenith.taskfocus.domain.model.User
import com.zenith.taskfocus.domain.model.UserProfile
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    
    // Authentication state
    fun getAuthState(): Flow<AuthState>
    suspend fun getCurrentUser(): User?
    suspend fun isAuthenticated(): Boolean
    
    // Authentication operations
    suspend fun signIn(email: String, password: String): Result<User>
    suspend fun signUp(email: String, password: String, fullName: String): Result<User>
    suspend fun signOut(): Result<Unit>
    suspend fun refreshSession(): Result<Unit>
    
    // Profile operations
    suspend fun getUserProfile(): UserProfile?
    suspend fun updateUserProfile(profile: UserProfile): Result<UserProfile>
    
    // Session management
    suspend fun saveSession(accessToken: String, refreshToken: String)
    suspend fun clearSession()
}
