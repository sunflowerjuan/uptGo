export type SyncStatus = 'pendingSync' | 'synced' | 'conflict'

export type DbRecord = {
  id: string | number
  syncStatus?: SyncStatus
  updatedAt?: string
  [key: string]: unknown
}

export type TaskRecord = DbRecord & {
  title: string
  subject?: string
  due?: string
  priority?: string
  status?: string
  done?: boolean
  desc?: string
}

export type NoteRecord = DbRecord & {
  title: string
  content?: string
  color?: string | number
  pinned?: boolean
}

export type ReminderRecord = DbRecord & {
  parentId?: string | number
  parentTitle?: string
  date?: string
  status?: string
}

export type EventRecord = DbRecord & {
  title: string
  date?: string
  time?: string
  subject?: string
  color?: string | number
}

export type ScheduleBlockRecord = DbRecord & {
  day: number
  start: number
  end: number
  subject?: string
  title?: string
  room?: string
}

type StoreName = 'tasks' | 'notes' | 'reminders' | 'events' | 'scheduleBlocks'

const DB_NAME = 'uptgo_db'
const DB_VERSION = 1
const STORE_NAMES: StoreName[] = [
  'tasks',
  'notes',
  'reminders',
  'events',
  'scheduleBlocks',
]

let dbPromise: Promise<IDBDatabase> | null = null

export function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result

      for (const storeName of STORE_NAMES) {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: 'id' })
        }
      }
    }

    request.onsuccess = () => {
      const database = request.result

      database.onversionchange = () => {
        database.close()
        dbPromise = null
      }

      resolve(database)
    }

    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }
  })

  return dbPromise
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getStore(
  storeName: StoreName,
  mode: IDBTransactionMode = 'readonly',
): Promise<IDBObjectStore> {
  const database = await openDB()
  return database.transaction(storeName, mode).objectStore(storeName)
}

function createStoreApi<T extends DbRecord>(storeName: StoreName) {
  return {
    async getAll(): Promise<T[]> {
      const store = await getStore(storeName)
      return requestToPromise<T[]>(store.getAll() as IDBRequest<T[]>)
    },

    async getById(id: T['id']): Promise<T | undefined> {
      const store = await getStore(storeName)
      return requestToPromise<T | undefined>(
        store.get(id) as IDBRequest<T | undefined>,
      )
    },

    async upsert(record: T): Promise<T> {
      const store = await getStore(storeName, 'readwrite')
      await requestToPromise(store.put(record))
      return record
    },

    async remove(id: T['id']): Promise<void> {
      const store = await getStore(storeName, 'readwrite')
      await requestToPromise(store.delete(id))
    },
  }
}

export const tasks = createStoreApi<TaskRecord>('tasks')
export const notes = createStoreApi<NoteRecord>('notes')
export const reminders = createStoreApi<ReminderRecord>('reminders')
export const events = createStoreApi<EventRecord>('events')
export const scheduleBlocks = createStoreApi<ScheduleBlockRecord>('scheduleBlocks')
