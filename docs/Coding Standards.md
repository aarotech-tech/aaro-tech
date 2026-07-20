# Coding Standards

- **Language**: TypeScript (strict mode enabled).
- **Linting**: ESLint is configured. Do not bypass lint rules without a valid `eslint-disable-next-line` comment and explanation.
- **Styling**: Tailwind CSS. Avoid arbitrary values unless absolutely necessary.
- **Error Handling**: Use the `AppError` class and wrap server actions in `withActionErrorHandling`.