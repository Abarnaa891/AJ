import { NavLink, Outlet } from 'react-router-dom'
import { Moon, Sun, Shield, BookOpen, Bookmark, Hammer, StickyNote, Gamepad2, HelpCircle, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

function useDarkMode() {
  const [isLight, setIsLight] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light') return true
    if (stored === 'dark') return false
    return false
  })
  useEffect(() => {
    const html = document.documentElement
    if (isLight) {
      html.classList.add('light')
      localStorage.setItem('theme', 'light')
    } else {
      html.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    }
  }, [isLight])
  return { isLight, toggle: () => setIsLight(v => !v) }
}

function App() {
  const { isLight, toggle } = useDarkMode()
  const navItems = useMemo(() => ([
    { to: '/', label: 'Dictionary', icon: Shield },
    { to: '/saved', label: 'Saved', icon: Bookmark },
    { to: '/books', label: 'Books', icon: BookOpen },
    { to: '/tools', label: 'Tools', icon: Hammer },
    { to: '/notes', label: 'Notes', icon: StickyNote },
    { to: '/quizzes', label: 'Quizzes', icon: HelpCircle },
    { to: '/game', label: 'Game', icon: Gamepad2 },
    { to: '/profile', label: 'Profile', icon: User },
  ]), [])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Shield size={18} />
          <span>CyberSec Companion</span>
        </div>
        <nav className="nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : ''} end={item.to === '/'}>
              <span className="flex items-center gap-8">
                <item.icon size={16} />
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={toggle}>
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
          {isLight ? 'Dark Mode' : 'Light Mode'}
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export default App
