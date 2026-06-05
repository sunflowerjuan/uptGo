import React from 'react'
import * as db from '../services/db'
import type {
  EventRecord,
  NoteRecord,
  ReminderRecord,
  ScheduleBlockRecord,
  SyncStatus,
  TaskRecord,
} from '../services/db'

type Id = string | number
type NewRecord<T extends { id: Id }> = Omit<T, 'syncStatus' | 'updatedAt'> &
  Partial<Pick<T, 'syncStatus' | 'updatedAt'>>

type DataContextValue = {
  loading: boolean
  tasks: TaskRecord[]
  notes: NoteRecord[]
  reminders: ReminderRecord[]
  events: EventRecord[]
  scheduleBlocks: ScheduleBlockRecord[]
  actions: {
    tasks: CrudActions<TaskRecord>
    notes: CrudActions<NoteRecord>
    reminders: CrudActions<ReminderRecord>
    events: CrudActions<EventRecord>
    scheduleBlocks: CrudActions<ScheduleBlockRecord> & {
      upsertMany: (records: NewRecord<ScheduleBlockRecord>[]) => Promise<void>
    }
  }
}

type CrudActions<T extends { id: Id }> = {
  getById: (id: Id) => Promise<T | undefined>
  upsert: (record: NewRecord<T>) => Promise<T>
  update: (id: Id, changes: Partial<T>) => Promise<T | undefined>
  remove: (id: Id) => Promise<void>
}

const DataContext = React.createContext<DataContextValue | null>(null)

const markPending = <T extends { id: Id }>(record: NewRecord<T>): T => ({
  ...record,
  syncStatus: 'pendingSync' as SyncStatus,
  updatedAt: new Date().toISOString(),
}) as T

function sortByUpdatedAt<T extends { updatedAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
    return bTime - aTime
  })
}

function createCrudActions<T extends db.DbRecord>(
  store: {
    getById: (id: Id) => Promise<T | undefined>
    upsert: (record: T) => Promise<T>
    remove: (id: Id) => Promise<void>
  },
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
): CrudActions<T> {
  return {
    getById: (id) => store.getById(id),

    async upsert(record) {
      const pendingRecord = markPending<T>(record)
      await store.upsert(pendingRecord)
      setItems((current) => {
        const exists = current.some((item) => item.id === pendingRecord.id)
        const next = exists
          ? current.map((item) =>
              item.id === pendingRecord.id ? pendingRecord : item,
            )
          : [pendingRecord, ...current]

        return sortByUpdatedAt(next)
      })
      return pendingRecord
    },

    async update(id, changes) {
      const existing = await store.getById(id)
      if (!existing) return undefined

      const updated = markPending<T>({
        ...existing,
        ...changes,
        id,
      })

      await store.upsert(updated)
      setItems((current) =>
        sortByUpdatedAt(
          current.map((item) => (item.id === id ? updated : item)),
        ),
      )
      return updated
    },

    async remove(id) {
      await store.remove(id)
      setItems((current) => current.filter((item) => item.id !== id))
    },
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true)
  const [tasksState, setTasksState] = React.useState<TaskRecord[]>([])
  const [notesState, setNotesState] = React.useState<NoteRecord[]>([])
  const [remindersState, setRemindersState] = React.useState<ReminderRecord[]>([])
  const [eventsState, setEventsState] = React.useState<EventRecord[]>([])
  const [scheduleBlocksState, setScheduleBlocksState] = React.useState<
    ScheduleBlockRecord[]
  >([])

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      const [storedTasks, storedNotes, storedReminders, storedEvents, storedBlocks] =
        await Promise.all([
          db.tasks.getAll(),
          db.notes.getAll(),
          db.reminders.getAll(),
          db.events.getAll(),
          db.scheduleBlocks.getAll(),
        ])

      if (cancelled) return

      setTasksState(sortByUpdatedAt(storedTasks))
      setNotesState(sortByUpdatedAt(storedNotes))
      setRemindersState(sortByUpdatedAt(storedReminders))
      setEventsState(sortByUpdatedAt(storedEvents))
      setScheduleBlocksState(sortByUpdatedAt(storedBlocks))
      setLoading(false)
    }

    void load().catch(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const value = React.useMemo<DataContextValue>(() => {
    const scheduleCrud = createCrudActions(db.scheduleBlocks, setScheduleBlocksState)

    return {
      loading,
      tasks: tasksState,
      notes: notesState,
      reminders: remindersState,
      events: eventsState,
      scheduleBlocks: scheduleBlocksState,
      actions: {
        tasks: createCrudActions(db.tasks, setTasksState),
        notes: createCrudActions(db.notes, setNotesState),
        reminders: createCrudActions(db.reminders, setRemindersState),
        events: createCrudActions(db.events, setEventsState),
        scheduleBlocks: {
          ...scheduleCrud,
          async upsertMany(records) {
            const pendingRecords = records.map((record) =>
              markPending<ScheduleBlockRecord>(record),
            )

            await Promise.all(
              pendingRecords.map((record) => db.scheduleBlocks.upsert(record)),
            )

            setScheduleBlocksState((current) => {
              const byId = new Map<Id, ScheduleBlockRecord>()
              for (const item of current) byId.set(item.id, item)
              for (const item of pendingRecords) byId.set(item.id, item)
              return sortByUpdatedAt([...byId.values()])
            })
          },
        },
      },
    }
  }, [
    eventsState,
    loading,
    notesState,
    remindersState,
    scheduleBlocksState,
    tasksState,
  ])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = React.useContext(DataContext)

  if (!context) {
    throw new Error('useData must be used inside DataProvider')
  }

  return context
}
