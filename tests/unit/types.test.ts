import { describe, it, expect } from 'vitest'
import type { Note, NoteTreeItem } from '../../shared/types'

describe('Note types', () => {
	it('Note interface has correct shape', () => {
		const note: Note = {
			id: 'abc123',
			title: 'Test',
			content: '# Hello',
			parent_id: null,
			is_folder: 0,
			sort_order: 0,
			created_at: '2025-01-01 00:00:00',
			updated_at: '2025-01-01 00:00:00',
		}

		expect(note.id).toBe('abc123')
		expect(note.is_folder).toBe(0)
		expect(note.parent_id).toBeNull()
	})

	it('NoteTreeItem extends Note with children', () => {
		const item: NoteTreeItem = {
			id: 'folder1',
			title: 'Folder',
			content: '',
			parent_id: null,
			is_folder: 1,
			sort_order: 0,
			created_at: '2025-01-01 00:00:00',
			updated_at: '2025-01-01 00:00:00',
			children: [
				{
					id: 'note1',
					title: 'Note',
					content: '# Hello',
					parent_id: 'folder1',
					is_folder: 0,
					sort_order: 0,
					created_at: '2025-01-01 00:00:00',
					updated_at: '2025-01-01 00:00:00',
					children: [],
				},
			],
		}

		expect(item.children).toHaveLength(1)
		expect(item.children[0].parent_id).toBe('folder1')
	})
})
