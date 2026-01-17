import { useEffect, useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '../lib/supabase'

export default function CalendarView({ userId, refreshKey }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const calendarRef = useRef(null) // ✅ Reference to FullCalendar

  async function fetchTasksAndProjects() {
    if (!userId) return
    setLoading(true)

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title') // use your project title column
      .eq('user_id', userId)

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      setEvents([])
      setLoading(false)
      return
    }

    const projectMap = Object.fromEntries(projects.map(p => [p.id, p.title]))

    const { data: subtasks, error: subtasksError } = await supabase
      .from('subtasks')
      .select('id, title, scheduled_start, scheduled_end, project_id')
      .eq('user_id', userId)

    if (subtasksError) {
      console.error('Error fetching subtasks:', subtasksError)
      setEvents([])
      setLoading(false)
      return
    }

    const calendarEvents = (subtasks || []).map(task => ({
      id: task.id,
      title: `[${projectMap[task.project_id] || 'No Project'}] ${task.title}`,
      start: task.scheduled_start,
      end: task.scheduled_end
    }))

    setEvents(calendarEvents)
    setLoading(false)
  }

  useEffect(() => {
    fetchTasksAndProjects()
  }, [userId, refreshKey])

  // ✅ Change view function
  function handleChangeView(viewName) {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.changeView(viewName)
    }
  }

  return (
    <div className="mb-6">
      {/* View toggle buttons */}
      <div className="flex gap-2 mb-2">
        <button
          className="px-3 py-1 bg-indigo-600 text-white rounded"
          onClick={() => handleChangeView('timeGridDay')}
        >
          Day
        </button>
        <button
          className="px-3 py-1 bg-indigo-600 text-white rounded"
          onClick={() => handleChangeView('timeGridWeek')}
        >
          Week
        </button>
        <button
          className="px-3 py-1 bg-indigo-600 text-white rounded"
          onClick={() => handleChangeView('dayGridMonth')}
        >
          Month
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading calendar...</p>
      ) : (
        <FullCalendar
          ref={calendarRef} // ✅ Attach ref
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          events={events}
          allDaySlot={false}
          height="auto"
        />
      )}
    </div>
  )
}
