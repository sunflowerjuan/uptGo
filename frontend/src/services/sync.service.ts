import * as db from './db'
import type {
  EventRecord,
  NoteRecord,
  ReminderRecord,
  ScheduleBlockRecord,
  TaskRecord,
} from './db'
import { apiFetch, getAccessToken } from './api'

export type SyncSnapshot = {
  tasks: TaskRecord[]
  notes: NoteRecord[]
  reminders: ReminderRecord[]
  events: EventRecord[]
  scheduleBlocks: ScheduleBlockRecord[]
  version: number
}

export type SyncState = {
  status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  lastSyncAt: string | null
  syncVersion: number
}

export type DriveBackup = {
  fileId: string
  name: string
  mimeType: string
  size: string | null
  createdAt: string | null
  modifiedAt: string | null
}

export async function getSyncState(): Promise<SyncState> {
  return apiFetch<SyncState>('/sync')
}

export async function exportToJson(): Promise<SyncSnapshot> {
  const [tasksData, notesData, remindersData, eventsData, blocksData] = await Promise.all([
    db.tasks.getAll(),
    db.notes.getAll(),
    db.reminders.getAll(),
    db.events.getAll(),
    db.scheduleBlocks.getAll(),
  ])

  return {
    tasks: tasksData,
    notes: notesData,
    reminders: remindersData,
    events: eventsData,
    scheduleBlocks: blocksData,
    version: Date.now(),
  }
}

type GenericRecordStore = {
  getAll(): Promise<db.DbRecord[]>
  getById(id: db.DbRecord['id']): Promise<db.DbRecord | undefined>
  upsert(record: db.DbRecord): Promise<db.DbRecord>
  remove(id: db.DbRecord['id']): Promise<void>
}

const asGenericStore = (store: unknown): GenericRecordStore => store as GenericRecordStore

export async function importFromJson(snapshot: SyncSnapshot): Promise<void> {
  const entries: Array<{ store: GenericRecordStore; data: db.DbRecord[] }> = [
    { store: asGenericStore(db.tasks), data: snapshot.tasks ?? [] },
    { store: asGenericStore(db.notes), data: snapshot.notes ?? [] },
    { store: asGenericStore(db.reminders), data: snapshot.reminders ?? [] },
    { store: asGenericStore(db.events), data: snapshot.events ?? [] },
    { store: asGenericStore(db.scheduleBlocks), data: snapshot.scheduleBlocks ?? [] },
  ]

  await Promise.all(
    entries.flatMap(({ store, data }) =>
      data.map((record) => store.upsert({ ...record, syncStatus: 'synced' } as db.DbRecord)),
    ),
  )
}

async function markAllSynced(): Promise<number> {
  const stores = [db.tasks, db.notes, db.reminders, db.events, db.scheduleBlocks].map(asGenericStore)
  let count = 0

  for (const store of stores) {
    const all = await store.getAll()
    const pending = all.filter((r) => r.syncStatus !== 'synced')
    await Promise.all(pending.map((r) => store.upsert({ ...r, syncStatus: 'synced' } as db.DbRecord)))
    count += pending.length
  }

  return count
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip "data:<mime>;base64," prefix
      const base64 = result.split(',')[1] ?? result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function syncAttachments(): Promise<void> {
  const pending = (await db.attachments.getAll()).filter(
    (a) => a.syncStatus !== 'synced' && !a.driveFileId,
  )

  await Promise.allSettled(
    pending.map(async (attachment) => {
      const base64 = await blobToBase64(attachment.blob)
      const result = await apiFetch<{ fileId: string }>('/drive/attachments', {
        method: 'POST',
        body: JSON.stringify({
          fileName: attachment.name,
          mimeType: attachment.mimeType,
          content: base64,
          parentId: attachment.parentId,
          parentType: attachment.parentType,
        }),
      })
      await db.attachments.upsert({ ...attachment, driveFileId: result.fileId, syncStatus: 'synced' })
    }),
  )
}

export async function syncNow(): Promise<void> {
  if (!getAccessToken()) throw new Error('No hay sesión activa. Inicia sesión para sincronizar.')

  await apiFetch('/sync/start', { method: 'POST' })

  try {
    const snapshot = await exportToJson()
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `uptgo-backup-${ts}.json`

    await apiFetch('/drive/backups', {
      method: 'POST',
      body: JSON.stringify({ fileName, content: snapshot as unknown as Record<string, unknown> }),
    })

    const count = await markAllSynced()

    await apiFetch('/sync/complete', {
      method: 'POST',
      body: JSON.stringify({ syncedItemsCount: count }),
    })

    // Best-effort: sync binary attachments after main data
    await syncAttachments()
  } catch (err) {
    await apiFetch('/sync/fail', { method: 'POST' }).catch(() => {})
    throw err
  }
}

export async function listBackups(): Promise<DriveBackup[]> {
  return apiFetch<DriveBackup[]>('/drive/backups')
}

export async function downloadAndImportBackup(fileId: string): Promise<void> {
  const snapshot = await apiFetch<SyncSnapshot>(`/drive/backups/${fileId}/download`)
  await importFromJson(snapshot)
}

export async function uploadAttachmentToDrive(
  blob: Blob,
  name: string,
  parentId: string,
  parentType: 'task' | 'note',
): Promise<string> {
  const base64 = await blobToBase64(blob)
  const result = await apiFetch<{ fileId: string }>('/drive/attachments', {
    method: 'POST',
    body: JSON.stringify({ fileName: name, mimeType: blob.type, content: base64, parentId, parentType }),
  })
  return result.fileId
}

export async function downloadAttachmentFromDrive(
  fileId: string,
): Promise<{ blob: Blob; name: string }> {
  const res = await apiFetch<{ content: string; mimeType: string; name: string }>(
    `/drive/attachments/${fileId}/download`,
  )
  const binary = atob(res.content)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { blob: new Blob([bytes], { type: res.mimeType }), name: res.name }
}
