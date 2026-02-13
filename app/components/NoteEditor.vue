<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const { selectedNote, saveStatus, renameNote, saveContent } = useNotes()

const localContent = ref('')
const editTitle = ref('')
const activeTab = ref('edit')

const tabs: TabsItem[] = [
	{ label: 'Edit', value: 'edit' },
	{ label: 'Preview', value: 'preview' },
	{ label: 'Split', value: 'split' },
]

// Sync local state when selected note changes
watch(
	() => selectedNote.value,
	(note) => {
		if (note) {
			localContent.value = note.content
			editTitle.value = note.title
		}
	},
	{ immediate: true },
)

// Watch content changes for auto-save
watch(localContent, (newContent) => {
	if (selectedNote.value && newContent !== selectedNote.value.content) {
		saveContent(newContent)
	}
})

async function handleTitleBlur() {
	if (selectedNote.value && editTitle.value.trim() && editTitle.value !== selectedNote.value.title) {
		await renameNote(selectedNote.value.id, editTitle.value.trim())
	}
}

function handleTitleKeydown(e: KeyboardEvent) {
	if (e.key === 'Enter') {
		;(e.target as HTMLInputElement).blur()
	}
}

const saveStatusText = computed(() => {
	switch (saveStatus.value) {
		case 'saving':
			return 'Saving…'
		case 'saved':
			return 'Saved'
		default:
			return ''
	}
})
</script>

<template>
	<div v-if="selectedNote" class="flex flex-col h-full">
		<!-- Title bar -->
		<div class="flex items-center gap-3 px-4 py-2 border-b border-(--ui-border)">
			<input
				v-model="editTitle"
				class="flex-1 text-lg font-semibold bg-transparent outline-none text-(--ui-text-highlighted) placeholder:text-(--ui-text-muted)"
				placeholder="Note title…"
				@blur="handleTitleBlur"
				@keydown="handleTitleKeydown"
			/>
			<span
				v-if="saveStatusText"
				class="text-xs text-(--ui-text-muted) flex-shrink-0 transition-opacity"
			>
				{{ saveStatusText }}
			</span>
		</div>

		<!-- Tabs -->
		<div class="px-4 pt-2">
			<UTabs v-model="activeTab" :items="tabs" variant="link" />
		</div>

		<!-- Content area -->
		<div class="flex-1 overflow-hidden">
			<!-- Edit mode -->
			<div v-if="activeTab === 'edit'" class="h-full p-4">
				<textarea
					v-model="localContent"
					class="w-full h-full resize-none bg-transparent outline-none font-mono text-sm text-(--ui-text) placeholder:text-(--ui-text-muted)"
					placeholder="Start writing markdown…"
				/>
			</div>

			<!-- Preview mode -->
			<div v-else-if="activeTab === 'preview'" class="h-full overflow-y-auto p-4">
				<MarkdownPreview :content="localContent" />
			</div>

			<!-- Split mode -->
			<div v-else-if="activeTab === 'split'" class="flex h-full">
				<div class="w-1/2 border-r border-(--ui-border) p-4">
					<textarea
						v-model="localContent"
						class="w-full h-full resize-none bg-transparent outline-none font-mono text-sm text-(--ui-text) placeholder:text-(--ui-text-muted)"
						placeholder="Start writing markdown…"
					/>
				</div>
				<div class="w-1/2 overflow-y-auto p-4">
					<MarkdownPreview :content="localContent" />
				</div>
			</div>
		</div>
	</div>
</template>
