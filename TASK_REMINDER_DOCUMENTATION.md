## Task Reminders via Feishu

Stay on top of your deadlines! This application can send reminders for tasks with upcoming due dates directly to your configured Feishu channel.

### User Guide

#### Setting Your Timezone

To ensure reminders are sent at the correct time according to your local timezone, it's important to set your timezone in your profile:

1.  Navigate to **Settings** (typically found in the main application menu or sidebar).
2.  Within Settings, select the **Profile** tab.
3.  Find the **Time Zone** dropdown menu.
4.  Choose your current local timezone from the list.
5.  Click the **Save Profile Changes** button to apply your selection.

If a timezone is not set in your profile, task reminder times will be based on Coordinated Universal Time (UTC).

#### How Task Reminders Work

-   For any task that has a specific due date and time, the system will aim to send a reminder message.
-   This reminder will be delivered to the Feishu channel associated with the configured Feishu bot.
-   Reminders are scheduled to be sent approximately **2 hours before** the task's due date and time.
-   The due date and time mentioned in the reminder message will be automatically adjusted to reflect the timezone you have set in your user profile. This helps you understand the deadline in your local context.
-   You will only receive one reminder per task. Reminders will not be sent for tasks that are already marked as 'completed' or 'deleted'.

### Admin & Developer Information

Proper configuration is essential for the Task Reminder feature to operate correctly.

-   **Feishu Webhook Configuration:**
    The core of the reminder system relies on a Feishu bot. The `FEISHU_WEBHOOK_URL` environment variable **must be configured** in your Supabase project's Edge Function settings (specifically for the `send-reminders` function). This URL is obtained when you create and configure an incoming webhook for a bot in your Feishu instance. Without this URL, reminders cannot be sent.

-   **Scheduling & Processing:**
    Task reminders are not sent instantaneously when a task is created. Instead, a background job (Supabase Edge Function named `send-reminders`) periodically checks for tasks that are approaching their due date. This job is configured to run at regular intervals (e.g., every 10 minutes, as defined in the `supabase/config.toml` file: `schedule = "*/10 * * * *"`). It then processes eligible tasks and dispatches reminders accordingly.

-   **Environment Variables for the Function:**
    The `send-reminders` Edge Function also relies on `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` if more privileged operations are needed) for interacting with your Supabase database. Ensure these are correctly set in the function's environment.
```
