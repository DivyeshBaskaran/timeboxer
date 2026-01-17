import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  async function handleSignUp() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Check your email for confirmation link')
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-lg font-bold mb-4">Sign In / Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSignIn}
          className="flex-1 bg-indigo-600 text-white py-2 rounded"
          disabled={loading}
        >
          Sign In
        </button>
        <button
          onClick={handleSignUp}
          className="flex-1 bg-green-600 text-white py-2 rounded"
          disabled={loading}
        >
          Sign Up
        </button>
      </div>
    </div>
  )
}
