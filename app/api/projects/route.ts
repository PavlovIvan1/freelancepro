import { getUserId } from '@/lib/auth'
import {
  createProject,
  getProjectsByUserId,
  getTasksByProjectId,
  getUserById
} from '@/lib/db/json-db'
import { NextResponse } from 'next/server'

// Plan limits
const PLAN_LIMITS = {
  free: { projects: 5, clients: 10 },
  pro: { projects: Infinity, clients: Infinity },
}

export async function GET() {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const projects = await getProjectsByUserId(userId)
    
    // Add tasks to each project
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const tasks = await getTasksByProjectId(project.id)
        return { ...project, tasks }
      })
    )
    
    return NextResponse.json(projectsWithTasks)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const plan = user.subscriptionPlan || 'free'
    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
    
    // Check project limit
    const existingProjects = await getProjectsByUserId(userId)
    if (existingProjects.length >= limits.projects) {
      return NextResponse.json({ 
        error: `Лимит проектов исчерпан. Ваш тариф "${plan === 'free' ? 'Бесплатный' : 'Pro'}" позволяет создать до ${limits.projects === Infinity ? 'неограниченно' : limits.projects} проектов.`,
        limitReached: true,
        limitType: 'projects'
      }, { status: 403 })
    }
    
    const body = await request.json()
    const { name, clientId, budget, status, description, deadline, notes } = body

    const id = 'p_' + Math.random().toString(36).slice(2, 11)
    const now = new Date().toISOString()

    const project = await createProject({
      id,
      userId,
      clientId: clientId || null,
      name,
      description: description || '',
      status: status || 'active',
      budget: budget || 0,
      deadline: deadline || null,
      createdAt: now,
      updatedAt: now
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
