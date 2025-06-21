package com.zenith.taskfocus.data.remote

import com.zenith.taskfocus.data.mapper.UserMapper.toDomain
import com.zenith.taskfocus.data.mapper.UserMapper.toUpdateRequest
import com.zenith.taskfocus.data.remote.dto.UpdateProfileRequest
import com.zenith.taskfocus.data.remote.dto.UserProfileDto
import com.zenith.taskfocus.domain.model.User
import com.zenith.taskfocus.domain.model.UserProfile
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.postgrest.from
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRemoteDataSource @Inject constructor() {
    
    private val supabase = SupabaseClient.client
    
    suspend fun signIn(email: String, password: String): User {
        supabase.auth.signInWith(Email) {
            this.email = email
            this.password = password
        }
        
        val userInfo = supabase.auth.currentUserOrNull()
            ?: throw Exception("Failed to get user after sign in")
        
        return userInfo.toDomain()
    }
    
    suspend fun signUp(email: String, password: String, fullName: String): User {
        supabase.auth.signUpWith(Email) {
            this.email = email
            this.password = password
            data = mapOf("full_name" to fullName)
        }
        
        val userInfo = supabase.auth.currentUserOrNull()
            ?: throw Exception("Failed to get user after sign up")
        
        return userInfo.toDomain()
    }
    
    suspend fun signOut() {
        supabase.auth.signOut()
    }
    
    suspend fun getCurrentUser(): User? {
        return supabase.auth.currentUserOrNull()?.toDomain()
    }
    
    suspend fun refreshSession() {
        supabase.auth.refreshCurrentSession()
    }
    
    suspend fun getUserProfile(userId: String): UserProfile? {
        return supabase.from("profiles")
            .select {
                filter {
                    eq("id", userId)
                }
            }
            .decodeSingleOrNull<UserProfileDto>()
            ?.toDomain()
    }
    
    suspend fun updateUserProfile(userId: String, profile: UserProfile): UserProfile {
        val request = profile.toUpdateRequest()
        return supabase.from("profiles")
            .update(request) {
                filter {
                    eq("id", userId)
                }
                select()
            }
            .decodeSingle<UserProfileDto>()
            .toDomain()
    }
}
