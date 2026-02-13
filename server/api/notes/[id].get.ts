import type { Note } from '~~/shared/types'

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, 'id')
	if (!id) {
		throw createError({ statusCode: 400, statusMessage: 'Missing note ID' })
	}

	const db = useDatabase()
	const { rows } = await db.sql`SELECT * FROM notes WHERE id = ${id}`
	const note = (rows as Note[])?.[0]

	if (!note) {
		throw createError({ statusCode: 404, statusMessage: 'Note not found' })
	}

	return note
})
