<script lang="ts">
import MarkdownIt from 'markdown-it'
import type Shiki from '@shikijs/markdown-it'

// Shared singleton — created once, reused across all component instances
let sharedMd: MarkdownIt | null = null
let sharedInitPromise: Promise<MarkdownIt> | null = null

function getMarkdownIt(): Promise<MarkdownIt> {
	if (sharedMd) return Promise.resolve(sharedMd)
	if (sharedInitPromise) return sharedInitPromise

	sharedInitPromise = (async () => {
		const md = new MarkdownIt({
			html: true,
			linkify: true,
			typographer: true,
		})

		try {
			const { default: ShikiPlugin } = await import('@shikijs/markdown-it')
			const plugin = await (ShikiPlugin as typeof Shiki)({
				themes: {
					light: 'github-light',
					dark: 'github-dark',
				},
			})
			md.use(plugin)
		} catch {
			// Shiki failed to load — fall back to plain markdown rendering
		}

		sharedMd = md
		return md
	})()

	return sharedInitPromise
}
</script>

<script setup lang="ts">
const props = defineProps<{
	content: string
}>()

const renderedHtml = ref('')

// Render markdown whenever content changes
async function render() {
	const md = await getMarkdownIt()
	renderedHtml.value = md.render(props.content || '')
}

// Watch for content changes
watch(() => props.content, render, { immediate: true })
</script>

<template>
	<div
		class="prose dark:prose-invert max-w-none"
		v-html="renderedHtml"
	/>
</template>
