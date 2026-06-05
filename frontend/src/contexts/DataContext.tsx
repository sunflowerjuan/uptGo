import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  db,
  type DbEvent,
  type DbNote,
  type DbReminder,
  type DbScheduleBlock,
  type DbTask,
} from '../services/db'

type Persisted<T> = T & { id: string; syncStatus: 'pendingSync'; updatedAt: number }
type NewTask = Omit<DbTask, 'id' | 'syncStatus' | 'updatedAt'>
type NewNote = Omit<DbNote, 'id' | 'syncStatus' | 'updatedAt'>
type NewReminder = Omit<DbReminder, 'id' | 'syncStatus' | 'updatedAt'>
type NewEvent = Omit<DbEvent, 'id' | 'syncStatus' | 'updatedAt'>
type NewScheduleBlock = Omit<DbScheduleBlock, 'id' | 'syncStatus' | 'updatedAt'>

type DataContextValue = {
  tasks: DbTask[]
  notes: DbNote[]
  reminders: DbReminder[]
  events: DbEvent[]
  scheduleBlocks: DbScheduleBlock[]
  loading: boolean
  addTask: (input: NewTask & { id?: string }) => Promise<DbTask>
  updateTask: (id: string, changes: Partial<NewTask>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  addNote: (input: NewNote & { id?: string }) => Promise<DbNote>
  updateNote: (id: string, changes: Partial<NewNote>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  addReminder: (input: NewReminder & { id?: string }) => Promise<DbReminder>
  updateReminder: (id: string, changes: Partial<NewReminder>) => Promise<void>
  deleteReminder: (id: string) => Promise<void>
  toggleReminder: (id: string) => Promise<void>
  addEvent: (input: NewEvent & { id?: string }) => Promise<DbEvent>
  updateEvent: (id: string, changes: Partial<NewEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  addScheduleBlock: (input: NewScheduleBlock & { id?: string }) => Promise<DbScheduleBlock>
  addScheduleBlocks: (items: Array<NewScheduleBlock & { id?: string }>) => Promise<DbScheduleBlock[]>
  updateScheduleBlock: (id: string, changes: Partial<NewScheduleBlock>) => Promise<void>
  removeScheduleBlock: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function asPending<T extends object>(prefix: string, input: T & { id?: string }): Persisted<T> {
  return {
    ...input,
    id: input.id || makeId(prefix),
    syncStatus: 'pendingSync',
    updatedAt: Date.now(),
  }
}

function byUpdatedAt<T extends { updatedAt: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.updatedAt - a.updatedAt)
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<DbTask[]>([])
  const [notes, setNotes] = useState<DbNote[]>([])
  const [reminders, setReminders] = useState<DbReminder[]>([])
  const [events, setEvents] = useState<DbEvent[]>([])
  const [scheduleBlocks, setScheduleBlocks] = useState<DbScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    Promise.all([
      db.tasks.getAll(),
      db.notes.getAll(),
      db.reminders.getAll(),
      db.events.getAll(),
      db.scheduleBlocks.getAll(),
    ]).then(([storedTasks, storedNotes, storedReminders, storedEvents, storedScheduleBlocks]) => {
      if (!active) return
      setTasks(byUpdatedAt(storedTasks))
      setNotes(byUpdatedAt(storedNotes))
      setReminders(byUpdatedAt(storedReminders))
      setEvents(byUpdatedAt(storedEvents))
      setScheduleBlocks(storedScheduleBlocks)
      setLoading(false)
    }).catch(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo<DataContextValue>(() => {
    const addTask = async (input: NewTask & { id?: string }) => {
      const item = asPending('task', input) as DbTask
      await db.tasks.upsert(item)
      setTasks((current) => [item, ...current.filter((task) => task.id !== item.id)])
      return item
    }

    const updateTask = async (id: string, changes: Partial<NewTask>) => {
      const existing = tasks.find((task) => task.id === id)
      if (!existing) return
      const updated: DbTask = { ...existing, ...changes, syncStatus: 'pendingSync', updatedAt: Date.now() }
      await db.tasks.upsert(updated)
      setTasks((current) => current.map((task) => (task.id === id ? updated : task)))
    }

    const deleteTask = async (id: string) => {
      await db.tasks.remove(id)
      setTasks((current) => current.filter((task) => task.id !== id))
    }

    const toggleTask = async (id: string) => {
      const existing = tasks.find((task) => task.id === id)
      if (!existing) return
      await updateTask(id, {
        done: !existing.done,
        status: !existing.done ? 'entregada' : 'pendiente',
      })
    }

    const addNote = async (input: NewNote & { id?: string }) => {
      const item = asPending('note', input) as DbNote
      await db.notes.upsert(item)
      setNotes((current) => [item, ...current.filter((note) => note.id !== item.id)])
      return item
    }

    const updateNote = async (id: string, changes: Partial<NewNote>) => {
      const existing = notes.find((note) => note.id === id)
      if (!existing) return
      const updated: DbNote = { ...existing, ...changes, syncStatus: 'pendingSync', updatedAt: Date.now() }
      await db.notes.upsert(updated)
      setNotes((current) => current.map((note) => (note.id === id ? updated : note)))
    }

    const deleteNote = async (id: string) => {
      await db.notes.remove(id)
      setNotes((current) => current.filter((note) => note.id !== id))
    }

    const addReminder = async (input: NewReminder & { id?: string }) => {
      const item = asPending('reminder', input) as DbReminder
      await db.reminders.upsert(item)
      setReminders((current) => [item, ...current.filter((reminder) => reminder.id !== item.id)])
      return item
    }

    const updateReminder = async (id: string, changes: Partial<NewReminder>) => {
      const existing = reminders.find((reminder) => reminder.id === id)
      if (!existing) return
      const updated: DbReminder = { ...existing, ...changes, syncStatus: 'pendingSync', updatedAt: Date.now() }
      await db.reminders.upsert(updated)
      setReminders((current) => current.map((reminder) => (reminder.id === id ? updated : reminder)))
    }

    const deleteReminder = async (id: string) => {
      await db.reminders.remove(id)
      setReminders((current) => current.filter((reminder) => reminder.id !== id))
    }

    const toggleReminder = async (id: string) => {
      const existing = reminders.find((reminder) => reminder.id === id)
      if (!existing) return
      await updateReminder(id, {
        status: existing.status === 'activo' ? 'completado' : 'activo',
      })
    }

    const addEvent = async (input: NewEvent & { id?: string }) => {
      const item = asPending('event', input) as DbEvent
      await db.events.upsert(item)
      setEvents((current) => [item, ...current.filter((event) => event.id !== item.id)])
      return item
    }

    const updateEvent = async (id: string, changes: Partial<NewEvent>) => {
      const existing = events.find((event) => event.id === id)
      if (!existing) return
      const updated: DbEvent = { ...existing, ...changes, syncStatus: 'pendingSync', updatedAt: Date.now() }
      await db.events.upsert(updated)
      setEvents((current) => current.map((event) => (event.id === id ? updated : event)))
    }

    const deleteEvent = async (id: string) => {
      await db.events.remove(id)
      setEvents((current) => current.filter((event) => event.id !== id))
    }

    const addScheduleBlock = async (input: NewScheduleBlock & { id?: string }) => {
      const item = asPending('block', input) as DbScheduleBlock
      await db.scheduleBlocks.upsert(item)
      setScheduleBlocks((current) => [item, ...current.filter((block) => block.id !== item.id)])
      return item
    }

    const addScheduleBlocks = async (items: Array<NewScheduleBlock & { id?: string }>) => {
      const pendingItems = items.map((item) => asPending('block', item) as DbScheduleBlock)
      await db.scheduleBlocks.upsertMany(pendingItems)
      setScheduleBlocks((current) => {
        const pendingIds = new Set(pendingItems.map((item) => item.id))
        return [...pendingItems, ...current.filter((block) => !pendingIds.has(block.id))]
      })
      return pendingItems
    }

    const updateScheduleBlock = async (id: string, changes: Partial<NewScheduleBlock>) => {
      const existing = scheduleBlocks.find((block) => block.id === id)
      if (!existing) return
      const updated: DbScheduleBlock = { ...existing, ...changes, syncStatus: 'pendingSync', updatedAt: Date.now() }
      await db.scheduleBlocks.upsert(updated)
      setScheduleBlocks((current) => current.map((block) => (block.id === id ? updated : block)))
    }

    const removeScheduleBlock = async (id: string) => {
      await db.scheduleBlocks.remove(id)
      setScheduleBlocks((current) => current.filter((block) => block.id !== id))
    }

    return {
      tasks,
      notes,
      reminders,
      events,
      scheduleBlocks,
      loading,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      addNote,
      updateNote,
      deleteNote,
      addReminder,
      updateReminder,
      deleteReminder,
      toggleReminder,
      addEvent,
      updateEvent,
      deleteEvent,
      addScheduleBlock,
      addScheduleBlocks,
      updateScheduleBlock,
      removeScheduleBlock,
    }
  }, [events, loading, notes, reminders, scheduleBlocks, tasks])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used inside DataProvider')
  return context
}
