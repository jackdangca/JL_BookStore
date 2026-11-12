// BookList.jsx - Task 1-3: list all books in a grid; ONLY Category / Cost / Retail are editable
import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState(null);      // ISBN of highlighted row
  const [edit, setEdit] = useState({ category: '', cost: '', retail: '' });
  const [message, setMessage] = useState(null);

  const load = () => api.get('/api/books').then(setBooks).catch((e) => setMessage({ ok: false, text: e.message }));
  useEffect(() => { load(); }, []);

  const pickRow = (b) => {
    setSelected(b.ISBN);
    setEdit({
      category: b.CATEGORY || '',
      cost: b.COST ?? '',
      retail: b.RETAIL ?? '',
    });
    setMessage(null);
  };

  const save = async () => {
    if (!selected) return;
    try {
      const res = await api.put(`/api/books/${selected}`, edit);
      setMessage({ ok: true, text: `✅ ${res.message}` });
      await load();
    } catch (err) {
      setMessage({ ok: false, text: `❌ ${err.message}` });
    }
  };

  return (
    <div className="page">
      <h2>🗂️ Book List &amp; Update</h2>
      <p className="page-hint">
        Click a row to select a book. Only <b>Category</b>, <b>Cost</b> and <b>Retail</b> can be edited &mdash;
        saving calls <code>sp_book_update</code> (UPDATE ... WHERE ISBN = selected).
      </p>

      <table className="grid">
        <thead>
          <tr>
            <th></th><th>ISBN</th><th>Title</th><th>Publisher</th><th>Pubdate</th>
            <th>Category</th><th>Cost</th><th>Retail</th><th>Discount</th><th>Profit</th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.ISBN} className={selected === b.ISBN ? 'selected' : ''} onClick={() => pickRow(b)}>
              <td className="radio-cell"><input type="radio" name="sel" checked={selected === b.ISBN} readOnly /></td>
              <td>{b.ISBN}</td><td>{b.TITLE}</td><td>{b.PUBLISHER || '-'}</td>
              <td>{b.PUBDATE ? String(b.PUBDATE).slice(0, 10) : '-'}</td>
              <td>{b.CATEGORY || '-'}</td>
              <td>${b.COST ?? '-'}</td><td>${b.RETAIL ?? '-'}</td>
              <td>{b.DISCOUNT ?? 0}%</td>
              <td className={b.PROFIT >= 0 ? 'profit-pos' : 'profit-neg'}>${b.PROFIT ?? '-'}</td>
            </tr>
          ))}
          {books.length === 0 && <tr><td colSpan={10}>Loading... or no books found.</td></tr>}
        </tbody>
      </table>

      <div className="card edit-panel">
        <h3>✏️ Edit selected book {selected && <code>({selected})</code>}</h3>
        {!selected && <p className="page-hint">Select a row above first.</p>}
        {selected && (
          <>
            <div className="form-inline">
              <label>Category
                <input value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
              </label>
              <label>Cost
                <input type="number" step="0.01" min="0" value={edit.cost}
                       onChange={(e) => setEdit({ ...edit, cost: e.target.value })} />
              </label>
              <label>Retail
                <input type="number" step="0.01" min="0" value={edit.retail}
                       onChange={(e) => setEdit({ ...edit, retail: e.target.value })} />
              </label>
              <button className="btn primary" onClick={save}>Save Update</button>
            </div>
            <p className="page-hint">
              SQL executed: <code>UPDATE JL_BOOKS SET category=:c, cost=:co, retail=:r WHERE ISBN='{selected}'</code>
            </p>
          </>
        )}
        {message && <div className={message.ok ? 'banner ok' : 'banner err'}>{message.text}</div>}
      </div>
    </div>
  );
}
