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
  subject?: string
  taskId?: string
  content: string
  color: number
  pinned: boolean
  type?: 'texto' | 'audio' | 'foto' | 'ubicacion'
  noteType?: string
  date?: string
  tags?: string[]
  preview?: string
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
  parentId: string
  parentTitle: string
  parentType?: string
  parentSubtitle?: string
  title?: string
  description?: string
  notifyBefore?: string
  date: string
  time?: string
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
  color: number
  type?: string
  loc?: string
  location?: string
  locationUrl?: string
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
  created?: boolean
  subjectData?: {
    id: string
    name: string
    code?: string
    teacher?: string
    color?: number
  } | null
  syncStatus: SyncStatus
  updatedAt: number
}

type StoreName = 'tasks' | 'notes' | 'reminders' | 'events' | 'scheduleBlocks'

const DB_NAME = 'uptgo_db'
const DB_VERSION = 1
const STORE_NAMES: StoreName[] = ['tasks', 'notes', 'reminders', 'events', 'scheduleBlocks']

let databasePromise: Promise<IDBDatabase> | null = null

export function openDB(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result

      for (const storeName of STORE_NAMES) {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: 'id' })
        }
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return databasePromise
}

async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T> {
  const database = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const request = action(store)
    let result: T

    if (request) {
      request.onsuccess = () => {
        result = request.result
      }
      request.onerror = () => reject(request.error)
    }

    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

function getAll<T>(storeName: StoreName): Promise<T[]> {
  return withStore<T[]>(storeName, 'readonly', (store) => store.getAll())
}

function getById<T>(storeName: StoreName, id: string): Promise<T | undefined> {
  return withStore<T | undefined>(storeName, 'readonly', (store) => store.get(id))
}

function upsert<T extends { id: string }>(storeName: StoreName, item: T): Promise<void> {
  return withStore<void>(storeName, 'readwrite', (store) => store.put(item))
}

function upsertMany<T extends { id: string }>(storeName: StoreName, items: T[]): Promise<void> {
  return withStore<void>(storeName, 'readwrite', (store) => {
    items.forEach((item) => store.put(item))
  })
}

function remove(storeName: StoreName, id: string): Promise<void> {
  return withStore<void>(storeName, 'readwrite', (store) => store.delete(id))
}

export const db = {
  tasks: {
    getAll: () => getAll<DbTask>('tasks'),
    getById: (id: string) => getById<DbTask>('tasks', id),
    upsert: (item: DbTask) => upsert('tasks', item),
    remove: (id: string) => remove('tasks', id),
  },
  notes: {
    getAll: () => getAll<DbNote>('notes'),
    getById: (id: string) => getById<DbNote>('notes', id),
    upsert: (item: DbNote) => upsert('notes', item),
    remove: (id: string) => remove('notes', id),
  },
  reminders: {
    getAll: () => getAll<DbReminder>('reminders'),
    getById: (id: string) => getById<DbReminder>('reminders', id),
    upsert: (item: DbReminder) => upsert('reminders', item),
    remove: (id: string) => remove('reminders', id),
  },
  events: {
    getAll: () => getAll<DbEvent>('events'),
    getById: (id: string) => getById<DbEvent>('events', id),
    upsert: (item: DbEvent) => upsert('events', item),
    remove: (id: string) => remove('events', id),
  },
  scheduleBlocks: {
    getAll: () => getAll<DbScheduleBlock>('scheduleBlocks'),
    getById: (id: string) => getById<DbScheduleBlock>('scheduleBlocks', id),
    upsert: (item: DbScheduleBlock) => upsert('scheduleBlocks', item),
    upsertMany: (items: DbScheduleBlock[]) => upsertMany('scheduleBlocks', items),
    remove: (id: string) => remove('scheduleBlocks', id),
  },
}
