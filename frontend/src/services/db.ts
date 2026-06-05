// db.ts — Pure IndexedDB wrapper for UPTGO. No external library. TypeScript strict.

export type SyncStatus = 'pendingSync' | 'synced' | 'conflict'

export interface DbTask {
  id: string
  title: string
  subject: string
  due: string
  dueDate?: string
  dueTime?: string
  dueShort?: string
  priority: 'alta' | 'media' | 'baja'
  status: 'pendiente' | 'progreso' | 'entregada' | 'vencida'
  done: boolean
  desc: string
  soon?: boolean
  attachments?: number
  notesCount?: number
  syncStatus: SyncStatus
  updatedAt: number
}

export interface DbNote {
  id: string
  title: string
  subject: string
  taskId?: string
  type: 'texto' | 'audio' | 'foto' | 'ubicacion'
  date: string
  tags: string[]
  preview: string
  noteText?: string
  duration?: string
  audioUrl?: string | null
  imageUrl?: string | null
  location?: string
  syncStatus: SyncStatus
  updatedAt: number
}

export interface DbReminder {
  id: string
  parentId?: string
  parentTitle: string
  parentType?: string
  subtitle?: string
  date: string
  time?: string
  beforeMin?: number
  status: 'activo' | 'completado' | 'descartado'
  note?: string
  syncStatus: SyncStatus
  updatedAt: number
}

export interface DbEvent {
  id: string
  title: string
  date: string
  time: string
  dur?: string
  subject: string
  type?: string
  loc?: string
  syncStatus: SyncStatus
  updatedAt: number
}

export interface DbScheduleBlock {
  id: string
  day: number
  start: number
  end: number
  subject: string
  title: string
  room: string
  location?: string
  locationUrl?: string
  teacher?: string
  syncStatus: SyncStatus
  updatedAt: number
}

const DB_NAME = 'uptgo_db'
const DB_VERSION = 1

let _db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const database = (e.target as IDBOpenDBRequest).result
      const stores = ['tasks', 'notes', 'reminders', 'events', 'scheduleBlocks']
      for (const name of stores) {
        if (!database.objectStoreNames.contains(name)) {
          database.createObjectStore(name, { keyPath: 'id' })
        }
      }
    }
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result
      resolve(_db)
    }
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error)
  })
}

function getAll<T>(store: string): Promise<T[]> {
  return openDB().then(
    (database) =>
      new Promise((resolve, reject) => {
        const tx = database.transaction(store, 'readonly')
        const req = tx.objectStore(store).getAll()
        req.onsuccess = () => resolve(req.result as T[])
        req.onerror = () => reject(req.error)
      }),
  )
}

function getById<T>(store: string, id: string): Promise<T | undefined> {
  return openDB().then(
    (database) =>
      new Promise((resolve, reject) => {
        const tx = database.transaction(store, 'readonly')
        const req = tx.objectStore(store).get(id)
        req.onsuccess = () => resolve(req.result as T | undefined)
        req.onerror = () => reject(req.error)
      }),
  )
}

function upsert<T>(store: string, item: T): Promise<void> {
  return openDB().then(
    (database) =>
      new Promise((resolve, reject) => {
        const tx = database.transaction(store, 'readwrite')
        const req = tx.objectStore(store).put(item)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      }),
  )
}

function remove(store: string, id: string): Promise<void> {
  return openDB().then(
    (database) =>
      new Promise((resolve, reject) => {
        const tx = database.transaction(store, 'readwrite')
        const req = tx.objectStore(store).delete(id)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
      }),
  )
}

export const db = {
  tasks: {
    getAll: () => getAll<DbTask>('tasks'),
    getById: (id: string) => getById<DbTask>('tasks', id),
    upsert: (item: DbTask) => upsert<DbTask>('tasks', item),
    remove: (id: string) => remove('tasks', id),
  },
  notes: {
    getAll: () => getAll<DbNote>('notes'),
    getById: (id: string) => getById<DbNote>('notes', id),
    upsert: (item: DbNote) => upsert<DbNote>('notes', item),
    remove: (id: string) => remove('notes', id),
  },
  reminders: {
    getAll: () => getAll<DbReminder>('reminders'),
    getById: (id: string) => getById<DbReminder>('reminders', id),
    upsert: (item: DbReminder) => upsert<DbReminder>('reminders', item),
    remove: (id: string) => remove('reminders', id),
  },
  events: {
    getAll: () => getAll<DbEvent>('events'),
    getById: (id: string) => getById<DbEvent>('events', id),
    upsert: (item: DbEvent) => upsert<DbEvent>('events', item),
    remove: (id: string) => remove('events', id),
  },
  scheduleBlocks: {
    getAll: () => getAll<DbScheduleBlock>('scheduleBlocks'),
    getById: (id: string) => getById<DbScheduleBlock>('scheduleBlocks', id),
    upsert: (item: DbScheduleBlock) => upsert<DbScheduleBlock>('scheduleBlocks', item),
    remove: (id: string) => remove('scheduleBlocks', id),
  },
}
