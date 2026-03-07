import { getUserId } from '@/lib/auth'
import { deleteTask, getProjectById, getTaskById, updateTask } from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/tasks/[id] - Get a specific task
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const task = await getTaskById(id)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify task belongs to user's project
    const project = await getProjectById(task.projectId)
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const task = await getTaskById(id)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify task belongs to user's project
    const project = await getProjectById(task.projectId)
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status, title, description, priority, dueDate, projectId } = body

    // If moving to different project, verify new project belongs to user
    if (projectId && projectId !== task.projectId) {
      const newProject = await getProjectById(projectId)
      if (!newProject || newProject.userId !== userId) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }
    }

    const updatedTask = await updateTask(id, {
      ...(status && { status }),
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(priority && { priority }),
      ...(dueDate !== undefined && { dueDate }),
      ...(projectId && { projectId }),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const { id } = await params
    const task = await getTaskById(id)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Verify task belongs to user's project
    const project = await getProjectById(task.projectId)
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await deleteTask(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
