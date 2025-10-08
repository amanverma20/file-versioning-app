import { motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const res = await login({ email, password })
      authLogin(res.data.token, res.data.user)
      toast.success('Logged in')
      navigate('/')
    }catch(err){
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-700 to-sky-600 p-6">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="w-full max-w-md glass p-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Welcome back</h2>
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full p-3 rounded-lg glass-input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full p-3 rounded-lg glass-input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-sm text-white/80 mt-4">Don't have an account? <Link className="underline" to="/register">Register</Link></p>
      </motion.div>
    </div>
  )
}
