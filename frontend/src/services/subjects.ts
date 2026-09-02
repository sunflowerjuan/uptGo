import type { ScheduleBlockRecord, SubjectData } from './db'

export const DEFAULT_SUBJECT: SubjectData = {
  id: 'sin-materia',
  name: 'Sin materia',
  room: 'Sin aula',
  teacher: 'Sin docente',
  color: 1,
}

/** Las materias reales son las que aparecen en al menos un bloque del horario (clase creada o CSV importado). */
export function deriveSubjects(blocks: ScheduleBlockRecord[]): SubjectData[] {
  const byId = new Map<string, SubjectData>()

  for (const block of blocks) {
    if (!block.subjectData || byId.has(block.subjectData.id)) continue
    byId.set(block.subjectData.id, {
      ...block.subjectData,
      room: block.subjectData.room ?? block.room,
    })
  }

  return [...byId.values()]
}

export function nextSubjectColor(subjects: SubjectData[]): number {
  return (subjects.length % 6) + 1
}

let subjectsCache: SubjectData[] = []

export function setSubjectsCache(subjects: SubjectData[]): void {
  subjectsCache = subjects
}

export function subjectById(id: string | number | null | undefined): SubjectData {
  if (id == null || id === '') return DEFAULT_SUBJECT
  return subjectsCache.find((subject) => subject.id === id) ?? DEFAULT_SUBJECT
}
