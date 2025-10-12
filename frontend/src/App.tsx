import { Link, Route, Routes, NavLink } from 'react-router-dom';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Enrollments from './pages/Enrollments';

export default function App() {
  return (
    <div className="container vstack">
      <header className="header">
        <h1>College Ecosystem</h1>
        <nav className="nav">
          <NavLink className={({isActive}) => isActive ? 'link badge' : 'link'} to="/">Students</NavLink>
          <NavLink className={({isActive}) => isActive ? 'link badge' : 'link'} to="/courses">Courses</NavLink>
          <NavLink className={({isActive}) => isActive ? 'link badge' : 'link'} to="/enrollments">Enrollments</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Students />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/enrollments" element={<Enrollments />} />
        </Routes>
      </main>

      <footer>
        <small>Demo app — React + Spring Boot + H2</small>
      </footer>
    </div>
  );
}
