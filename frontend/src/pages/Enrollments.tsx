import { FormEvent, useEffect, useState } from 'react';
import { Course, Enrollment, Student, api } from '../lib/api';

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<{ studentId: number | ''; courseId: number | ''; term: string }>({
    studentId: '',
    courseId: '',
    term: 'Fall 2025'
  });

  const load = async () => {
    const [enr, s, c] = await Promise.all([
      api.get<Enrollment[]>('/enrollments'),
      api.get<Student[]>('/students'),
      api.get<Course[]>('/courses')
    ]);
    setEnrollments(enr.data);
    setStudents(s.data);
    setCourses(c.data);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.studentId === '' || form.courseId === '') return;
    await api.post('/enrollments', { studentId: form.studentId, courseId: form.courseId, term: form.term });
    setForm({ studentId: '', courseId: '', term: 'Fall 2025' });
    await load();
  };

  const remove = async (id?: number) => {
    if (!id) return;
    await api.delete(`/enrollments/${id}`);
    await load();
  };

  const setGrade = async (id?: number, grade?: string) => {
    if (!id || !grade) return;
    await api.patch(`/enrollments/${id}/grade`, { grade });
    await load();
  }

  return (
    <div className="vstack" style={{ gap: 16 }}>
      <div className="card vstack">
        <h2>Enrollments</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Term</th>
              <th>Grade</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map(e => (
              <tr key={e.id}>
                <td>{e.student.firstName} {e.student.lastName}</td>
                <td>{e.course.code} — {e.course.title}</td>
                <td>{e.term}</td>
                <td>
                  <span className="badge">{e.grade ?? 'N/A'}</span>
                  {' '}
                  <select className="input" style={{ width: 90 }} onChange={evt => setGrade(e.id, evt.target.value)} defaultValue="">
                    <option value="" disabled>Set grade</option>
                    {['A','A-','B+','B','B-','C+','C','D','F'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </td>
                <td>
                  <button className="button" onClick={() => remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card vstack">
        <h3>Create Enrollment</h3>
        <form className="hstack" onSubmit={onSubmit}>
          <select className="input" value={form.studentId} onChange={e => setForm(f => ({...f, studentId: Number(e.target.value)}))}>
            <option value="" disabled>Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select>
          <select className="input" value={form.courseId} onChange={e => setForm(f => ({...f, courseId: Number(e.target.value)}))}>
            <option value="" disabled>Select course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
          </select>
          <input className="input" placeholder="Term" value={form.term} onChange={e => setForm(f => ({...f, term: e.target.value}))} />
          <button className="button" type="submit">Enroll</button>
        </form>
      </div>
    </div>
  );
}
