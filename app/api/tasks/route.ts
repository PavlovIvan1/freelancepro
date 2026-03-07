import { getUserId } from '@/lib/auth'
import { initDb } from '@/lib/db/db'
import {
  createTask,
  deleteTask,
  getProjectById,
  getTasksByProjectId,
  getTasksByUserId,
  updateTask
} from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

// GET /api/tasks - Get all tasks (optionally filtered by projectId)
export async function GET(request: Request) {
  try {
    // Initialize database
    await initDb()
    
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    let tasks
    if (projectId) {
      tasks = await getTasksByProjectId(projectId)
    } else {
      tasks = await getTasksByUserId(userId)
    }
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { projectId, title, description, status, priority, dueDate } = body

    // Verify project belongs to user
    const project = await getProjectById(projectId)
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const id = 't_' + Math.random().toString(36).slice(2, 11)
    const now = new Date().toISOString()

    const task = await createTask({
      id,
      userId,
      projectId,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      createdAt: now,
      updatedAt: now
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

// PUT /api/tasks - Update a task
export async function PUT(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { id, ...updates } = body

    const task = await updateTask(id, updates)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/tasks - Delete a task
export async function DELETE(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    await deleteTask(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
