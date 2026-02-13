import { describe, it, expect } from 'vitest'
import type { Note, NoteTreeItem } from '../../shared/types'

// Test the tree-building logic (same algorithm as server/api/notes/tree.get.ts)
function buildTree(notes: Note[]): NoteTreeItem[] {
	const map = new Map<string, NoteTreeItem>()
	const roots: NoteTreeItem[] = []

	for (const note of notes) {
		map.set(note.id, { ...note, children: [] })
	}

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

function makeNote(overrides: Partial<Note> = {}): Note {
	return {
		id: 'test-id',
		title: 'Test Note',
		content: '',
		parent_id: null,
		is_folder: 0,
		sort_order: 0,
		created_at: '2025-01-01 00:00:00',
		updated_at: '2025-01-01 00:00:00',
		...overrides,
	}
}

describe('buildTree', () => {
	it('returns empty array for no notes', () => {
		expect(buildTree([])).toEqual([])
	})

	it('returns root-level notes', () => {
		const notes = [
			makeNote({ id: '1', title: 'Note 1' }),
			makeNote({ id: '2', title: 'Note 2' }),
		]
		const tree = buildTree(notes)
		expect(tree).toHaveLength(2)
		expect(tree[0].title).toBe('Note 1')
		expect(tree[1].title).toBe('Note 2')
		expect(tree[0].children).toEqual([])
		expect(tree[1].children).toEqual([])
	})

	it('nests children under parent folders', () => {
		const notes = [
			makeNote({ id: 'folder', title: 'My Folder', is_folder: 1 }),
			makeNote({ id: 'child', title: 'Child Note', parent_id: 'folder' }),
		]
		const tree = buildTree(notes)
		expect(tree).toHaveLength(1)
		expect(tree[0].title).toBe('My Folder')
		expect(tree[0].children).toHaveLength(1)
		expect(tree[0].children[0].title).toBe('Child Note')
	})

	it('handles deeply nested trees', () => {
		const notes = [
			makeNote({ id: 'f1', title: 'Level 1', is_folder: 1 }),
			makeNote({ id: 'f2', title: 'Level 2', is_folder: 1, parent_id: 'f1' }),
			makeNote({ id: 'n1', title: 'Deep Note', parent_id: 'f2' }),
		]
		const tree = buildTree(notes)
		expect(tree).toHaveLength(1)
		expect(tree[0].children).toHaveLength(1)
		expect(tree[0].children[0].children).toHaveLength(1)
		expect(tree[0].children[0].children[0].title).toBe('Deep Note')
	})

	it('handles orphaned notes (parent_id refers to non-existent parent)', () => {
		const notes = [
			makeNote({ id: '1', title: 'Orphan', parent_id: 'nonexistent' }),
		]
		const tree = buildTree(notes)
		// Orphaned notes should appear at root level
		expect(tree).toHaveLength(1)
		expect(tree[0].title).toBe('Orphan')
	})
})
