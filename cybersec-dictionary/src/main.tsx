import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Dictionary from './pages/Dictionary.tsx'
import Saved from './pages/Saved.tsx'
import Books from './pages/Books.tsx'
import Tools from './pages/Tools.tsx'
import Notes from './pages/Notes.tsx'
import Quizzes from './pages/Quizzes.tsx'
import Game from './pages/Game.tsx'
import Profile from './pages/Profile.tsx'
import Visualization from './pages/Visualization.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dictionary /> },
      { path: 'saved', element: <Saved /> },
      { path: 'books', element: <Books /> },
      { path: 'tools', element: <Tools /> },
      { path: 'notes', element: <Notes /> },
      { path: 'quizzes', element: <Quizzes /> },
      { path: 'game', element: <Game /> },
      { path: 'visualizations', element: <Visualization /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
