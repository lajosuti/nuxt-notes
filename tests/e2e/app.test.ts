import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setup, $fetch, createPage } from '@nuxt/test-utils/e2e'
import type { NoteTreeItem, Note } from '../../shared/types'

describe('NuxtNotes E2E', async () => {
	await setup({
		browser: true,
	})

	describe('API routes', () => {
		it('GET /api/notes/tree returns seed data', async () => {
			const tree = await $fetch<NoteTreeItem[]>('/api/notes/tree')
			expect(Array.isArray(tree)).toBe(true)
			expect(tree.length).toBeGreaterThan(0)

			// Should have the welcome note
			const welcome = tree.find((n) => n.id === 'welcome')
			expect(welcome).toBeDefined()
			expect(welcome!.title).toBe('Welcome to NuxtNotes')
		})

		it('GET /api/notes/:id returns a single note', async () => {
			const note = await $fetch<Note>('/api/notes/welcome')
			expect(note.id).toBe('welcome')
			expect(note.title).toBe('Welcome to NuxtNotes')
			expect(note.content).toContain('NuxtNotes')
		})

		it('POST /api/notes creates a note', async () => {
			const created = await $fetch<Note>('/api/notes', {
				method: 'POST',
				body: { title: 'E2E Test Note', content: 'Test content' },
			})
			expect(created.id).toBeDefined()
			expect(created.title).toBe('E2E Test Note')
			expect(created.content).toBe('Test content')

			// Verify it appears in tree
			const tree = await $fetch<NoteTreeItem[]>('/api/notes/tree')
			const found = tree.find((n) => n.id === created.id)
			expect(found).toBeDefined()

			// Clean up
			await $fetch(`/api/notes/${created.id}`, { method: 'DELETE' })
		})

		it('PUT /api/notes/:id updates a note', async () => {
			const created = await $fetch<Note>('/api/notes', {
				method: 'POST',
				body: { title: 'To Update' },
			})

			const updated = await $fetch<Note>(`/api/notes/${created.id}`, {
				method: 'PUT',
				body: { title: 'Updated Title', content: 'Updated content' },
			})
			expect(updated.title).toBe('Updated Title')
			expect(updated.content).toBe('Updated content')

			// Clean up
			await $fetch(`/api/notes/${created.id}`, { method: 'DELETE' })
		})

		it('DELETE /api/notes/:id deletes a note', async () => {
			const created = await $fetch<Note>('/api/notes', {
				method: 'POST',
				body: { title: 'To Delete' },
			})

			const result = await $fetch<{ success: boolean }>(`/api/notes/${created.id}`, {
				method: 'DELETE',
			})
			expect(result.success).toBe(true)

			// Verify it's gone
			try {
				await $fetch(`/api/notes/${created.id}`)
				expect.unreachable('Should have thrown 404')
			} catch (err: any) {
				expect(err.statusCode || err.response?.status).toBe(404)
			}
		})

		it('DELETE folder recursively deletes children', async () => {
			// Create a folder
			const folder = await $fetch<Note>('/api/notes', {
				method: 'POST',
				body: { title: 'Test Folder', is_folder: 1 },
			})

			// Create child note
			const child = await $fetch<Note>('/api/notes', {
				method: 'POST',
				body: { title: 'Child Note', parent_id: folder.id },
			})

			// Delete folder
			await $fetch(`/api/notes/${folder.id}`, { method: 'DELETE' })

			// Verify child is also gone
			try {
				await $fetch(`/api/notes/${child.id}`)
				expect.unreachable('Child should be deleted')
			} catch (err: any) {
				expect(err.statusCode || err.response?.status).toBe(404)
			}
		})

		it('tree correctly nests children under folders', async () => {
			const tree = await $fetch<NoteTreeItem[]>('/api/notes/tree')
			const folder = tree.find((n) => n.id === 'sample-folder')
			expect(folder).toBeDefined()
			expect(folder!.is_folder).toBe(1)
			expect(folder!.children.length).toBeGreaterThan(0)
			expect(folder!.children[0].parent_id).toBe('sample-folder')
		})
	})

	describe('Browser UI', () => {
		it('renders the main page with sidebar and empty state', async () => {
			const page = await createPage('/')

			// Should have the sidebar with "Notes" header
			const sidebarText = await page.textContent('aside')
			expect(sidebarText).toContain('Notes')

			// Should show seed notes in sidebar
			expect(sidebarText).toContain('Welcome to NuxtNotes')

			await page.close()
		})

		it('clicking a note loads it in the editor', async () => {
			const page = await createPage('/')

			// Click on the welcome note
			await page.click('text=Welcome to NuxtNotes')
			await page.waitForTimeout(500)

			// The editor should now be visible with the note title
			const editorTitle = await page.inputValue('main input')
			expect(editorTitle).toBe('Welcome to NuxtNotes')

			await page.close()
		})

		it('creates a new note via the + button', async () => {
			const page = await createPage('/')

			// Click the + button
			await page.click('button[aria-label="New root note"]')
			await page.waitForTimeout(500)

			// Should see "Untitled" in the sidebar
			const sidebarText = await page.textContent('aside')
			expect(sidebarText).toContain('Untitled')

			await page.close()
		})

		it('toggles color mode', async () => {
			const page = await createPage('/')

			// Get initial color mode
			const initialClass = await page.getAttribute('html', 'class')

			// Click color mode toggle button
			await page.click('main button:first-child')
			await page.waitForTimeout(300)

			// Class should have changed
			const newClass = await page.getAttribute('html', 'class')
			expect(newClass).not.toBe(initialClass)

			await page.close()
		})
	})
})
