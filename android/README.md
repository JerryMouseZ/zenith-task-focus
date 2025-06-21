# ZenithTask Android Client

An intelligent task management Android application that integrates with the ZenithTask backend services.

## Features

- **Priority Matrix**: Eisenhower Matrix-based task organization (Important/Urgent quadrants)
- **Task Management**: Full CRUD operations for tasks and subtasks
- **AI-Powered Quick Add**: Natural language task creation
- **Calendar Integration**: Timeline view with start/due dates
- **Analytics Dashboard**: Task completion metrics and productivity insights
- **Smart Scheduling**: Automatic time slot optimization
- **Real-time Sync**: Supabase integration for real-time data synchronization

## Architecture

- **UI Framework**: Jetpack Compose
- **Architecture Pattern**: MVVM + Repository Pattern
- **Dependency Injection**: Hilt
- **Network**: Supabase Android SDK + Ktor
- **Database**: Supabase (remote) + Room (local caching - planned)
- **Navigation**: Navigation Compose

## Project Structure

```
app/
├── data/
│   ├── local/          # Room database (planned)
│   ├── remote/         # Supabase API integration
│   ├── repository/     # Repository implementations
│   └── mapper/         # Data transformation
├── domain/
│   ├── model/          # Domain models
│   ├── repository/     # Repository interfaces
│   └── usecase/        # Business logic (planned)
├── presentation/
│   ├── ui/             # Compose screens
│   ├── viewmodel/      # ViewModels
│   ├── navigation/     # Navigation setup
│   └── theme/          # UI theming
└── di/                 # Dependency injection modules
```

## Setup

1. **Prerequisites**:
   - Android Studio Hedgehog or later
   - Android SDK 24+ (Android 7.0+)
   - Kotlin 1.9.22+

2. **Configuration**:
   - The Supabase URL and API key are already configured in `build.gradle.kts`
   - No additional setup required for basic functionality

3. **Build**:
   ```bash
   ./gradlew assembleDebug
   ```

4. **Run**:
   - Open the project in Android Studio
   - Run on device or emulator (API 24+)

## Current Status

### ✅ Completed
- Project structure and build configuration
- Supabase integration setup
- Authentication system (login/signup)
- Basic navigation structure
- Data models and DTOs
- Repository pattern implementation
- Basic UI screens with placeholders

### 🚧 In Progress
- Core UI components (Priority Matrix, Task List, etc.)
- Task CRUD operations
- AI integration for task parsing

### 📋 Planned
- Calendar view implementation
- Analytics dashboard
- Offline support with Room database
- Push notifications
- Advanced filtering and search
- Settings and user profile management

## Dependencies

### Core
- `androidx.core:core-ktx:1.12.0`
- `androidx.lifecycle:lifecycle-runtime-ktx:2.7.0`
- `androidx.activity:activity-compose:1.8.2`

### Compose
- `androidx.compose:compose-bom:2024.02.00`
- `androidx.compose.material3:material3`
- `androidx.navigation:navigation-compose:2.7.6`

### Dependency Injection
- `com.google.dagger:hilt-android:2.48.1`
- `androidx.hilt:hilt-navigation-compose:1.1.0`

### Networking
- `io.github.jan-tennert.supabase:postgrest-kt:2.1.3`
- `io.github.jan-tennert.supabase:gotrue-kt:2.1.3`
- `io.ktor:ktor-client-android:2.3.7`

### Data
- `androidx.room:room-runtime:2.6.1` (planned)
- `androidx.datastore:datastore-preferences:1.0.0`
- `org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2`

## API Integration

The app integrates with the following Supabase services:

- **Authentication**: User signup, login, session management
- **Database**: Tasks, subtasks, user profiles
- **Edge Functions**: AI task parsing, smart scheduling
- **Real-time**: Live updates for collaborative features (planned)

## Contributing

1. Follow the existing code structure and patterns
2. Use Jetpack Compose for all UI components
3. Implement proper error handling and loading states
4. Add appropriate tests for new features
5. Follow Material Design 3 guidelines

## License

This project is part of the ZenithTask ecosystem.
