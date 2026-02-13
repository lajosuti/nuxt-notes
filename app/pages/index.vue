<script setup lang="ts">
const { fetchTree, selectedNote } = useNotes()

await useAsyncData('notes-tree', () => fetchTree())
</script>

<template>
	<div class="flex h-screen overflow-hidden">
		<!-- Sidebar -->
		<aside class="w-72 flex-shrink-0 border-r border-(--ui-border) flex flex-col bg-(--ui-bg)">
			<NoteTree />
		</aside>

		<!-- Main editor area -->
		<main class="flex-1 flex flex-col min-w-0 bg-(--ui-bg)">
			<!-- Top bar with color mode toggle -->
			<div class="flex items-center justify-end px-4 py-2 border-b border-(--ui-border)">
				<UColorModeButton />
			</div>

			<!-- Editor or empty state -->
			<div class="flex-1 overflow-hidden">
				<NoteEditor v-if="selectedNote" />
				<div v-else class="flex items-center justify-center h-full text-(--ui-text-muted)">
					<div class="text-center">
						<UIcon name="i-lucide-file-text" class="text-5xl mb-4 mx-auto block" />
						<p class="text-lg">Select or create a note to get started.</p>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>
