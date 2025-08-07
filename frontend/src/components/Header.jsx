import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Shield, Home, Settings } from 'lucide-react'

const Header = () => {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-surface border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <h1 className="text-xl font-semibold text-text tracking-tight">
                Trade Bank
              </h1>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                to="/"
                className="text-text-secondary hover:text-text px-3 py-2 text-sm font-medium transition-colors"
              >
                Торговля
              </Link>
            </div>
          </div>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-2 text-text-secondary hover:text-text transition-colors"
            >
              <Home size={18} />
              <span className="text-sm font-medium">Главная</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-text-secondary hover:text-text transition-colors"
                >
                  <Settings size={18} />
                  <span className="text-sm font-medium">Админ панель</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-text-secondary hover:text-danger transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Выйти</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                className="flex items-center space-x-2 btn-primary"
              >
                <Shield size={20} />
                <span>Войти</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header 