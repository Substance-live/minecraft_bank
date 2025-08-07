import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { adminAPI } from '../services/api'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'

const Login = () => {
  const [credentials, setCredentials] = useState({
    login: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await adminAPI.login(credentials)
      if (response.data.status === 'ok' && response.data.token) {
        login(response.data.token)
        navigate('/admin')
      } else {
        setError('Неверный логин или пароль')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-minecraft-dark">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-minecraft-green rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white minecraft-text">
              Вход в систему
            </h1>
            <p className="text-gray-400 mt-2">
              Введите данные администратора
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-900 border border-red-700 rounded-lg">
                <AlertCircle size={20} className="text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-300 mb-2">
                Логин
              </label>
              <input
                type="text"
                id="login"
                name="login"
                value={credentials.login}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="Введите логин"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="input-field w-full pr-10"
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Вход...</span>
                </div>
              ) : (
                'Войти'
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  )
}

export default Login 