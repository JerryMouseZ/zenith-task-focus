# Agent Guidelines for Zenith Task Focus

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Testing
- Tests use vitest framework (only validation tests exist currently)
- Run single test: `npx vitest src/utils/__tests__/validationUtils.test.ts`
- Test files follow pattern `*.test.ts`

## Code Style Guidelines
- **Imports**: Use `@/` for src imports, organize external imports first, then internal
- **Types**: Use TypeScript enums (TaskStatus, TaskPriority), interfaces over types
- **Naming**: PascalCase for components, camelCase for functions/variables, kebab-case for files
- **Components**: Export as named exports, use interface for props with Props suffix
- **Error Handling**: Comprehensive validation with Chinese error messages (see validationUtils)
- **Formatting**: Use double quotes, semicolons optional, destructuring preferred
- **State**: React Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with utility classes, responsive design with sm: prefix

## Special Notes
- TypeScript strict mode is disabled (noImplicitAny: false, strictNullChecks: false)
- Uses Supabase for backend, Capacitor for mobile, shadcn/ui components
- Path alias `@/*` maps to `src/*`