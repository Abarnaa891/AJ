import { FormEvent, useEffect, useState } from 'react';
import { Student, api } from '../lib/api';

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<Pick<Student, 'firstName' | 'lastName' | 'email'>>({
    firstName: '',
    lastName: '',
    email: ''
  });

  const load = async () => {
    const { data } = await api.get<Student[]>('/students');
    setStudents(data);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/students', form);
    setForm({ firstName: '', lastName: '', email: '' });
    await load();
  };

  const remove = async (id: number | undefined) => {
    if (!id) return;
    await api.delete(`/students/${id}`);
    await load();
  };

  return (
    <div className="vstack" style={{ gap: 16 }}>
      <div className="card vstack">
        <h2>Students</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.firstName} {s.lastName}</td>
                <td>{s.email}</td>
                <td><small>{s.createdAt}</small></td>
                <td>
                  <button className="button" onClick={() => remove(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Add Student</h3>
        <form className="vstack" onSubmit={onSubmit}>
          <input className="input" placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))} />
          <input className="input" placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))} />
          <input className="input" placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
          <div className="hstack">
            <button className="button" type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
