import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ProjectItem from './ProjectItem.jsx'

export default function ProjectList({ userId }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  async function fetchProjects() {
    setLoading(true)

    // Use 'id' for ordering to avoid created_at error
    const { data, error } = await supabase
      .from('projects')
      .select('*, subtasks(*)')
      .eq('user_id', userId)
      .order('id', { ascending: true }) // safe fallback ordering

    if (error) {
      console.error('Error fetching projects:', error)
      setProjects([])
    } else {
      setProjects(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (!userId) return
    fetchProjects()
  }, [userId, refreshKey])

  if (loading) {
    return <p>Loading projects...</p>
  }

  if (!projects || projects.length === 0) {
    return <p className="text-gray-500">No projects yet. Add one above!</p>
  }

  return (
    <div className="space-y-4">
      {projects
        .filter(project => project != null) // safeguard
        .map(project => (
          <ProjectItem
            key={project.id}
            project={project}
            onUpdate={() => setRefreshKey(k => k + 1)}
          />
        ))}
    </div>
  )
}
