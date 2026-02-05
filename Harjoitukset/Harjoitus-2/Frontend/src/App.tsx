import { useState, useEffect } from 'react';

const API = '/api/task';

export default function App() {
  const [lst, setLst] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [t, setT] = useState('');
  const [dc, setDc] = useState('');
  const [st, setSt] = useState('Open');
  const [pr, setPr] = useState(1);
  const [cur, setCur] = useState<number | null>(null);
  const [t2, setT2] = useState('');
  const [dc2, setDc2] = useState('');
  const [st2, setSt2] = useState('Open');
  const [pr2, setPr2] = useState(1);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((d) => {
        setLst(d);
        setLoading(false);
      })
      .catch(() => {
        setMsg('Failed to load');
        setLoading(false);
      });
  }, []);

  function x() {
    setLoading(true);
    fetch(API)
      .then((r) => r.json())
      .then((d) => {
        setLst(d);
        setLoading(false);
      })
      .catch(() => setMsg('Failed to load'));
  }

  function doIt(e: React.FormEvent) {
    e.preventDefault();
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: t,
        description: dc,
        status: st,
        priority: pr,
      }),
    })
      .then((r) => {
        if (!r.ok)
          return r.text().then((t) => {
            throw new Error(t);
          });
        return r.json();
      })
      .then(() => {
        setT('');
        setDc('');
        setSt('Open');
        setPr(1);
        x();
      })
      .catch((e) => setMsg(e.message || 'Error'));
  }

  function del(id: number) {
    fetch(API + '/' + id, { method: 'DELETE' })
      .then(() => x())
      .catch(() => setMsg('Delete failed'));
  }

  function edit(item: any) {
    setCur(item.id);
    setT2(item.title);
    setDc2(item.description || '');
    setSt2(item.status);
    setPr2(item.priority);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (cur === null) return;
    fetch(API + '/' + cur, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: t2,
        description: dc2,
        status: st2,
        priority: pr2,
      }),
    })
      .then((r) => {
        if (!r.ok)
          return r.text().then((t) => {
            throw new Error(t);
          });
        return r.json();
      })
      .then(() => {
        setCur(null);
        x();
      })
      .catch((e) => setMsg(e.message || 'Error'));
  }

  if (loading && lst.length === 0) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 16 }}>Tasks</h1>
      {msg && <div style={{ color: 'red', marginBottom: 10 }}>{msg}</div>}

      <form onSubmit={doIt} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 8 }}>
          <input
            value={t}
            onChange={(e) => setT(e.target.value)}
            placeholder="Title"
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input
            value={dc}
            onChange={(e) => setDc(e.target.value)}
            placeholder="Description"
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <select
            value={st}
            onChange={(e) => setSt(e.target.value)}
            style={{ padding: 8 }}
          >
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <input
            type="number"
            min={1}
            max={5}
            value={pr}
            onChange={(e) => setPr(Number(e.target.value))}
            style={{ marginLeft: 8, padding: 8, width: 60 }}
          />
        </div>
        <button type="submit" style={{ padding: 8, cursor: 'pointer' }}>
          Add Task
        </button>
      </form>

      <div>
        {lst.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #ccc',
              padding: 12,
              marginBottom: 8,
              borderRadius: 4,
            }}
          >
            {cur === item.id ? (
              <form onSubmit={save}>
                <input
                  value={t2}
                  onChange={(e) => setT2(e.target.value)}
                  style={{ width: '100%', padding: 8, marginBottom: 8 }}
                />
                <input
                  value={dc2}
                  onChange={(e) => setDc2(e.target.value)}
                  style={{ width: '100%', padding: 8, marginBottom: 8 }}
                />
                <select
                  value={st2}
                  onChange={(e) => setSt2(e.target.value)}
                  style={{ padding: 8, marginRight: 8 }}
                >
                  <option value="Open">Open</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={pr2}
                  onChange={(e) => setPr2(Number(e.target.value))}
                  style={{ padding: 8, width: 60, marginRight: 8 }}
                />
                <button type="submit" style={{ padding: 8, marginRight: 8 }}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setCur(null)}
                  style={{ padding: 8 }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                {item.description && (
                  <div style={{ color: '#666', fontSize: 14 }}>
                    {item.description}
                  </div>
                )}
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  {item.status} | Priority: {item.priority}
                </div>
                <button
                  onClick={() => edit(item)}
                  style={{ marginRight: 8, marginTop: 8, padding: 6 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => del(item.id)}
                  style={{ marginTop: 8, padding: 6 }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
