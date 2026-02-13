import type { UpdateNoteBody, Note } from '~~/shared/types'

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing note ID' })
	}

	const body = await readBody<UpdateNoteBody>(event)
	const db = useDatabase()

	// Check note exists
	const { rows: existing } = await db.sql`SELECT * FROM notes WHERE id = ${id}`
	if (!existing?.length) {
		throw createError({ statusCode: 404, statusMessage: 'Note not found' })
	}

	// Build update dynamically based on provided fields
	const note = existing[0] as Note
	const title = body.title !== undefined ? body.title : note.title
	const content = body.content !== undefined ? body.content : note.content
	const parentId = body.parent_id !== undefined ? body.parent_id : note.parent_id
	const sortOrder = body.sort_order !== undefined ? body.sort_order : note.sort_order

	await db.sql`
		UPDATE notes
		SET title = ${title},
			content = ${content},
			parent_id = ${parentId},
			sort_order = ${sortOrder},
			updated_at = datetime('now')
		WHERE id = ${id}
	`

	const { rows } = await db.sql`SELECT * FROM notes WHERE id = ${id}`
	return (rows as Note[])?.[0]
})
