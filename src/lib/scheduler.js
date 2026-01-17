// lib/scheduler.js

export function autoScheduleSubtasks(subtasks, dayStart = '09:00', dayEnd = '17:00') {
  // Parse day start/end
  const [startHour, startMinute] = dayStart.split(':').map(Number)
  const [endHour, endMinute] = dayEnd.split(':').map(Number)

  const scheduled = []

  // Initialize current time at the start of the day (local time)
  let currentTime = new Date()
  currentTime.setHours(startHour, startMinute, 0, 0)

  const endTime = new Date()
  endTime.setHours(endHour, endMinute, 0, 0)

  // Sort subtasks by priority then due date
  const tasks = [...subtasks].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return new Date(a.due_date) - new Date(b.due_date)
  })

  for (let task of tasks) {
    const durationMs = (task.estimated_minutes || 30) * 60000

    // If task won't fit in today's window, move to next day
    if (currentTime.getTime() + durationMs > endTime.getTime()) {
      currentTime.setDate(currentTime.getDate() + 1)
      currentTime.setHours(startHour, startMinute, 0, 0)
    }

    // Assign scheduled start/end
    const scheduledStart = new Date(currentTime)
    const scheduledEnd = new Date(currentTime.getTime() + durationMs)

    // Convert to ISO string without timezone shift (keeps local hour)
    const startISO = scheduledStart.toISOString().slice(0, 19)
    const endISO = scheduledEnd.toISOString().slice(0, 19)

    scheduled.push({
      ...task,
      scheduled_start: startISO,
      scheduled_end: endISO
    })

    // Move current time forward
    currentTime = new Date(scheduledEnd)
  }

  return scheduled
}
