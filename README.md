English | [简体中文](./README.zh-CN.md)

# Zenith Task Focus

Zenith Task Focus is a modern, feature-rich task management application designed to help you organize your tasks efficiently. It features a clean, intuitive user interface and powerful tools like a priority matrix, calendar view, and AI-powered task creation.

## ✨ Features

*   **Comprehensive Task Management:** Create, edit, delete, and track tasks with details like priority, due dates, and subtasks.
*   **Priority Matrix:** Organize tasks using the Eisenhower Matrix to focus on what's most important.
*   **Calendar View:** Visualize your tasks and deadlines in a full-featured calendar.
*   **AI-Powered Quick Add:** Use natural language to quickly add tasks, and let our AI parse the details.
*   **Recurring Tasks:** Set up tasks that repeat on a schedule.
*   **User Authentication:** Secure user accounts and data with Supabase Auth.
*   **Analytics:** Gain insights into your productivity and task completion trends.
*   **Cross-Platform:** Built with Capacitor to support native Android deployment.
*   **Theming:** Includes both Light and Dark mode.

## 🛠️ Tech Stack

*   **Frontend:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
*   **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions)
*   **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
*   **Routing:** [React Router](https://reactrouter.com/)
*   **Form Management:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
*   **Mobile:** [Capacitor](https://capacitorjs.com/)

## 💻 App Usage

Once the application is running, here's a typical workflow for using its key features:

1.  **Authentication**: You'll start on the login/signup page. Create a new account or log in with an existing one to access your personal task board.

2.  **Adding a New Task**:
    *   **Standard Method**: Click the "Add Task" button to open a form where you can input details like the task title, description, priority, and due date.
    *   **AI Quick Add**: Use the command bar at the top (often triggered by a shortcut like `Cmd+K` or `Ctrl+K`). Type your task in natural language (e.g., "send the weekly report every Friday at 4pm") and the AI will parse and create the task for you.

3.  **Organizing and Viewing Tasks**:
    *   **Task List View**: The main dashboard view, showing your tasks in a filterable and sortable list.
    *   **Priority Matrix**: Navigate to the "Priority Matrix" to see your tasks organized into the four Eisenhower quadrants (Urgent/Important).
    *   **Calendar View**: Switch to the "Calendar" to see your tasks plotted by their due dates.

4.  **Managing Tasks**:
    *   Click on any task card to open the Task Detail Modal.
    *   Here you can edit all task properties, add or complete subtasks, and view its history.
    *   Mark tasks as complete directly from the list view.

5.  **Settings**: Access the "Settings" page to manage your profile information and switch between light and dark themes.

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Bun](https://bun.sh/) or [npm](https://www.npmjs.com/)
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd zenith-task-focus
```

### 2. Install Dependencies

```bash
bun install
# or
npm install
```

### 3. Set Up Supabase Backend

This project uses Supabase for its backend. Follow these steps to connect it to your own Supabase project.

1.  **Create a Supabase Project:**
    If you don't have one already, go to [database.new](https://database.new) and create a new project.

2.  **Set Up the Database Schema:**
    Once your project is created, you need to set up the database. You can do this locally using the Supabase CLI.
    - **Log in to the Supabase CLI:**
      ```bash
      supabase login
      ```
    - **Link your local project to your remote Supabase project:**
      Find your Project Ref in your Supabase project's dashboard under **Project Settings > General**.
      ```bash
      supabase link --project-ref YOUR_PROJECT_REF
      ```
    - **Push the database migrations:**
      This command executes the SQL files in `supabase/migrations` to set up your database tables and functions.
      ```bash
      supabase db push
      ```

3.  **Configure Environment Variables:**
    The application needs to connect to your Supabase project using API keys.
    - **Create a local environment file:**
      Copy the example file to create your local configuration file.
      ```bash
      cp .env.example .env
      ```
    - **Add your Supabase keys:**
      Navigate to **Project Settings > API** in your Supabase dashboard. Find your **Project URL** and **Project API Keys** (use the `anon` `public` key).
    - **Update your `.env` file** with these values:
      ```env
      VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
      VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
      ```

### 4. Run the Development Server

```bash
bun run dev
# or
npm run dev
```

The application should now be running on `http://localhost:5173`.

## 📱 Building for Android

This project is configured to run as a native Android app using Capacitor.

**Prerequisites:**

*   [Android Studio](https://developer.android.com/studio) installed on your machine.

**Steps to Build:**

1.  **Build the Web App:**
    First, create a production build of the React application.
    ```bash
    npm run build
    ```

2.  **Sync Web Assets with Capacitor:**
    This command copies the web assets into the native Android project and updates the native dependencies.
    ```bash
    npx capacitor sync android
    ```

3.  **Open the Project in Android Studio:**
    This command will open your project in Android Studio, where you can build and run it.
    ```bash
    npx capacitor open android
    ```

4.  **Generate the App Bundle (AAB) or APK:**
    Once the project is open in Android Studio:
    *   Use the menu `Build > Generate Signed Bundle / APK...`
    *   Follow the on-screen instructions to create a new keystore for signing your app if you don't have one.
    *   Choose either `Android App Bundle` (recommended for Google Play) or `APK` for direct installation.
    *   After the build is complete, you can find the generated file in `android/app/release/`.

## 📜 Available Scripts

*   `dev`: Starts the development server.
*   `build`: Creates a production-ready build of the app.
*   `lint`: Lints the codebase using ESLint.
*   `preview`: Serves the production build locally for previewing.

## 📂 Project Structure

```
/
├── android/          # Capacitor configuration for Android
├── supabase/         # Supabase migrations and edge functions
├── src/
│   ├── components/   # Reusable UI components (features, layout, ui)
│   ├── contexts/     # React contexts (e.g., AuthContext)
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Top-level page components
│   ├── services/     # Services for interacting with APIs (e.g., Supabase)
│   ├── types/        # TypeScript type definitions
│   └── main.tsx      # Main application entry point
├── package.json
└── ...
```