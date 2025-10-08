import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { createRepo, deleteRepo, getRepos, updateRepo } from '../api/repos'

export default function Dashboard(){
  const [repos, setRepos] = useState([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{ fetchRepos() }, [])
  const fetchRepos = async ()=>{
    setLoading(true)
    try{ const res = await getRepos(); setRepos(res.data) }catch(err){ console.error(err); if (err.response?.status===401) { localStorage.removeItem('token'); navigate('/login')} } finally { setLoading(false) }
  }
  const submit = async (e)=>{
    e.preventDefault();
    try{ await createRepo({ name, description: desc }); setName(''); setDesc(''); setModalOpen(false); toast.success('Repository created'); fetchRepos(); }catch(err){ toast.error(err.response?.data?.message || 'Create failed') }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold page-title">Your Repositories</h1>
          <div className="flex items-center gap-3">
            <button onClick={()=>{ localStorage.removeItem('token'); navigate('/login') }} className="btn btn-ghost">Logout</button>
            <button onClick={()=>setModalOpen(true)} className="btn btn-primary">New Repo</button>
          </div>
        </div>

        {loading ? <div className="flex justify-center"><div className="loader"/></div> : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {repos.map(r=> (
              <motion.div key={r._id} whileHover={{ scale: 1.03 }} className="card flex items-start justify-between">
                <div className="pr-4 flex-1">
                  <h4 className="repo-title">{r.name}</h4>
                  <p className="repo-desc">{r.description}</p>
                  <Link to={`/repo/${r._id}`} className="text-sm text-primary mt-2 inline-block">Open</Link>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button onClick={async ()=>{
                      const newName = prompt('New repository name', r.name)
                      if (!newName || newName.trim()===r.name) return
                      try{ await updateRepo(r._id, { name: newName }); toast.success('Renamed'); fetchRepos() }catch(err){ toast.error(err.response?.data?.message || 'Rename failed') }
                    }} className="btn btn-ghost text-sm">Edit</button>
                    <button onClick={async ()=>{
                      if (!confirm('Delete repository? This cannot be undone.')) return
                      try{ await deleteRepo(r._id); toast.success('Deleted'); fetchRepos() }catch(err){ toast.error(err.response?.data?.message || 'Delete failed') }
                    }} className="btn btn-ghost text-sm text-rose-600">Delete</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {modalOpen && (
        <div className="slide-over-overlay" onClick={()=>setModalOpen(false)}>
          <motion.div initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="slide-over-panel" onClick={e=>e.stopPropagation()}>
            <button className="slide-over-close" onClick={()=>setModalOpen(false)} aria-label="Close">×</button>
            <h3 className="text-lg font-semibold mb-2">Create repository</h3>
            <form onSubmit={submit} className="space-y-3">
              <input className="w-full p-3 border rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
              <input className="w-full p-3 border rounded" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
