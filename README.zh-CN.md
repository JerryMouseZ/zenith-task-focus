# Zenith Task Focus

Zenith Task Focus 是一款功能丰富的现代化任务管理应用，旨在帮助您高效地组织任务。它拥有简洁直观的用户界面和强大的工具，如优先级矩阵、日历视图和 AI 驱动的任务创建功能。

## ✨ 功能

*   **全面的任务管理:** 创建、编辑、删除和跟踪任务，包含优先级、截止日期和子任务等详细信息。
*   **优先级矩阵:** 使用艾森豪威尔矩阵（Eisenhower Matrix）来组织任务，让您专注于最重要的事情。
*   **日历视图:** 在功能齐全的日历中可视化您的任务和截止日期。
*   **AI 快速添加:** 使用自然语言快速添加任务，我们的人工智能将为您解析细节。
*   **重复任务:** 设置按计划重复的任务。
*   **用户认证:** 使用 Supabase Auth 保护用户帐户和数据安全。
*   **数据分析:** 深入了解您的生产力和任务完成趋势。
*   **跨平台:** 使用 Capacitor 构建，支持原生 Android 部署。
*   **主题切换:** 支持浅色和深色两种模式。

## 🛠️ 技术栈

*   **前端:** [React](https://react.dev/), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **UI:** [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
*   **后端 & 数据库:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions)
*   **状态管理:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
*   **路由:** [React Router](https://reactrouter.com/)
*   **表单管理:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) (用于数据校验)
*   **移动端:** [Capacitor](https://capacitorjs.com/)

## 💻 如何使用

应用运行后，您可以按照以下典型工作流程来使用其核心功能：

1.  **用户认证**: 您将从登录/注册页面开始。创建一个新帐户或使用现有帐户登录，以访问您的个人任务面板。

2.  **添加新任务**:
    *   **标准方式**: 点击“添加任务”按钮，会弹出一个表单，您可以在其中输入任务标题、描述、优先级和截止日期等详细信息。
    *   **AI 快速添加**: 使用顶部的命令栏（通常通过快捷键 `Cmd+K` 或 `Ctrl+K` 触发）。用自然语言输入您的任务（例如，“每周五下午4点发送周报”），AI 将为您解析并创建任务。

3.  **查看与组织任务**:
    *   **任务列表视图**: 主仪表板视图，以可筛选和可排序的列表显示您的任务。
    *   **优先级矩阵**: 导航到“优先级矩阵”，您的任务将按照艾森豪威尔四象限（紧急/重要）进行组织。
    *   **日历视图**: 切换到“日历”，可以按截止日期查看您的任务安排。

4.  **管理任务**:
    *   点击任何任务卡片以打开任务详情弹窗。
    *   在这里，您可以编辑所有任务属性、添加或完成子任务，以及查看其历史记录。
    *   直接在列表视图中将任务标记为完成。

5.  **设置**: 访问“设置”页面来管理您的个人资料信息，并切换浅色或深色主题。

## 🚀 开始使用

请按照以下步骤在本地设置并运行项目。

### 先决条件

*   [Node.js](https://nodejs.org/) (建议 v18 或更高版本)
*   [Bun](https://bun.sh/) 或 [npm](https://www.npmjs.com/)
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

### 1. 克隆仓库

```bash
git clone <YOUR_GIT_URL>
cd zenith-task-focus
```

### 2. 安装依赖

```bash
bun install
# 或
npm install
```

### 3. 设置 Supabase 后端

本项目使用 Supabase 作为后端。请按照以下步骤连接到您自己的 Supabase 项目。

1.  **创建 Supabase 项目:**
    如果您还没有项目，请访问 [database.new](https://database.new) 创建一个新项目。

2.  **设置数据库结构:**
    项目创建后，您需要设置数据库。您可以使用 Supabase CLI 在本地完成此操作。
    - **登录 Supabase CLI:**
      ```bash
      supabase login
      ```
    - **将本地项目链接到您的远程 Supabase 项目:**
      在您的 Supabase 项目仪表板的 **Project Settings > General** 中找到您的项目引用 (Project Ref)。
      ```bash
      supabase link --project-ref YOUR_PROJECT_REF
      ```
    - **推送数据库迁移:**
      此命令将执行 `supabase/migrations` 目录中的 SQL 文件，以设置您的数据库表和函数。
      ```bash
      supabase db push
      ```

3.  **配置环境变量:**
    应用程序需要使用 API 密钥连接到您的 Supabase 项目。
    - **创建本地环境文件:**
      复制示例文件以创建您的本地配置文件。
      ```bash
      cp .env.example .env
      ```
    - **添加您的 Supabase 密钥:**
      在您的 Supabase 仪表板中，导航至 **Project Settings > API**。找到您的 **Project URL** 和 **Project API Keys** (请使用 `anon` `public` 密钥)。
    - **使用这些值更新您的 `.env` 文件:**
      ```env
      VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
      VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
      ```

### 4. 运行开发服务器

```bash
bun run dev
# 或
npm run dev
```

现在，应用程序应该已在 `http://localhost:5173` 上运行。

## 📱 构建 Android 应用

本项目已配置为使用 Capacitor 作为原生 Android 应用运行。

**先决条件:**

*   您的电脑上已安装 [Android Studio](https://developer.android.com/studio)。

**构建步骤:**

1.  **构建 Web 应用:**
    首先，创建 React 应用的生产版本。
    ```bash
    npm run build
    ```

2.  **使用 Capacitor 同步 Web 资源:**
    此命令会将 Web 资源复制到原生 Android 项目中，并更新原生依赖项。
    ```bash
    npx capacitor sync android
    ```

3.  **在 Android Studio 中打开项目:**
    此命令将在 Android Studio 中打开您的项目，您可以在其中进行构建和运行。
    ```bash
    npx capacitor open android
    ```

4.  **生成应用包 (AAB) 或 APK:**
    在 Android Studio 中打开项目后：
    *   使用菜单 `Build > Generate Signed Bundle / APK...`
    *   如果您没有密钥库 (keystore)，请按照屏幕上的说明创建一个用于为应用签名的新密钥库。
    *   选择 `Android App Bundle` (推荐用于 Google Play) 或 `APK` (用于直接安装)。
    *   构建完成后，您可以在 `android/app/release/` 目录中找到生成的文件。

## 📜 可用脚本

*   `dev`: 启动开发服务器。
*   `build`: 创建生产环境的应用构建包。
*   `lint`: 使用 ESLint 检查代码。
*   `preview`: 在本地预览生产构建包。

## 📂 项目结构

```
/
├── android/          # Capacitor 安卓配置
├── supabase/         # Supabase 迁移和边缘函数
├── src/
│   ├── components/   # 可复用 UI 组件 (功能, 布局, UI)
│   ├── contexts/     # React 上下文 (例如 AuthContext)
│   ├── hooks/        # 自定义 React 钩子
│   ├── pages/        # 顶层页面组件
│   ├── services/     # 与 API 交互的服务 (例如 Supabase)
│   ├── types/        # TypeScript 类型定义
│   └── main.tsx      # 应用主入口文件
├── package.json
└── ...
```
