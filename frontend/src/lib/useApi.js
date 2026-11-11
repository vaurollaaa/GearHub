import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from './api'

export function useApi(path) {
  const { token } = useAuth()
  const [result, setResult] = useState({ path: null, data: null, error: '' })

  useEffect(() => {
    if (!path) return
    let cancelled = false
    apiRequest(path, { token })
      .then((data) => {
        if (!cancelled) setResult({ path, data, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setResult({ path, data: null, error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [path, token])

  const loading = Boolean(path) && result.path !== path
  const ready = Boolean(path) && !loading
  return {
    data: ready ? result.data : null,
    error: ready ? result.error : '',
    loading,
  }
}