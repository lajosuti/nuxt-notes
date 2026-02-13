import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MarkdownPreview from '../../app/components/MarkdownPreview.vue'

describe('MarkdownPreview', () => {
	it('renders basic markdown to HTML', async () => {
		const component = await mountSuspended(MarkdownPreview, {
			props: { content: '# Hello World' },
		})

		// Wait for async rendering
		await new Promise((resolve) => setTimeout(resolve, 500))

		const html = component.html()
		expect(html).toContain('<h1>')
		expect(html).toContain('Hello World')
	})

	it('renders bold and italic text', async () => {
		const component = await mountSuspended(MarkdownPreview, {
			props: { content: '**bold** and *italic*' },
		})

		await new Promise((resolve) => setTimeout(resolve, 500))

		const html = component.html()
		expect(html).toContain('<strong>bold</strong>')
		expect(html).toContain('<em>italic</em>')
	})

	it('renders links', async () => {
		const component = await mountSuspended(MarkdownPreview, {
			props: { content: '[Nuxt](https://nuxt.com)' },
		})

		await new Promise((resolve) => setTimeout(resolve, 500))

		const html = component.html()
		expect(html).toContain('<a href="https://nuxt.com"')
		expect(html).toContain('Nuxt')
	})

	it('renders code blocks', async () => {
		const component = await mountSuspended(MarkdownPreview, {
			props: { content: '```js\nconsole.log("hi")\n```' },
		})

		await new Promise((resolve) => setTimeout(resolve, 500))

		const html = component.html()
		expect(html).toContain('console')
		expect(html).toContain('log')
	})

	it('renders lists', async () => {
		const component = await mountSuspended(MarkdownPreview, {
			props: { content: '- Item 1\n- Item 2\n- Item 3' },
		})

		await new Promise((resolve) => setTimeout(resolve, 500))

		const html = component.html()
		expect(html).toContain('<ul>')
		expect(html).toContain('<li>')
		expect(html).toContain('Item 1')
	})

	it('handles empty content', async () => {
		const component = await mountSuspended(MarkdownPreview, {
			props: { content: '' },
		})

		await new Promise((resolve) => setTimeout(resolve, 500))

		// Should render without errors
		expect(component.exists()).toBe(true)
	})
})
