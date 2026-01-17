import { supabase } from '../lib/supabase'

export default function SubtaskList({ subtasks, onUpdate }) {

  async function handleDeleteTask(taskId) {
    const confirmed = window.confirm("Are you sure you want to delete this task?")
    if (!confirmed) return

    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error("Failed to delete task:", error)
      return
    }

    // Notify parent to refresh
    onUpdate?.()
  }

  return (
    <ul className="mt-3 space-y-2">
      {subtasks.map(task => (
        <li
          key={task.id}
          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
        >
          <div className="flex items-center gap-3">
            <span>{task.title}</span>
            <span className="text-sm text-gray-500">{task.estimated_minutes} min</span>
          </div>

          <button
            className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded"
            onClick={() => handleDeleteTask(task.id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
