export default defineNitroPlugin(async () => {
	const db = useDatabase()

	await db.sql`CREATE TABLE IF NOT EXISTS notes (
		id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
		title TEXT NOT NULL DEFAULT 'Untitled',
		content TEXT NOT NULL DEFAULT '',
		parent_id TEXT REFERENCES notes(id) ON DELETE SET NULL,
		is_folder INTEGER NOT NULL DEFAULT 0,
		sort_order INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL DEFAULT (datetime('now')),
		updated_at TEXT NOT NULL DEFAULT (datetime('now'))
	)`

	// Seed a welcome note if the table is empty
	const { rows } = await db.sql`SELECT COUNT(*) as count FROM notes`
	const count = (rows?.[0] as { count: number })?.count ?? 0

	if (count === 0) {
		const welcomeContent = `# Welcome to NuxtNotes! 📝

This is your first note. NuxtNotes is a local-first markdown notes app.

## Features

- **Markdown editing** with live preview
- **Syntax highlighting** for code blocks
- **Tree-based organization** with folders and notes
- **Dark/light mode** toggle
- **Auto-save** — your changes are saved automatically

## Markdown Examples

### Text Formatting

You can write **bold**, *italic*, ~~strikethrough~~, and \`inline code\`.

### Lists

- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

1. First
2. Second
3. Third

### Code Blocks

\`\`\`typescript
interface Note {
  id: string
  title: string
  content: string
  is_folder: number
}

function greet(name: string): string {
  return \\\`Hello, \\\${name}!\\\`
}
\`\`\`

\`\`\`python
def fibonacci(n: int) -> list[int]:
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib[:n]

print(fibonacci(10))
\`\`\`

### Links & Images

[Nuxt Documentation](https://nuxt.com)

### Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

### Tables

| Feature | Status |
|---------|--------|
| Markdown editing | ✅ |
| Live preview | ✅ |
| Folder organization | ✅ |
| Auto-save | ✅ |
| Dark mode | ✅ |

---

*Start creating your own notes using the sidebar!*
`

		await db.sql`INSERT INTO notes (id, title, content, is_folder, sort_order)
			VALUES ('welcome', 'Welcome to NuxtNotes', ${welcomeContent}, 0, 0)`

		// Seed a sample folder with a child note
		await db.sql`INSERT INTO notes (id, title, content, is_folder, sort_order)
			VALUES ('sample-folder', 'Getting Started', '', 1, 1)`

		await db.sql`INSERT INTO notes (id, title, content, is_folder, sort_order, parent_id)
			VALUES ('sample-note', 'Quick Tips', ${`# Quick Tips

## Keyboard Shortcuts

Use your browser's standard shortcuts for text editing.

## Organization

- Create **folders** to group related notes
- **Drag notes** between folders using the "Move to…" context menu option
- **Right-click** any item in the sidebar for more options

## View Modes

Switch between three view modes using the tabs above the editor:

1. **Edit** — Write raw markdown
2. **Preview** — See the rendered result
3. **Split** — Edit and preview side by side

Happy note-taking! 🚀
`}, 0, 0, 'sample-folder')`
	}
})
