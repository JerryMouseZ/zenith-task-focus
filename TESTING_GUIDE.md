# Testing Guide: Send Reminders Functionality

This guide provides instructions for testing the `send-reminders` Edge Function and related profile timezone settings.

## I. Local Supabase Setup and Environment Variables

1.  **Ensure Local Supabase is Running:**
    *   Install the Supabase CLI if you haven't already.
    *   Start your local Supabase instance:
        ```bash
        supabase start
        ```
    *   Note the local Supabase URL and API keys provided in the output.

2.  **Environment Variables for the Edge Function:**
    *   Create a `.env` file located at `supabase/functions/.env.local`. This file will be automatically loaded when you serve functions locally.
    *   Add the following variables to the `.env.local` file, replacing placeholder values with your actual local Supabase details and a mock webhook URL:

        ```env
        SUPABASE_URL="http://localhost:54321" # Verify this from 'supabase start' output (API URL)
        SUPABASE_ANON_KEY="your_local_anon_key" # Verify this from 'supabase start' output
        # SUPABASE_SERVICE_ROLE_KEY="your_local_service_role_key" # Only if your function requires service_role privileges
        FEISHU_WEBHOOK_URL="your_mock_feishu_webhook_url"
        ```

    *   **Mock Feishu Webhook:** For `FEISHU_WEBHOOK_URL`, use a service like [Webhook.site](https://webhook.site/) or [Pipedream](https://pipedream.com/). These services provide a URL that will capture and display any HTTP requests sent to them, allowing you to inspect the payload from the `send-reminders` function.

## II. Test Data Setup

You'll need to populate your local database with test users and tasks. You can do this via SQL in the Supabase Studio SQL Editor or by using the application UI if user creation and task creation are implemented.

**Important:** Some `due_date` values for tasks need to be set relative to the current time (`NOW()`) when you are performing the test to ensure they fall into the correct reminder window.

1.  **User Profiles with Timezones:**
    *   First, ensure corresponding users exist in `auth.users`. You can sign them up via your application or manually insert them if you know how to manage Supabase auth tables.
    *   Let's assume you have users with IDs: `'auth_user_id_1'`, `'auth_user_id_2'`, `'auth_user_id_3'`. Update these IDs in the `profiles` table inserts.

    ```sql
    -- Ensure these user IDs match existing entries in auth.users table.
    -- The 'id' in 'profiles' should be the UUID of the authenticated user.
    INSERT INTO public.profiles (id, email, full_name, timezone) VALUES
    ('auth_user_id_1', 'user1@example.com', 'User One NY', 'America/New_York'),
    ('auth_user_id_2', 'user2@example.com', 'User Two London', 'Europe/London'),
    ('auth_user_id_3', 'user3@example.com', 'User Three UTC', NULL) -- This user has no timezone set (should default to UTC)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        timezone = EXCLUDED.timezone;
    ```

2.  **Tasks with Various Due Dates and States:**
    *   Adjust `user_id` to match the UUIDs of the users created above.
    *   **Execute these INSERT statements at the time of testing**, as `NOW()` will be evaluated then.

    ```sql
    -- Task 1: Due in ~1 hour 58 minutes (should trigger reminder). For user_id_1.
    INSERT INTO public.tasks (user_id, title, due_date, status, priority, description) VALUES
    ('auth_user_id_1', 'Task NYC Due Soon', NOW() + INTERVAL '1 hour 58 minutes', 'todo', 'high', 'This task should trigger a reminder for user in New York.');

    -- Task 2: Due in ~3 hours (should NOT trigger reminder yet). For user_id_2.
    INSERT INTO public.tasks (user_id, title, due_date, status, priority, description) VALUES
    ('auth_user_id_2', 'Task London Due Later', NOW() + INTERVAL '3 hours', 'todo', 'medium', 'This task is too far in the future for a reminder.');

    -- Task 3: Due in ~1 hour 50 minutes, but reminder_sent_at is already set (should NOT trigger). For user_id_1.
    INSERT INTO public.tasks (user_id, title, due_date, status, priority, description, reminder_sent_at) VALUES
    ('auth_user_id_1', 'Task NYC Already Reminded', NOW() + INTERVAL '1 hour 50 minutes', 'todo', 'high', 'This task should not trigger a new reminder as one was already sent.', NOW() - INTERVAL '10 minutes');

    -- Task 4: Due in ~1 hour 55 minutes, status is 'completed' (should NOT trigger). For user_id_2.
    INSERT INTO public.tasks (user_id, title, due_date, status, priority, description) VALUES
    ('auth_user_id_2', 'Task London Completed', NOW() + INTERVAL '1 hour 55 minutes', 'completed', 'low', 'Completed tasks should not trigger reminders.');

    -- Task 5: Due in ~1 hour 59 minutes. For user_id_3 (no timezone, should use UTC for reminder).
    INSERT INTO public.tasks (user_id, title, due_date, status, priority, description) VALUES
    ('auth_user_id_3', 'Task UTC Due Soon No TZ', NOW() + INTERVAL '1 hour 59 minutes', 'todo', 'high', 'This task is for a user with no timezone, should use UTC.');

    -- Task 6: Due in 1 minute (should trigger reminder, tests edge case of being very close to due date but still within reminder window). For user_id_1.
    INSERT INTO public.tasks (user_id, title, due_date, status, priority, description) VALUES
    ('auth_user_id_1', 'Task NYC Due in 1 Min', NOW() + INTERVAL '1 minute', 'todo', 'critical', 'This task is due very soon.');

    -- Task 7: Due in 2 hours (exact boundary, should trigger). For user_id_2
    INSERT INTO public.tasks (user_id, title, due_date, status, priority, description) VALUES
    ('auth_user_id_2', 'Task London Due in 2 Hours Exact', NOW() + INTERVAL '2 hours', 'todo', 'high', 'This task is exactly 2 hours away.');
    ```

## III. Running the Edge Function Locally

1.  **Serve the function:**
    Open a terminal in your Supabase project root and run:
    ```bash
    supabase functions serve send-reminders --env-file ./supabase/functions/.env.local --no-verify-jwt
    ```
    *   `--env-file ./supabase/functions/.env.local` ensures your environment variables are loaded.
    *   `--no-verify-jwt` is used for ease of testing locally; in production, JWT verification is important.
    *   The command output will show the URL where the function is being served (e.g., `http://localhost:<port>/send-reminders`). Note this URL.

2.  **Invoke the function:**
    The `send-reminders` function is designed to be triggered by a cron schedule, but for testing, you can invoke it via an HTTP POST request. Open a new terminal and use `curl` (or a tool like Postman/Insomnia):

    ```bash
    curl -i -X POST http://localhost:54321/functions/v1/send-reminders \
      -H "Authorization: Bearer your_local_anon_key" \
      -H "Content-Type: application/json" \
      -d '{}'
    ```
    *   Replace `http://localhost:54321/functions/v1/send-reminders` with the actual URL shown by the `supabase functions serve` command if it's different (especially the port).
    *   Replace `your_local_anon_key` with the actual Supabase anon key for your local instance.

## IV. Verification Steps

1.  **Function Logs:**
    Examine the console output from the `supabase functions serve send-reminders` command. Look for:
    *   Confirmation messages like:
        *   `No tasks found needing reminders in the initial fetch window.` (if no tasks currently meet the broad criteria)
        *   `Feishu reminder sent for task <task_id>`
        *   `Processed tasks. Reminders sent: X`
    *   Dates and times in log messages, especially the `formattedDueDate` in the Feishu payload, to ensure they reflect the user's timezone correctly (or UTC for users without a timezone).
    *   Any error messages:
        *   `Missing environment variables...`
        *   `Error fetching tasks:...`
        *   `Error fetching profile for user ...`
        *   `Feishu API error for task ...`
        *   `Error updating task ...`

2.  **Database State:**
    After invoking the function, query your local `tasks` table in Supabase Studio:
    ```sql
    SELECT id, title, due_date, reminder_sent_at, status, user_id
    FROM public.tasks
    ORDER BY due_date;
    ```
    *   **Verify `reminder_sent_at`:**
        *   Task 1 ('Task NYC Due Soon') should have `reminder_sent_at` populated with a recent timestamp.
        *   Task 5 ('Task UTC Due Soon No TZ') should have `reminder_sent_at` populated.
        *   Task 6 ('Task NYC Due in 1 Min') should have `reminder_sent_at` populated.
        *   Task 7 ('Task London Due in 2 Hours Exact') should have `reminder_sent_at` populated.
    *   **Verify `reminder_sent_at` is NOT updated (i.e., remains `NULL`) for:**
        *   Task 2 ('Task London Due Later')
        *   Task 3 ('Task NYC Already Reminded') - it was already set, function shouldn't change it.
        *   Task 4 ('Task London Completed')

3.  **Mock Feishu Endpoint:**
    Check the dashboard or logs of the service you used for `FEISHU_WEBHOOK_URL` (e.g., Webhook.site):
    *   You should see incoming POST requests for each task that was expected to trigger a reminder (Task 1, Task 5, Task 6, Task 7).
    *   Inspect the JSON payload of these requests:
        *   `msg_type` should be `"text"`.
        *   `content.text` should be `Reminder: Task "<Task Title>" is due at <Formatted Due Date>.`
        *   Verify `<Task Title>` is correct.
        *   Verify `<Formatted Due Date>` is accurate and includes the correct timezone abbreviation (e.g., "Sep 15, 2023, 14:30 (America/New_York)" or "Sep 15, 2023, 18:30 (UTC)" for the user with no timezone).

## V. UI Testing (Manual)

This section focuses on the user profile timezone setting in the application UI.

1.  **Profile Timezone Setting:**
    *   Log in as a user (e.g., `user1@example.com` / `auth_user_id_1`).
    *   Navigate to the "Settings" page in the application.
    *   Find the "Profile" tab and the "Time Zone" selector.
    *   **Initial State:** Verify if the currently selected timezone in the dropdown matches what's in `public.profiles` for this user (e.g., 'America/New_York').
    *   **Update Timezone:** Select a new timezone from the dropdown (e.g., 'Asia/Tokyo').
    *   Click "Save Profile Changes".
    *   Verify a success toast message appears.
    *   **Persistence Check 1 (UI):** Refresh the page or navigate away and back to the Settings page. The "Time Zone" selector should show 'Asia/Tokyo'.
    *   **Persistence Check 2 (DB):** Query the database:
        ```sql
        SELECT id, email, timezone FROM public.profiles WHERE id = 'auth_user_id_1';
        ```
        Verify the `timezone` column is updated to 'Asia/Tokyo'.
    *   **Test with Empty/UTC:** Select "UTC" or a "(UTC) Coordinated Universal Time" option if available, save, and verify. If you have a way to clear the timezone (e.g., a "Select your time zone" placeholder that effectively means NULL), test that it correctly sets the DB to `NULL` or 'UTC'.

2.  **(Optional) End-to-End Reminder Flow (Conceptual):**
    This is a more advanced test combining UI and function invocation.
    *   Using the UI, set a specific timezone for a test user (e.g., `user1@example.com` to 'America/Los_Angeles').
    *   Using the UI (if possible) or SQL, create a new task for this user with a `due_date` that is approximately 1 hour and 59 minutes from the current time.
    *   Manually invoke the `send-reminders` Edge Function locally as described in Section III.
    *   Check your mock Feishu endpoint. The reminder message should show the task's due time converted to 'America/Los_Angeles' time.
    *   Check the `tasks` table in the database to ensure `reminder_sent_at` is set for this task.

This concludes the testing guide. Remember to adjust user IDs and dynamic values like `NOW()` + intervals according to your specific test execution times.
