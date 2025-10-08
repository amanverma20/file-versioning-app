import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { downloadVersion, getVersions, listFiles, uploadFile } from '../api/files'
import { getRepo } from '../api/repos'

export default function RepoPage(){
  const { id } = useParams()
  const [repo, setRepo] = useState(null)
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [versions, setVersions] = useState([])
  const [versionModalOpen, setVersionModalOpen] = useState(false)
  const dropRef = useRef()

  useEffect(()=>{ fetchRepo(); fetchFiles() }, [])

  const fetchRepo = async ()=>{ try{ const res = await getRepo(id); setRepo(res.data) }catch(err){ console.error(err) } }
  const fetchFiles = async ()=>{ try{ const res = await listFiles(id); setFiles(res.data) }catch(err){ console.error(err) } }

  const upload = async (file) => {
    const fd = new FormData(); fd.append('file', file);
    try{
      setUploading(true); setProgress(0)
      await uploadFile(id, fd, {
        onUploadProgress: (e)=> setProgress(Math.round((e.loaded / e.total) * 100))
      })
      toast.success('Uploaded')
      fetchFiles()
    }catch(err){ toast.error(err.response?.data?.message || 'Upload failed') }
    finally{ setUploading(false); setProgress(0) }
  }

  const submit = async (e)=>{
    e.preventDefault();
    if (!selectedFile) return toast.error('Pick a file')
    await upload(selectedFile)
    setSelectedFile(null)
  }

  const handleDrop = async (e)=>{
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) await upload(f)
  }

  const showVersions = async (fileId)=>{
    try{ const res = await getVersions(id, fileId); setVersions(res.data); setVersionModalOpen(true) }catch(err){ console.error(err) }
  }

  const download = async (versionId, filename) => {
    try{
      const res = await downloadVersion(versionId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    }catch(err){ console.error(err) }
  }

  if (!repo) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
  <h2 className="repo-page-title">{repo.name}</h2>
  <p className="repo-page-desc">{repo.description}</p>

  <div onDrop={handleDrop} onDragOver={(e)=>{ e.preventDefault(); setDragOver(true)}} onDragLeave={()=>setDragOver(false)} ref={dropRef} onClick={()=>document.getElementById('fileInput')?.click()} className={`p-6 rounded-lg border-2 border-dashed drop-area ${dragOver ? 'drop-area-active' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Upload files</h4>
              <p className="text-sm text-slate-500">Drag & drop or click to select files</p>
            </div>
            <form onSubmit={submit} onClick={e=>e.stopPropagation()}>
              <input
                className="hidden"
                id="fileInput"
                type="file"
                onChange={e=>{
                  const f = e.target.files?.[0]
                  if (f) setSelectedFile(f)
                  e.target.value = null
                }}
              />
              <label htmlFor="fileInput" className="btn btn-ghost cursor-pointer mr-2">Choose file</label>
              <button type="submit" className="btn btn-accent" disabled={uploading || !selectedFile}>{uploading ? 'Uploading...' : 'Upload'}</button>
            </form>
          </div>
          {selectedFile && <div className="mt-3">Selected: {selectedFile.name}</div>}
          {uploading && <div className="mt-3"><div className="w-full bg-slate-200 rounded h-2 overflow-hidden"><div style={{width: `${progress}%`}} className="bg-primary h-2" /></div><div className="text-sm mt-1">{progress}%</div></div>}
        </div>

        <div className="mt-6 grid gap-3">
          {files.map(f=> (
            <motion.div key={f._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 card">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{f.originalName}</h4>
                  <p className="text-sm text-slate-500">Versions: {f.versions?.length || 0}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>showVersions(f._id)} className="btn btn-ghost">Versions</button>
                </div>
              </div>
              {f.versions && f.versions.map(v => (
                <div key={v._id} className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <div>v{v.versionNumber} • {new Date(v.createdAt).toLocaleString()}</div>
                  <button onClick={()=>download(v._id, v.originalName)} className="btn btn-accent">Download</button>
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        {versionModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/40" onClick={()=>setVersionModalOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative modal-card p-6 w-full max-w-xl z-10">
              <h3 className="text-lg font-semibold mb-2">Version history</h3>
              <div className="space-y-2 max-h-96 overflow-auto">
                {versions.map(v => (
                  <div key={v._id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">v{v.versionNumber}</div>
                      <div className="text-sm text-slate-500">By {v.uploader?.name || 'Unknown'} • {new Date(v.createdAt).toLocaleString()}</div>
                    </div>
                    <button onClick={()=>download(v._id, v.originalName)} className="px-3 py-1 bg-primary text-white rounded">Download</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
