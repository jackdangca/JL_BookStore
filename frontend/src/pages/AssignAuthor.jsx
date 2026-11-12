// AssignAuthor.jsx - Task 2-2: pick one ISBN and one Author ID (dropdowns) and assign
import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function AssignAuthor() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState({ isbn: '', authorid: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get('/api/books').then(setBooks).catch(() => {});
    api.get('/api/authors').then(setAuthors).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.post('/api/authors/assign', form);
      setMessage({ ok: true, text: `✅ ${res.message}` });
      setForm({ isbn: '', authorid: '' });
    } catch (err) {
      setMessage({ ok: false, text: `❌ ${err.message}` });
    }
  };

  const selectedBook = books.find((b) => b.ISBN === form.isbn);
  const selectedAuthor = authors.find((a) => a.AUTHORID === form.authorid);

  return (
    <div className="page">
      <h2>🔗 Assign Author ID to Book</h2>
      <p className="page-hint">Inserts into <code>JL_BOOK_AUTHOR</code> via <code>sp_assign_author</code> (with COMMIT).</p>

      <form className="card form" onSubmit={submit}>
        <label>Please choose Book (ISBN)
          <select name="isbn" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required>
            <option value="">-- select a book --</option>
            {books.map((b) => (
              <option key={b.ISBN} value={b.ISBN}>{b.ISBN} — {b.TITLE}</option>
            ))}
          </select>
        </label>

        <label>Please choose Author ID
          <select name="authorid" value={form.authorid} onChange={(e) => setForm({ ...form, authorid: e.target.value })} required>
            <option value="">-- select an author --</option>
            {authors.map((a) => (
              <option key={a.AUTHORID} value={a.AUTHORID}>
                {a.AUTHORID} — {a.FNAME} {a.LNAME}
              </option>
            ))}
          </select>
        </label>

        <div className="preview-box">
          {selectedBook && <p>📖 Book: <b>{selectedBook.TITLE}</b> ({selectedBook.PUBLISHER || 'no publisher'})</p>}
          {selectedAuthor && <p>✍️ Author: <b>{selectedAuthor.FNAME} {selectedAuthor.LNAME}</b></p>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn primary">Assign</button>
        </div>
        {message && <div className={message.ok ? 'banner ok' : 'banner err'}>{message.text}</div>}
      </form>

      {form.isbn && <AuthorListForBook isbn={form.isbn} />}
    </div>
  );
}

function AuthorListForBook({ isbn }) {
  const [list, setList] = useState([]);
  useEffect(() => {
    api.get(`/api/books/${isbn}/authors`).then(setList).catch(() => {});
  }, [isbn]);

  return (
    <div className="card">
      <h3>Authors currently assigned to {isbn}</h3>
      {list.length === 0
        ? <p className="page-hint">No authors assigned yet.</p>
        : <ul className="chip-list">{list.map((a) => (
            <li key={a.AUTHORID}>{a.AUTHORID} — {a.FNAME} {a.LNAME}</li>
          ))}</ul>}
    </div>
  );
}
