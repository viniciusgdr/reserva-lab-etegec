import { useState, useEffect } from 'react'
import { User } from '@/types'
import { userApi } from '@/services/mockApi'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = userApi.getCurrentUser()
    setUser(storedUser)
    setLoading(false)
  }, [])

  const login = (userData: User) => {
    userApi.login(userData)
    setUser(userData)
  }

  const logout = () => {
    userApi.logout()
    setUser(null)
    window.location.href = "/"
  }

  return {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === "admin",
    isProfessor: user?.role === "professor"
  }
}
