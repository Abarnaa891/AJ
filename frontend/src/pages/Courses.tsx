import { FormEvent, useEffect, useState } from 'react';
import { Course, api } from '../lib/api';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<Course>({ code: '', title: '', description: '', credits: 3 });

  const load = async () => {
    const { data } = await api.get<Course[]>('/courses');
    setCourses(data);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/courses', form);
    setForm({ code: '', title: '', description: '', credits: 3 });
    await load();
  };

  const remove = async (id?: number) => {
    if (!id) return;
    await api.delete(`/courses/${id}`);
    await load();
  };

  return (
    <div className="vstack" style={{ gap: 16 }}>
      <div className="card vstack">
        <h2>Courses</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Credits</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.title}</td>
                <td>{c.credits}</td>
                <td>
                  <button className="button" onClick={() => remove(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Add Course</h3>
        <form className="vstack" onSubmit={onSubmit}>
          <input className="input" placeholder="Code" value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))} />
          <input className="input" placeholder="Title" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
          <input className="input" placeholder="Description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
          <input className="input" type="number" placeholder="Credits" value={form.credits} onChange={e => setForm(f => ({...f, credits: Number(e.target.value)}))} />
          <button className="button" type="submit">Create</button>
        </form>
      </div>
    </div>
  );
}
