import type { Note, NoteTreeItem } from '~~/shared/types'

function buildTree(notes: Note[]): NoteTreeItem[] {
	const map = new Map<string, NoteTreeItem>()
	const roots: NoteTreeItem[] = []

	// Create tree items with empty children arrays
	for (const note of notes) {
		map.set(note.id, { ...note, children: [] })
	}

	// Build the tree
	for (const note of notes) {
		const treeItem = map.get(note.id)!
		if (note.parent_id && map.has(note.parent_id)) {
			map.get(note.parent_id)!.children.push(treeItem)
		} else {
			roots.push(treeItem)
		}
	}

	return roots
}

export default defineEventHandler(async () => {
	const db = useDatabase()
	const { rows } = await db.sql`SELECT * FROM notes ORDER BY sort_order ASC, created_at ASC`
	return buildTree((rows as Note[]) || [])
})
