import React, { useState, useRef } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase/config'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

const CSS = `
  .pu-root { display: flex; flex-direction: column; gap: 12px; }

  .pu-dropzone {
    border: 2px dashed rgba(201,136,58,0.3);
    border-radius: 14px; padding: 28px 20px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    cursor: pointer; transition: all 0.2s; background: rgba(201,136,58,0.04);
    text-align: center;
  }
  .pu-dropzone:hover, .pu-dropzone.drag { border-color: rgba(201,136,58,0.6); background: rgba(201,136,58,0.09); }
  .pu-dropzone input { display: none; }

  .pu-queue { display: flex; flex-direction: column; gap: 8px; }

  .pu-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
  }

  .pu-thumb { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: rgba(255,255,255,0.06); }

  .pu-progress-track { flex: 1; height: 4px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
  .pu-progress-fill { height: 4px; background: linear-gradient(90deg, #c9883a, #e0a84f); border-radius: 99px; transition: width 0.2s; }

  .pu-remove { background: none; border: none; cursor: pointer; color: #475569; padding: 4px; border-radius: 6px; transition: color 0.15s; display: flex; }
  .pu-remove:hover { color: #f87171; }
`

function injectCSS() {
  if (document.getElementById('pu-css')) return
  const s = document.createElement('style'); s.id = 'pu-css'; s.textContent = CSS; document.head.appendChild(s)
}

/**
 * PhotoUploader — upload depuis le PC vers Firebase Storage
 *
 * Props:
 *   folder       : string — sous-dossier Firebase (ex: "properties/abc123/main")
 *   onUploaded   : (url: string) => void — appelé à chaque upload réussi
 *   maxFiles     : number — max de fichiers simultanés (défaut: 5)
 *   label        : string — libellé du bouton
 */
export default function PhotoUploader({ folder = 'photos', onUploaded, maxFiles = 10, label = 'Ajouter des photos' }) {
  const [queue, setQueue] = useState([]) // { id, file, progress, status, url, preview }
  const [drag, setDrag] = useState(false)
  const inputRef = useRef()

  injectCSS()

  const processFiles = (files) => {
    const accepted = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (accepted.length === 0) return

    const newItems = accepted.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      progress: 0,
      status: 'uploading', // uploading | done | error
      url: null,
      preview: URL.createObjectURL(file),
    }))

    setQueue(prev => [...prev, ...newItems])

    newItems.forEach(item => uploadFile(item))
  }

  const uploadFile = (item) => {
    const ext = item.file.name.split('.').pop()
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, item.file)

    task.on('state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: pct } : q))
      },
      (_err) => {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error' } : q))
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done', url, progress: 100 } : q))
        if (onUploaded) onUploaded(url)
      }
    )
  }

  const remove = (id) => setQueue(prev => prev.filter(q => q.id !== id))

  return (
    <div className="pu-root">
      {/* Zone de dépôt */}
      <div
        className={`pu-dropzone ${drag ? 'drag' : ''}`}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); processFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => processFiles(e.target.files)} />
        <div style={{ width: 48, height: 48, background: 'rgba(201,136,58,0.1)', border: '1px solid rgba(201,136,58,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Upload size={22} style={{ color: '#c9883a' }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#f5f0ea', marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 12, color: '#64748b' }}>Glissez-déposez ou cliquez · JPG, PNG, WebP</p>
        </div>
      </div>

      {/* File en cours / terminée */}
      {queue.length > 0 && (
        <div className="pu-queue">
          {queue.map(item => (
            <div key={item.id} className="pu-item">
              {item.preview && (
                <img src={item.preview} className="pu-thumb" alt="" />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.file.name}
                </p>
                {item.status === 'uploading' && (
                  <div className="pu-progress-track">
                    <div className="pu-progress-fill" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
                {item.status === 'done' && (
                  <p style={{ fontSize: 11, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={11} /> Uploadé avec succès
                  </p>
                )}
                {item.status === 'error' && (
                  <p style={{ fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={11} /> Erreur lors de l'upload
                  </p>
                )}
              </div>
              <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>
                {item.status === 'uploading' ? `${item.progress}%` : ''}
              </span>
              {item.status !== 'uploading' && (
                <button onClick={() => remove(item.id)} className="pu-remove">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
