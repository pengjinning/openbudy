import Dexie, { type Table } from 'dexie'
import type { Task, Message, Artifact } from '../types'

class WorkBuddyDB extends Dexie {
  tasks!: Table<Task, string>
  messages!: Table<Message, string>
  artifacts!: Table<Artifact, string>

  constructor() {
    super('workbuddy')
    this.version(1).stores({
      tasks: 'id, status, createdAt, updatedAt, pinned',
      messages: 'id, taskId, role, createdAt',
      artifacts: 'id, taskId, fileType, createdAt',
    })
  }
}

export const db = new WorkBuddyDB()
