package com.zenith.taskfocus.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.zenith.taskfocus.data.remote.AuthRemoteDataSource
import com.zenith.taskfocus.domain.model.AuthState
import com.zenith.taskfocus.domain.model.User
import com.zenith.taskfocus.domain.model.UserProfile
import com.zenith.taskfocus.domain.repository.AuthRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

@Singleton
class AuthRepositoryImpl @Inject constructor(
    @ApplicationContext private val context: Context,
    private val remoteDataSource: AuthRemoteDataSource
) : AuthRepository {
    
    private val ACCESS_TOKEN_KEY = stringPreferencesKey("access_token")
    private val REFRESH_TOKEN_KEY = stringPreferencesKey("refresh_token")
    
    override fun getAuthState(): Flow<AuthState> = flow {
        val user = getCurrentUser()
        val tokens = getStoredTokens()
        emit(
            AuthState(
                isAuthenticated = user != null,
                user = user,
                accessToken = tokens.first,
                refreshToken = tokens.second
            )
        )
    }
    
    override suspend fun getCurrentUser(): User? {
        return try {
            remoteDataSource.getCurrentUser()
        } catch (e: Exception) {
            null
        }
    }
    
    override suspend fun isAuthenticated(): Boolean {
        return getCurrentUser() != null
    }
    
    override suspend fun signIn(email: String, password: String): Result<User> {
        return try {
            val user = remoteDataSource.signIn(email, password)
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun signUp(email: String, password: String, fullName: String): Result<User> {
        return try {
            val user = remoteDataSource.signUp(email, password, fullName)
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun signOut(): Result<Unit> {
        return try {
            remoteDataSource.signOut()
            clearSession()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun refreshSession(): Result<Unit> {
        return try {
            remoteDataSource.refreshSession()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getUserProfile(): UserProfile? {
        val user = getCurrentUser() ?: return null
        return try {
            remoteDataSource.getUserProfile(user.id)
        } catch (e: Exception) {
            null
        }
    }
    
    override suspend fun updateUserProfile(profile: UserProfile): Result<UserProfile> {
        return try {
            val updatedProfile = remoteDataSource.updateUserProfile(profile.id, profile)
            Result.success(updatedProfile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun saveSession(accessToken: String, refreshToken: String) {
        context.dataStore.edit { preferences ->
            preferences[ACCESS_TOKEN_KEY] = accessToken
            preferences[REFRESH_TOKEN_KEY] = refreshToken
        }
    }
    
    override suspend fun clearSession() {
        context.dataStore.edit { preferences ->
            preferences.remove(ACCESS_TOKEN_KEY)
            preferences.remove(REFRESH_TOKEN_KEY)
        }
    }
    
    private suspend fun getStoredTokens(): Pair<String?, String?> {
        val preferences = context.dataStore.data.first()
        return Pair(
            preferences[ACCESS_TOKEN_KEY],
            preferences[REFRESH_TOKEN_KEY]
        )
    }
}
