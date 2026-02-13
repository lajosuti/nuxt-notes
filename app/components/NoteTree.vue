<script setup lang="ts">
const {
	tree,
	selectedNoteId,
	createNote,
	selectNote,
} = useNotes()

// Rename state
const renamingId = ref<string | null>(null)
</script>

<template>
	<div class="flex flex-col h-full">
		<!-- Sidebar header -->
		<div class="flex items-center justify-between px-3 py-2 border-b border-(--ui-border)">
			<h2 class="font-semibold text-sm text-(--ui-text-highlighted)">Notes</h2>
			<UButton
				icon="i-lucide-plus"
				size="xs"
				variant="ghost"
				color="neutral"
				aria-label="New root note"
				@click="createNote(null)"
			/>
		</div>

		<!-- Tree -->
		<div class="flex-1 overflow-y-auto p-2">
			<NoteTreeItem
				v-for="item in tree"
				:key="item.id"
				:note="item"
				:selected-id="selectedNoteId"
				:renaming-id="renamingId"
				:depth="0"
				@select="selectNote"
				@rename-start="(id: string) => renamingId = id"
				@rename-end="renamingId = null"
			/>
		</div>
	</div>
</template>
