export interface Note {
	id: string
	title: string
	content: string
	parent_id: string | null
	is_folder: number
	sort_order: number
	created_at: string
	updated_at: string
}

export interface NoteTreeItem extends Note {
	children: NoteTreeItem[]
}

export interface CreateNoteBody {
	title?: string
	content?: string
	parent_id?: string | null
	is_folder?: number
}

export interface UpdateNoteBody {
	title?: string
	content?: string
	parent_id?: string | null
	sort_order?: number
}
