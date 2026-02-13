import type { CreateNoteBody, Note } from '~~/shared/types'

export default defineEventHandler(async (event) => {
	const body = await readBody<CreateNoteBody>(event)
	const id = crypto.randomUUID().replace(/-/g, '')
	const title = body.title || 'Untitled'
	const content = body.content || ''
	const parentId = body.parent_id || null
	const isFolder = body.is_folder || 0

	const db = useDatabase()

	// Get the next sort order for the parent
	let sortOrder = 0
	if (parentId === null) {
		const { rows: sortRows } = await db.sql`
			SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order
			FROM notes
			WHERE parent_id IS NULL
		`
		sortOrder = (sortRows?.[0] as { next_order: number })?.next_order ?? 0
	} else {
		const { rows: sortRows } = await db.sql`
			SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order
			FROM notes
			WHERE parent_id = ${parentId}
		`
		sortOrder = (sortRows?.[0] as { next_order: number })?.next_order ?? 0
	}

	await db.sql`
		INSERT INTO notes (id, title, content, parent_id, is_folder, sort_order)
		VALUES (${id}, ${title}, ${content}, ${parentId}, ${isFolder}, ${sortOrder})
	`

	const { rows } = await db.sql`SELECT * FROM notes WHERE id = ${id}`
	return (rows as Note[])?.[0]
})
