// AuthorRegister.jsx - Task 2-1: register an author (calls sp_register_author, 3 parameters)
import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function AuthorRegister() {
  const [form, setForm] = useState({ authorid: '', lname: '', fname: '' });
  const [authors, setAuthors] = useState([]);
  const [message, setMessage] = useState(null);

  const load = () => api.get('/api/authors').then(setAuthors).catch(() => {});
  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.post('/api/authors', form);
      setMessage({ ok: true, text: `✅ ${res.message}` });
      setForm({ authorid: '', lname: '', fname: '' });
      load();
    } catch (err) {
      setMessage({ ok: false, text: `❌ ${err.message}` });
    }
  };

  return (
    <div className="page">
      <h2>👤 Register Author</h2>
      <p className="page-hint">Sends Author ID, Last name and First name to <code>sp_register_author</code>.</p>

      <form className="card form" onSubmit={submit}>
        <label>Author ID *
          <input name="authorid" value={form.authorid} onChange={change} required maxLength={6} placeholder="W105" />
        </label>
        <label>Last Name *
          <input name="lname" value={form.lname} onChange={change} required placeholder="Smith" />
        </label>
        <label>First Name *
          <input name="fname" value={form.fname} onChange={change} required placeholder="John" />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn primary">Register Author</button>
          <button type="button" className="btn ghost" onClick={() => setForm({ authorid: '', lname: '', fname: '' })}>Cancel</button>
        </div>
        {message && <div className={message.ok ? 'banner ok' : 'banner err'}>{message.text}</div>}
      </form>

      <h3>Current authors</h3>
      <table className="grid">
        <thead><tr><th>Author ID</th><th>Last Name</th><th>First Name</th><th>Books Assigned</th></tr></thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.AUTHORID}><td>{a.AUTHORID}</td><td>{a.LNAME}</td><td>{a.FNAME}</td><td>{a.BOOKCOUNT}</td></tr>
          ))}
          {authors.length === 0 && <tr><td colSpan={4}>No authors yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
