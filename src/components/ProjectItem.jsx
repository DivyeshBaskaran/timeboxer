import { useState } from 'react'
import { supabase } from '../lib/supabase'
import SubtaskList from './SubtaskList.jsx'
import AddSubtask from './AddSubtask.jsx'
import { autoScheduleSubtasks } from '../lib/scheduler.js'

export default function ProjectItem({ project }) {
  const [open, setOpen] = useState(true) // toggle subtasks
  const [refreshKey, setRefreshKey] = useState(0)

  // Refresh project to fetch updated subtasks
  async function refreshProject() {
    const { data, error } = await supabase
      .from('projects')
      .select('*, subtasks(*)')
      .eq('id', project.id)

    if (error) console.error(error)
    else setRefreshKey(k => k + 1)
  }

  // Auto-schedule subtasks
  async function handleAutoSchedule() {
    if (!project.subtasks || project.subtasks.length === 0) return

    const dayStart = prompt('Enter day start (HH:MM)', '09:00') || '09:00'
    const dayEnd = prompt('Enter day end (HH:MM)', '17:00') || '17:00'

    const scheduledTasks = autoScheduleSubtasks(project.subtasks, dayStart, dayEnd)

    // Save scheduled times to Supabase
    for (let task of scheduledTasks) {
      await supabase
        .from('subtasks')
        .update({
          scheduled_start: task.scheduled_start,
          scheduled_end: task.scheduled_end,
        })
        .eq('id', task.id)
    }

    alert('Tasks scheduled!')
    refreshProject() // refresh to show times
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      {/* Project Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{project.title}</h2>
        <button
          className="text-sm text-gray-500"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Hide' : 'Show'} Subtasks
        </button>
      </div>

      {/* Auto-Schedule Button
      <button
        className="bg-indigo-600 text-white px-3 py-1 rounded mb-3"
        onClick={handleAutoSchedule}
      >
        Auto-Schedule Tasks
      </button> */}

      {/* Subtasks List & Add Subtask */}
      {open && (
        <>
          <SubtaskList key={refreshKey} subtasks={project.subtasks || []} />
          <AddSubtask projectId={project.id} onAdded={refreshProject} />
        </>
      )}
    </div>
  )
}
