import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  db,
  type DbTask,
  type DbNote,
  type DbReminder,
  type DbEvent,
  type DbScheduleBlock,
} from '../services/db'

interface DataContextValue {
  // State
  tasks: DbTask[]
  notes: DbNote[]
  reminders: DbReminder[]
  events: DbEvent[]
  scheduleBlocks: DbScheduleBlock[]
  loading: boolean

  // Tasks
  addTask: (t: Omit<DbTask, 'id' | 'syncStatus' | 'updatedAt'>) => Promise<void>
  updateTask: (
    id: string,
    changes: Partial<Omit<DbTask, 'id' | 'syncStatus' | 'updatedAt'>>,
  ) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>

  // Notes
  addNote: (n: Omit<DbNote, 'id' | 'syncStatus' | 'updatedAt'>) => Promise<void>
  updateNote: (
    id: string,
    changes: Partial<Omit<DbNote, 'id' | 'syncStatus' | 'updatedAt'>>,
  ) => Promise<void>
  deleteNote: (id: string) => Promise<void>

  // Reminders
  addReminder: (r: Omit<DbReminder, 'id' | 'syncStatus' | 'updatedAt'>) => Promise<void>
  toggleReminder: (id: string) => Promise<void>
  deleteReminder: (id: string) => Promise<void>

  // Events
  addEvent: (e: Omit<DbEvent, 'id' | 'syncStatus' | 'updatedAt'>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>

  // Schedule blocks
  addScheduleBlock: (
    b: Omit<DbScheduleBlock, 'id' | 'syncStatus' | 'updatedAt'>,
  ) => Promise<void>
  removeScheduleBlock: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<DbTask[]>([])
  const [notes, setNotes] = useState<DbNote[]>([])
  const [reminders, setReminders] = useState<DbReminder[]>([])
  const [events, setEvents] = useState<DbEvent[]>([])
  const [scheduleBlocks, setScheduleBlocks] = useState<DbScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      db.tasks.getAll(),
      db.notes.getAll(),
      db.reminders.getAll(),
      db.events.getAll(),
      db.scheduleBlocks.getAll(),
    ])
      .then(([t, n, r, e, s]) => {
        setTasks(t.sort((a, b) => b.updatedAt - a.updatedAt))
        setNotes(n.sort((a, b) => b.updatedAt - a.updatedAt))
        setReminders(r.sort((a, b) => b.updatedAt - a.updatedAt))
        setEvents(e.sort((a, b) => b.updatedAt - a.updatedAt))
        setScheduleBlocks(s)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // ── Tasks ──────────────────────────────────────────────────────────────────

  const addTask = async (
    input: Omit<DbTask, 'id' | 'syncStatus' | 'updatedAt'>,
  ): Promise<void> => {
    const item: DbTask = {
      ...input,
      id: makeId('task'),
      syncStatus: 'pendingSync',
      updatedAt: Date.now(),
    }
    await db.tasks.upsert(item)
    setTasks((prev) => [item, ...prev])
  }

  const updateTask = async (
    id: string,
    changes: Partial<Omit<DbTask, 'id' | 'syncStatus' | 'updatedAt'>>,
  ): Promise<void> => {
    const existing = tasks.find((t) => t.id === id)
    if (!existing) return
    const updated: DbTask = {
      ...existing,
      ...changes,
      syncStatus: 'pendingSync',
      updatedAt: Date.now(),
    }
    await db.tasks.upsert(updated)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  const deleteTask = async (id: string): Promise<void> => {
    await db.tasks.remove(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const toggleTask = async (id: string): Promise<void> => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const updated: DbTask = {
      ...task,
      done: !task.done,
      status: !task.done ? 'entregada' : 'pendiente',
      syncStatus: 'pendingSync',
      updatedAt: Date.now(),
    }
    await db.tasks.upsert(updated)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  // ── Notes ──────────────────────────────────────────────────────────────────

  const addNote = async (
    input: Omit<DbNote, 'id' | 'syncStatus' | 'updatedAt'>,
  ): Promise<void> => {
    const item: DbNote = {
      ...input,
      id: makeId('note'),
      syncStatus: 'pendingSync',
      updatedAt: Date.now(),
    }
    await db.notes.upsert(item)
    setNotes((prev) => [item, ...prev])
  }

  const updateNote = async (
    id: string,
    changes: Partial<Omit<DbNote, 'id' | 'syncStatus' | 'updatedAt'>>,
  ): Promise<void> => {
    const existing = notes.find((n) => n.id === id)
    if (!existing) return
    const updated: DbNote = {
      ...existing,
      ...changes,
      syncStatus: 'pendingSync',
      updatedAt: Date.now(),
    }
    await db.notes.upsert(updated)
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)))
  }

  const deleteNote = async (id: string): Promise<void> => {
    await db.notes.remove(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  // ── Reminders ─────────────────────────────────────────────────────────────

  const addReminder = async (
    input: Omit<DbReminder, 'id' | 'syncStatus' | 'updatedAt'>,
  ): Promise<void> => {
    const item: DbReminder = {
      ...input,
      id: makeId('reminder'),
      syncStatus: 'pendingSync',
      updatedAt: Date.now(),
    }
    await db.reminders.upsert(item)
    setReminders((prev) => [item, ...prev])
  }

  const toggleReminder = async (id: string): Promise<void> => {
    const reminder = reminders.find((r) => r.id === id)
    if (!reminder) return
    const updated: DbReminder = {
      ...reminder,
      status: reminder.status === 'activo' ? 'completado' : 'activo',
      syncStatus: 'pendingSync',
      updatedAt: Date.now(),
    }
    await db.reminders.upsert(updated)
    setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)))
  }

  const deleteReminder = async (id: string): Promise<void> => {
    await db.reminders.remove(id)
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  // ── Events ────────────────────────────────────────────────────────────────

  const addEvent = async (
    input: Omit<DbEvent, 'id' | 'syncStatus' | 'updatedAt'>,
  ): Promise<void> => {
    const item: DbEvent = {
      ...input,
      id: makeId('event'),
      syncStatus: 'pendingSync',
      updatedAt: Date.now(),
    }
    await db.events.upsert(item)
    setEvents((prev) => [item, ...prev])
  }

  const deleteEvent = async (id: string): Promise<void> => {
    await db.events.remove(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  // ── Schedule Blocks ───────────────────────────────────────────────────────

  const addScheduleBlock = async (
    input: Omit<DbScheduleBlock, 'id' | 'syncStatus' | 'updatedAt'>,
  ): Promise<void> => {
    const item: DbScheduleBlock = {
      ...input,
      id: makeId('block'),
      syncStatus: 'pendingSync',
      updatedAt: Date.now(),
    }
    await db.scheduleBlocks.upsert(item)
    setScheduleBlocks((prev) => [item, ...prev])
  }

  const removeScheduleBlock = async (id: string): Promise<void> => {
    await db.scheduleBlocks.remove(id)
    setScheduleBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <DataContext.Provider
      value={{
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
        toggleReminder,
        deleteReminder,
        addEvent,
        deleteEvent,
        addScheduleBlock,
        removeScheduleBlock,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
