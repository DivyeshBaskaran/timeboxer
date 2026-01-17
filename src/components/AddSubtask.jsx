import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AddSubtask({ projectId, onAdded }) {
  const [title, setTitle] = useState('')

  async function handleAdd() {
    if (!title || !projectId) return
    const { error } = await supabase
      .from('subtasks')
      .insert([{ project_id: projectId, title, estimated_minutes: 30 }])
    if (error) console.error(error)
    setTitle('')
    if (onAdded) onAdded()
  }

  return (
    <div className="flex gap-2 mt-2">
      <input
        className="flex-1 border p-2 rounded"
        placeholder="New subtask"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button
        className="bg-indigo-600 text-white px-3 py-1 rounded"
        onClick={handleAdd}
      >
        Add
      </button>
    </div>
  )
}
