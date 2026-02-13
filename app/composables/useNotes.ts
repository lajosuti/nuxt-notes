import type { Note, NoteTreeItem, CreateNoteBody, UpdateNoteBody } from '~~/shared/types'

export function useNotes() {
	const tree = useState<NoteTreeItem[]>('notes-tree', () => [])
	const selectedNoteId = useState<string | null>('selected-note-id', () => null)
	const selectedNote = useState<Note | null>('selected-note', () => null)
	const saveStatus = useState<'idle' | 'saving' | 'saved'>('save-status', () => 'idle')

	let saveTimeout: ReturnType<typeof setTimeout> | null = null
	let statusTimeout: ReturnType<typeof setTimeout> | null = null

	async function fetchTree() {
		tree.value = await $fetch<NoteTreeItem[]>('/api/notes/tree')
	}

	async function fetchNote(id: string) {
		selectedNote.value = await $fetch<Note>(`/api/notes/${id}`)
	}

	async function selectNote(id: string) {
		selectedNoteId.value = id
		await fetchNote(id)
	}

	function clearSelection() {
		selectedNoteId.value = null
		selectedNote.value = null
	}

	async function createNote(parentId?: string | null, isFolder: boolean = false) {
		const body: CreateNoteBody = {
			title: isFolder ? 'New Folder' : 'Untitled',
			parent_id: parentId || null,
			is_folder: isFolder ? 1 : 0,
		}
		const created = await $fetch<Note>('/api/notes', {
			method: 'POST',
			body,
		})
		await fetchTree()
		if (!isFolder) {
			await selectNote(created.id)
		}
		return created
	}

	async function updateNote(id: string, data: UpdateNoteBody) {
		const updated = await $fetch<Note>(`/api/notes/${id}`, {
			method: 'PUT',
			body: data,
		})
		// Refresh tree if title or parent changed
		if (data.title !== undefined || data.parent_id !== undefined) {
			await fetchTree()
		}
		// Refresh selected note if it's the one we updated
		if (selectedNoteId.value === id) {
			selectedNote.value = updated
		}
		return updated
	}

	async function deleteNote(id: string) {
		await $fetch(`/api/notes/${id}`, { method: 'DELETE' })
		await fetchTree()
		if (selectedNoteId.value === id) {
			clearSelection()
		}
	}

	async function renameNote(id: string, title: string) {
		return updateNote(id, { title })
	}

	async function moveNote(id: string, newParentId: string | null) {
		return updateNote(id, { parent_id: newParentId })
	}

	function saveContent(content: string) {
		if (!selectedNoteId.value) return

		// Clear previous debounce timer
		if (saveTimeout) {
			clearTimeout(saveTimeout)
		}

		const noteId = selectedNoteId.value

		saveTimeout = setTimeout(async () => {
			saveStatus.value = 'saving'
			try {
				await $fetch(`/api/notes/${noteId}`, {
					method: 'PUT',
					body: { content },
				})
				// Update local state
				if (selectedNote.value && selectedNote.value.id === noteId) {
					selectedNote.value = { ...selectedNote.value, content }
				}
				saveStatus.value = 'saved'

				// Reset status after 2 seconds
				if (statusTimeout) clearTimeout(statusTimeout)
				statusTimeout = setTimeout(() => {
					saveStatus.value = 'idle'
				}, 2000)
			} catch {
				saveStatus.value = 'idle'
			}
		}, 500)
	}

	return {
		tree,
		selectedNoteId,
		selectedNote,
		saveStatus,
		fetchTree,
		fetchNote,
		selectNote,
		clearSelection,
		createNote,
		updateNote,
		deleteNote,
		renameNote,
		moveNote,
		saveContent,
	}
}
