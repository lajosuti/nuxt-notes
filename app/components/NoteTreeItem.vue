<script setup lang="ts">
import type { NoteTreeItem } from '~~/shared/types'
import type { ContextMenuItem } from '@nuxt/ui'

const props = defineProps<{
	note: NoteTreeItem
	selectedId: string | null
	renamingId: string | null
	depth: number
}>()

const emit = defineEmits<{
	select: [id: string]
	'rename-start': [id: string]
	'rename-end': []
}>()

const {
	createNote,
	deleteNote,
	renameNote,
	moveNote,
	tree,
} = useNotes()

const expanded = ref(props.note.is_folder === 1)
const isRenaming = computed(() => props.renamingId === props.note.id)
const isSelected = computed(() => props.selectedId === props.note.id)

// Move modal state
const moveModalOpen = ref(false)

// Rename state
const localRenameValue = ref('')

function collectFolders(items: NoteTreeItem[], exclude?: string): NoteTreeItem[] {
	const folders: NoteTreeItem[] = []
	for (const item of items) {
		if (item.is_folder && item.id !== exclude) {
			folders.push(item)
			if (item.children?.length) {
				folders.push(...collectFolders(item.children, exclude))
			}
		}
	}
	return folders
}

const availableFolders = computed(() => collectFolders(tree.value, props.note.id))

async function submitRename() {
	if (localRenameValue.value.trim()) {
		await renameNote(props.note.id, localRenameValue.value.trim())
	}
	emit('rename-end')
}

watch(() => props.renamingId, (newVal) => {
	if (newVal === props.note.id) {
		localRenameValue.value = props.note.title
	}
})

function handleClick() {
	if (props.note.is_folder) {
		expanded.value = !expanded.value
	} else {
		emit('select', props.note.id)
	}
}

function getContextMenuItems(): ContextMenuItem[][] {
	return [
		[
			{
				label: 'New Note',
				icon: 'i-lucide-file-plus',
				onSelect() {
					createNote(props.note.is_folder ? props.note.id : props.note.parent_id)
				},
			},
			{
				label: 'New Folder',
				icon: 'i-lucide-folder-plus',
				onSelect() {
					createNote(props.note.is_folder ? props.note.id : props.note.parent_id, true)
				},
			},
		],
		[
			{
				label: 'Rename',
				icon: 'i-lucide-pencil',
				onSelect() {
					emit('rename-start', props.note.id)
				},
			},
			{
				label: 'Move to…',
				icon: 'i-lucide-folder-input',
				onSelect() {
					moveModalOpen.value = true
				},
			},
		],
		[
			{
				label: 'Delete',
				icon: 'i-lucide-trash-2',
				color: 'error' as const,
				onSelect() {
					const confirmMsg = props.note.is_folder
						? `Delete folder "${props.note.title}" and all its contents?`
						: `Delete "${props.note.title}"?`
					if (confirm(confirmMsg)) {
						deleteNote(props.note.id)
					}
				},
			},
		],
	]
}

async function handleMove(targetParentId: string | null) {
	await moveNote(props.note.id, targetParentId)
	moveModalOpen.value = false
}
</script>

<template>
	<div>
		<UContextMenu :items="getContextMenuItems()">
			<div
				class="flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer text-sm transition-colors"
				:class="[
					isSelected
						? 'bg-(--ui-bg-elevated) text-(--ui-text-highlighted) font-medium'
						: 'text-(--ui-text-muted) hover:bg-(--ui-bg-elevated)/50 hover:text-(--ui-text)',
				]"
				:style="{ paddingLeft: `${depth * 16 + 8}px` }"
				@click="handleClick"
			>
				<!-- Expand/collapse chevron for folders -->
				<UIcon
					v-if="note.is_folder"
					:name="expanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
					class="text-xs flex-shrink-0 text-(--ui-text-dimmed)"
				/>
				<span v-else class="w-4 flex-shrink-0" />

				<!-- Icon -->
				<UIcon
					:name="note.is_folder ? (expanded ? 'i-lucide-folder-open' : 'i-lucide-folder') : 'i-lucide-file-text'"
					class="flex-shrink-0"
					:class="note.is_folder ? 'text-(--ui-warning)' : 'text-(--ui-text-dimmed)'"
				/>

				<!-- Title or rename input -->
				<template v-if="isRenaming">
					<input
						:value="localRenameValue"
						class="flex-1 bg-transparent border border-(--ui-border-accented) rounded px-1 py-0.5 text-sm outline-none focus:border-(--ui-primary)"
						autofocus
						@input="localRenameValue = ($event.target as HTMLInputElement).value"
						@keydown.enter="submitRename"
						@keydown.escape="emit('rename-end')"
						@blur="submitRename"
						@click.stop
					/>
				</template>
				<span v-else class="truncate flex-1">{{ note.title }}</span>
			</div>
		</UContextMenu>

		<!-- Children (recursive) -->
		<div v-if="note.is_folder && expanded && note.children?.length">
			<NoteTreeItem
				v-for="child in note.children"
				:key="child.id"
				:note="child"
				:selected-id="selectedId"
				:renaming-id="renamingId"
				:depth="depth + 1"
				@select="emit('select', $event)"
				@rename-start="emit('rename-start', $event)"
				@rename-end="emit('rename-end')"
			/>
		</div>

		<!-- Move modal -->
		<UModal v-model:open="moveModalOpen" title="Move to…" description="Select a destination folder">
			<template #body>
				<div class="space-y-1">
					<UButton
						variant="ghost"
						color="neutral"
						block
						icon="i-lucide-home"
						label="Root (no parent)"
						class="justify-start"
						@click="handleMove(null)"
					/>
					<UButton
						v-for="folder in availableFolders"
						:key="folder.id"
						variant="ghost"
						color="neutral"
						block
						icon="i-lucide-folder"
						:label="folder.title"
						class="justify-start"
						@click="handleMove(folder.id)"
					/>
				</div>
			</template>
		</UModal>
	</div>
</template>
