import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AddProject({ userId }) {
  const [title, setTitle] = useState('')

  async function handleAdd() {
    if (!title || !userId) return
    const { error } = await supabase
      .from('projects')
      .insert([{ title, priority: 3, user_id: userId }])
    if (error) console.error(error)
    setTitle('')
  }

  return (
    <div className="mb-4 flex gap-2">
      <input
        className="flex-1 border p-2 rounded"
        placeholder="New project"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <button
        className="bg-indigo-600 text-white px-3 py-1 rounded"
        onClick={handleAdd}
      >
        Add Project
      </button>
    </div>
  )
}
