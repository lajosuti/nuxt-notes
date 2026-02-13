<script setup lang="ts">
import MarkdownIt from 'markdown-it'
import type Shiki from '@shikijs/markdown-it'

const props = defineProps<{
	content: string
}>()

const renderedHtml = ref('')
const mdInstance = shallowRef<MarkdownIt | null>(null)

// Initialize markdown-it with shiki (async)
const initPromise = (async () => {
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

	mdInstance.value = md
	return md
})()

// Render markdown whenever content changes
async function render() {
	const md = mdInstance.value ?? await initPromise
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
