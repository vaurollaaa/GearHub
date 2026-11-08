import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api'
import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'gearhub_token'

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    if (!token) return
    let cancelled = false
    apiRequest('/auth/me', { token })
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const saveSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.access_token)
    setUser(data.user)
    setToken(data.access_token)
  }, [])

  const login = useCallback(
    async (email, password) => {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      saveSession(data)
    },
    [saveSession],
  )

    const register = useCallback(async (fullName, email, password) => {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: { full_name: fullName, email, password },
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}