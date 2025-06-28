# COCO Viewer

read the [README.md](README.md) file for a detailed overview of the project, including its purpose, features, and how to contribute.

## project structure

The project is structured as follows:

```bash
coco_viewer/
├── backend/         
├── frontend/
├── .gitignore
└── README.md
```

## common rules for both frontend and backend

- use `git` for version control.
- small, focused commits are preferred.
- use `conventional commits` for commit messages.
- keep the project well-documented.
- must keep documents up-to-date.

## Bbackend

backend is a Python application that serves as the backend for the COCO Viewer. It provides APIs to interact with COCO datasets.
this project uses `uv` to manage Python dependencies and run the application.

### backend structure

```bash
backend
├── app
│   ├── __init__.py
│   ├── main.py
│   └── services
│       └──coco_parser.py
├── pyproject.toml
└── uv.lock
```

following commands should be run in the `backend` directory.

### backend setup

```bash
uv sync
```

### lint, format and type-cheking

```bash
uv run ruff format app
uv run ruff check app --fix
uv run mypy app
```

### run the backend server

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### development rules

- use `uv` to manage dependencies and run the application.
- use `ruff` for linting and formatting.
- use `mypy` for type checking.
- docstrings should be written in numpy style.
- must add comment in english if the code is not self-explanatory.
- use type hints for all functions, methods, and classes.
- must use `pathlib` for file and directory operations.

## Frontend

frontend is a React application that provides the user interface for the COCO Viewer.

### frontend structure

```bash
frontend
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public
│   └── vite.svg
├── src
│   ├── App.tsx
│   ├── api
│   ├── assets
│   ├── components
│   ├── context
│   ├── hooks
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

following commands should be run in the `frontend` directory.

### frontend setup

```bash
npm install
```

### linting, format and type-checking

**Development (with auto-fix):**

```bash
npm run fix:all       # Run format + lint with auto-fix
npm run lint          # ESLint with auto-fix
npm run format        # Prettier with auto-fix
```

**CI/CD (check-only):**

```bash
npm run check:all     # Parallel check: lint + type-check + format
npm run lint:check    # ESLint check without auto-fix
npm run type-check    # TypeScript type checking
npm run format:check  # Prettier format check
```

### run the frontend server

```bash
npm run dev
```

### Front-end Coding Guidelines

- TypeScript
  - Strict mode on; every variable, parameter and return value must be typed.
  - Prefer clearly named interfaces / type aliases for API payloads and component props.
  - Rely on type inference only for simple local variables; avoid any unless unavoidable and documented.

- Components
  - Follow the Single-Responsibility Principle; split big UIs into focused parts.
  - Build re-usable, generic components for common patterns and keep them in src/components.
  - Minimise prop drilling; use React Context or a state library when data crosses >2 levels.
  - Apply one consistent styling system (e.g. Tailwind, CSS-modules); avoid large inline style blocks.

- State Management
  - Use React Context for modest, app-wide state.
  - For complex or high-frequency global state, adopt a library such as Zustand or Redux Toolkit.

- Performance
  - Enable code-splitting with React.lazy + Suspense.
  - Optimise images (compression, WebP, responsive sizes).
  - Memoise expensive calculations / components with React.memo, useMemo, useCallback.

- Accessibility
  - Write semantic HTML and add ARIA only when semantics fall short.
  - Guarantee keyboard navigation for every interactive element.
  - Maintain adequate color contrast across the UI.
