function required<T extends Element>(el: T | null, sel: string): T {
	if (!el) throw new Error(`cue: missing ${sel}`)
	return el
}

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
	return required(document.getElementById(id), `#${id}`) as T
}

export function query<T extends Element = HTMLElement>(sel: string, root: ParentNode): T {
	return required(root.querySelector(sel), sel) as T
}

export const dom = {
	stage: byId('stage'),
	bar: byId('bar'),
	title: byId('title'),
	progress: byId('progress'),
	stateEl: byId('state'),
	help: byId('help'),
	progressFill: byId<HTMLDivElement>('progressFill'),
	sectionbar: byId('sectionbar'),
	sectionLabel: query('.label', byId('sectionbar')),
	sectionCount: query('.count', byId('sectionbar')),
	sectionMini: query<HTMLSpanElement>('.mini > span', byId('sectionbar')),
	notes: byId('notes'),
	notesBody: query('.body', byId('notes')),
	notesUpcoming: query('.upcoming', byId('notes')),
	hint: byId('hint'),
}
