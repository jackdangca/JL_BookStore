// BookRegister.jsx - Task 1-2: Book registration form (calls sp_Book_register)
import { useEffect, useState } from 'react';
import { api } from '../api.js';

const emptyForm = {
  isbn: '', title: '', pubdate: '', pubid: '', cost: '', retail: '',
  discount: '', category: '',
};

export default function BookRegister() {
  const [form, setForm] = useState(emptyForm);
  const [publishers, setPublishers] = useState([]);
  const [recent, setRecent] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/api/books/publishers').then(setPublishers).catch(() => {});
    api.get('/api/books').then(setRecent).catch(() => {});
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.post('/api/books', form);
      setMessage({ ok: true, text: `✅ ${res.message}` });
      setForm(emptyForm);
      api.get('/api/books').then(setRecent).catch(() => {});
    } catch (err) {
      setMessage({ ok: false, text: `❌ ${err.message}` });
    }
  };

  return (
    <div className="page">
      <h2>📖 Book Registration Form</h2>
      <p className="page-hint">All 8 values are sent to stored procedure <code>sp_Book_register</code>.</p>

      <form className="card form" onSubmit={submit}>
        <label>ISBN *
          <input name="isbn" value={form.isbn} onChange={change} required maxLength={13} placeholder="1059831198" />
        </label>
        <label>Title *
          <input name="title" value={form.title} onChange={change} required placeholder="Book title" />
        </label>
        <label>Pubdate
          <input type="date" name="pubdate" value={form.pubdate} onChange={change} />
        </label>
        <label>Publisher (PubID)
          <select name="pubid" value={form.pubid} onChange={change}>
            <option value="">-- choose publisher --</option>
            {publishers.map((p) => (
              <option key={p.PUBID} value={p.PUBID}>{p.PUBID} - {p.NAME}</option>
            ))}
          </select>
        </label>
        <label>Cost
          <input type="number" step="0.01" min="0" name="cost" value={form.cost} onChange={change} placeholder="19.99" />
        </label>
        <label>Retail price
          <input type="number" step="0.01" min="0" name="retail" value={form.retail} onChange={change} placeholder="34.50" />
        </label>
        <label>Discount (%)
          <input type="number" step="0.01" min="0" max="100" name="discount" value={form.discount} onChange={change} placeholder="0" />
        </label>
        <label>Category
          <select name="category" value={form.category} onChange={change}>
            <option value="">-- choose category --</option>
            {['COMPUTER','COOKING','CHILDREN','FAMILY LIFE','LITERATURE','SELF HELP','BUSINESS','HISTORY','SCIENCE'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <div className="form-actions">
          <button type="submit" className="btn primary">Register</button>
          <button type="button" className="btn ghost" onClick={() => setForm(emptyForm)}>Cancel</button>
        </div>

        {message && <div className={message.ok ? 'banner ok' : 'banner err'}>{message.text}</div>}
      </form>

      <h3>Recently registered books</h3>
      <table className="grid">
        <thead>
          <tr><th>ISBN</th><th>Title</th><th>Pubdate</th><th>Publisher</th><th>Cost</th><th>Retail</th><th>Category</th></tr>
        </thead>
        <tbody>
          {recent.slice(0, 8).map((b) => (
            <tr key={b.ISBN}>
              <td>{b.ISBN}</td><td>{b.TITLE}</td>
              <td>{b.PUBDATE ? String(b.PUBDATE).slice(0, 10) : '-'}</td>
              <td>{b.PUBLISHER || '-'}</td>
              <td>${b.COST ?? '-'}</td><td>${b.RETAIL ?? '-'}</td><td>{b.CATEGORY || '-'}</td>
            </tr>
          ))}
          {recent.length === 0 && <tr><td colSpan={7}>No books yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
