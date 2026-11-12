// CustomerUpdate.jsx - Task 3-2: pick a customer, update Address / City / State / Region / Email
import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function CustomerUpdate() {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ address: '', city: '', state: '', region: '', email: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => { api.get('/api/customers').then(setCustomers).catch(() => {}); }, []);

  const pick = async (id) => {
    setSelectedId(id);
    setMessage(null);
    if (!id) return;
    try {
      const c = await api.get(`/api/customers/${id}`);
      setForm({
        address: c.ADDRESS || '', city: c.CITY || '', state: c.STATE || '',
        region: c.REGION || '', email: c.EMAIL || '',
      });
    } catch (err) {
      setMessage({ ok: false, text: err.message });
    }
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await api.put(`/api/customers/${selectedId}`, form);
      setMessage({ ok: true, text: `✅ ${res.message}` });
    } catch (err) {
      setMessage({ ok: false, text: `❌ ${err.message}` });
    }
  };

  const selected = customers.find((c) => String(c.CUSTOMERNUMBER) === String(selectedId));

  return (
    <div className="page">
      <h2>✏️ Update Customer Information</h2>
      <p className="page-hint">
        Select a customer, then update <b>Address / City / State / Region / Email</b>.
        Saving calls <code>sp_update_customer</code>.
      </p>

      <form className="card form" onSubmit={save}>
        <label>Customer
          <select value={selectedId} onChange={(e) => pick(e.target.value)} required>
            <option value="">-- select a customer --</option>
            {customers.map((c) => (
              <option key={c.CUSTOMERNUMBER} value={c.CUSTOMERNUMBER}>
                {c.CUSTOMERNUMBER} — {c.FIRSTNAME || ''} {c.LASTNAME} ({c.CITY || 'n/a'}, {c.STATE || 'n/a'})
              </option>
            ))}
          </select>
        </label>

        {selected && (
          <p className="page-hint">
            Current record: {selected.ADDRESS || 'no address'}, {selected.CITY || 'n/a'} {selected.STATE || ''}
            &nbsp;| Email: {selected.EMAIL || 'n/a'} | Region: {selected.REGION || 'n/a'}
          </p>
        )}

        {selectedId && (
          <>
            <label>Address
              <input name="address" value={form.address} onChange={change} />
            </label>
            <div className="form-row">
              <label>City
                <input name="city" value={form.city} onChange={change} />
              </label>
              <label>State
                <input name="state" value={form.state} onChange={change} maxLength={2} />
              </label>
            </div>
            <div className="form-row">
              <label>Region
                <select name="region" value={form.region} onChange={change}>
                  <option value="">-- keep current --</option>
                  {['N','S','E','W','M'].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label>Email
                <input type="email" name="email" value={form.email} onChange={change} />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn primary">Save Update</button>
            </div>
          </>
        )}
        {message && <div className={message.ok ? 'banner ok' : 'banner err'}>{message.text}</div>}
      </form>
    </div>
  );
}
