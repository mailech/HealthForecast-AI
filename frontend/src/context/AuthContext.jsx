import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const getRoleDashboard = (roleName) => {
  switch (roleName) {
    case 'Doctor': return '/dashboard/doctor'
    case 'Hospital Administrator': return '/dashboard/hospital-admin'
    case 'Healthcare Researcher': return '/dashboard/researcher'
    case 'System Administrator': return '/dashboard/admin'
    default: return '/dashboard/doctor'
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token, user: userData } = response.data
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const hasPermission = (requiredRole) => {
    if (!user) return false
    return user.role?.name === requiredRole
  }

  const hasAnyPermission = (roles) => {
    if (!user) return false
    return roles.includes(user.role?.name)
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      hasPermission,
      hasAnyPermission,
      getRoleDashboard,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
