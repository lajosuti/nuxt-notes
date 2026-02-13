export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing note ID' })
	}

	const db = useDatabase()

	// Check note exists
	const { rows: existing } = await db.sql`SELECT * FROM notes WHERE id = ${id}`
	if (!existing?.length) {
		throw createError({ statusCode: 404, statusMessage: 'Note not found' })
	}

	// Recursively delete all descendants using a CTE
	await db.sql`
		WITH RECURSIVE descendants(id) AS (
			SELECT id FROM notes WHERE id = ${id}
			UNION ALL
			SELECT n.id FROM notes n
			INNER JOIN descendants d ON n.parent_id = d.id
		)
		DELETE FROM notes WHERE id IN (SELECT id FROM descendants)
	`

	return { success: true }
})
