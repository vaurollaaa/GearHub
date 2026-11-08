import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [status, setStatus] = useState('memuat...')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('gagal terhubung ke backend'))
  }, [])

  return (
    <main>
      <h1>GearHub</h1>
      <p>Status backend: {status}</p>
    </main>
  )
}

export default App