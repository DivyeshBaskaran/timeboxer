import { useState, useEffect } from 'react'
import CalendarView from './components/CalenderView.jsx'
import ProjectList from './components/ProjectList.jsx'
import AddProject from './components/AddProject.jsx'
import SignIn from './components/SignIn.jsx'
import { supabase } from './lib/supabase'
import { autoScheduleSubtasks } from './lib/scheduler.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [dayStart, setDayStart] = useState('09:00')
  const [dayEnd, setDayEnd] = useState('17:00')

  // Load current user
  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getSession()
      if (error) console.error(error)
      else setUser(data.session?.user ?? null)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  // Load user settings safely
  useEffect(() => {
    async function loadSettings() {
      if (!user) return
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error loading user settings:', error)
        return
      }

      const userSettings = settings[0] || { day_start: '09:00', day_end: '17:00' }
      setDayStart(userSettings.day_start.slice(0, 5))
      setDayEnd(userSettings.day_end.slice(0, 5))
    }
    loadSettings()
  }, [user])

  // Update user settings in Supabase
  async function updateSettings(start, end) {
    if (!user) return

    const { data, error } = await supabase
      .from('user_settings')
      .update({
        day_start: start,
        day_end: end
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to update settings:', error)
      return
    }

    // Ensure state reflects what’s actually in DB
    if (data && data.length > 0) {
      setDayStart(data[0].day_start.slice(0, 5))
      setDayEnd(data[0].day_end.slice(0, 5))
    }
  }


  const handleDayStartChange = e => {
    const newStart = e.target.value
    setDayStart(newStart)
    updateSettings(newStart, dayEnd)
  }

  const handleDayEndChange = e => {
    const newEnd = e.target.value
    setDayEnd(newEnd)
    updateSettings(dayStart, newEnd)
  }

  // Auto-schedule all projects for this user
  async function handleAutoScheduleAll() {
    if (!user) return

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, subtasks(*)')
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      return
    }

    for (let project of projects) {
      const scheduledTasks = autoScheduleSubtasks(
        project.subtasks || [],
        dayStart,
        dayEnd
      )

      for (let task of scheduledTasks) {
        await supabase
          .from('subtasks')
          .update({
            scheduled_start: task.scheduled_start,
            scheduled_end: task.scheduled_end
          })
          .eq('id', task.id)
      }
    }

    // ✅ Refresh ProjectList & Calendar
    setRefreshKey(k => k + 1)
  }


  if (!user) return <SignIn />

  return (
    <div className="mx-auto max-w-xl p-6 bg-gray-50 min-h-screen">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Timeboxer</h1>

      <AddProject userId={user.id} />

      {/* Day start/end inputs */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Day Start</label>
          <input
            type="time"
            value={dayStart}
            onChange={handleDayStartChange}
            className="border p-2 rounded w-24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Day End</label>
          <input
            type="time"
            value={dayEnd}
            onChange={handleDayEndChange}
            className="border p-2 rounded w-24"
          />
        </div>
      </div>

      <button
        className="bg-green-600 text-white px-3 py-2 rounded mb-6"
        onClick={handleAutoScheduleAll}
      >
        Auto-Schedule All Projects
      </button>

      <CalendarView userId={user.id} refreshKey={refreshKey} />
      <ProjectList key={refreshKey} userId={user.id} />
    </div>
  )
}
