# NuxtNotes

A local-first markdown notes app built with Nuxt 4 and SQLite. This is an **example project for a coding tutorial** demonstrating how to build a full-stack application with modern web technologies.

![Nuxt](https://img.shields.io/badge/Nuxt-4.3-00DC82?logo=nuxtdotjs&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-local-003B57?logo=sqlite&logoColor=white)

## Features

- 📝 Create, edit, and delete markdown notes
- 📁 Organise notes into folders with drag-and-drop nesting
- ✍️ Live markdown preview with syntax-highlighted code blocks
- 💾 Auto-save with debounced writes
- 🌗 Dark and light mode
- 🔍 Split, edit, and preview tabs
- 🗄️ Local SQLite database — no external services required

## Tech Stack

### Nuxt 4

The app is built on [Nuxt 4](https://nuxt.com), the latest major version of the Vue meta-framework. Nuxt 4 introduces the `app/` directory convention, improved auto-imports, and a shared `shared/` directory for types used across both client and server code.

### Nuxt UI v4

[Nuxt UI](https://ui.nuxt.com) provides the component library — buttons, tabs, modals, context menus, colour mode toggle, and more. It ships with Tailwind CSS v4 under the hood, so no separate Tailwind setup is needed.

### SQLite via Nitro db0

Data is stored in a local SQLite database using Nitro's built-in [db0](https://db0.unjs.io) database layer. This uses Node.js 22.5+'s native `node:sqlite` module, meaning there are no native binary dependencies to compile. The database file lives at `.data/notes.sqlite3` and is created automatically on first run.

### Markdown Rendering

Notes are rendered client-side using [markdown-it](https://github.com/markdown-it/markdown-it) with the [@shikijs/markdown-it](https://shiki.style) plugin for syntax highlighting. Code blocks support dual themes (light and dark) that switch automatically with the app's colour mode.

### Testing

The project includes a [Vitest](https://vitest.dev) setup with three test projects:

- **Unit tests** — pure logic tests (tree building, type validation)
- **Nuxt component tests** — component rendering via `@nuxt/test-utils` and `happy-dom`
- **E2E tests** — full API and browser tests using Playwright

## Prerequisites

- **Node.js 22.5+** (required for the built-in `node:sqlite` module)
- **npm**

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000). A welcome note and sample folder are created automatically on first launch.

## Project Structure

```
nuxt-notes/
├── app/
│   ├── assets/css/main.css        # Tailwind + typography plugin
│   ├── components/
│   │   ├── MarkdownPreview.vue    # Markdown rendering with shiki
│   │   ├── NoteEditor.vue         # Editor with tabs (edit/preview/split)
│   │   ├── NoteTree.vue           # Sidebar tree container
│   │   └── NoteTreeItem.vue       # Recursive tree item with context menu
│   ├── composables/
│   │   └── useNotes.ts            # Central state management
│   ├── pages/
│   │   └── index.vue              # Main two-column layout
│   └── app.vue                    # Root component
├── server/
│   ├── api/notes/                 # REST API routes
│   │   ├── tree.get.ts            # GET  /api/notes/tree
│   │   ├── index.post.ts          # POST /api/notes
│   │   ├── [id].get.ts            # GET  /api/notes/:id
│   │   ├── [id].put.ts            # PUT  /api/notes/:id
│   │   └── [id].delete.ts         # DELETE /api/notes/:id
│   └── plugins/
│       └── db.ts                  # Database initialisation & seed data
├── shared/
│   └── types/
│       └── index.ts               # Shared TypeScript interfaces
├── tests/
│   ├── unit/                      # Unit tests
│   ├── nuxt/                      # Component tests
│   └── e2e/                       # End-to-end tests
├── nuxt.config.ts
├── vitest.config.ts
└── package.json
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests only |
| `npm run test:e2e` | Run end-to-end tests only |

## API

All endpoints are prefixed with `/api/notes`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/notes/tree` | Get the full note tree |
| `GET` | `/api/notes/:id` | Get a single note |
| `POST` | `/api/notes` | Create a note or folder |
| `PUT` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Recursively delete a note/folder |

## Licence

This project is provided as a tutorial example and is available under the [MIT](https://opensource.org/licenses/MIT) licence.
