import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';

const CATEGORIES = ["Beverages", "Noodles", "Snacks", "Dairy", "Personal Care", "Household", "General"];

const EMPTY_FORM = { name: '', barcode: '', price: '', stock: '', category: 'General' };

const ProductManagement = () => {
  const { products, addProduct, editProduct, toggleProduct } = useProducts();
  const [modal, setModal]       = useState(null); // 'add' | 'edit' | 'deactivate'
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all' | 'active' | 'inactive'

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search);
      const matchStatus =
        filterActive === 'all' ? true :
        filterActive === 'active' ? p.active : !p.active;
      return matchSearch && matchStatus;
    });
  }, [products, search, filterActive]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModal('add');
  };

  const openEdit = (p) => {
    setSelected(p);
    setForm({ name: p.name, barcode: p.barcode, price: p.price, stock: p.stock, category: p.category });
    setError('');
    setModal('edit');
  };

  const openToggle = (p) => {
    setSelected(p);
    setError('');
    setModal('toggle');
  };

  const closeModal = () => { setModal(null); setSelected(null); setError(''); };

  const handleAdd = () => {
    const result = addProduct(form);
    if (!result.success) { setError(result.message); return; }
    closeModal();
  };

  const handleEdit = () => {
    const result = editProduct(selected.id, form);
    if (!result.success) { setError(result.message); return; }
    closeModal();
  };

  const handleToggle = () => {
    toggleProduct(selected.id);
    closeModal();
  };

  const f = (v) => setForm(prev => ({ ...prev, ...v }));

  const FormFields = () => (
    <>
      {error && <ErrorBox msg={error} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label className="db-label">Product Name</label>
          <input className="db-input" value={form.name}
            onChange={e => f({ name: e.target.value })} placeholder="e.g. Coca-Cola 500ml" />
        </div>

        <div>
          <label className="db-label">Barcode</label>
          <input className="db-input" value={form.barcode}
            onChange={e => f({ barcode: e.target.value })} placeholder="e.g. 4800888117560" />
        </div>

        <div>
          <label className="db-label">Category</label>
          <select className="sp-select" value={form.category}
            onChange={e => f({ category: e.target.value })} style={{ width: '100%', margin: 0 }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="db-label">Price (₱)</label>
          <input className="db-input" type="number" min="0" step="0.01"
            value={form.price} onChange={e => f({ price: e.target.value })} placeholder="0.00" />
        </div>

        <div>
          <label className="db-label">Stock Quantity</label>
          <input className="db-input" type="number" min="0"
            value={form.stock} onChange={e => f({ stock: e.target.value })} placeholder="0" />
        </div>
      </div>
    </>
  );

  const activeCount   = products.filter(p => p.active).length;
  const inactiveCount = products.filter(p => !p.active).length;

  return (
    <div className="dash-body">
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Products', val: products.length, color: 'var(--accent)' },
          { label: 'Active',         val: activeCount,     color: '#22c55e' },
          { label: 'Inactive',       val: inactiveCount,   color: '#ef4444' },
          { label: 'Low Stock (≤5)', val: products.filter(p => p.active && p.stock <= 5).length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius)',
            padding: '12px 16px', border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Product Management</span>
          <button className="btn-add" onClick={openAdd}>+ Add Product</button>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 8, padding: '0 0 12px', alignItems: 'center' }}>
          <input
            className="db-input"
            style={{ flex: 1, margin: 0 }}
            placeholder="Search by name or barcode..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {['all', 'active', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilterActive(f)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                fontWeight: filterActive === f ? 700 : 400,
                background: filterActive === f ? 'var(--accent)' : 'var(--surface)',
                color:      filterActive === f ? '#fff' : 'var(--ink2)',
                border:     filterActive === f ? 'none' : '1px solid var(--border)',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <table className="dash-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Barcode</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--ink3)', padding: 24 }}>
                No products found.
              </td></tr>
            )}
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ opacity: p.active ? 1 : 0.5 }}>
                <td className="mono" style={{ color: 'var(--ink3)' }}>{i + 1}</td>
                <td className="mono" style={{ fontSize: 11 }}>{p.barcode}</td>
                <td className="td-name">{p.name}</td>
                <td style={{ fontSize: 12, color: 'var(--ink2)' }}>{p.category}</td>
                <td style={{ fontWeight: 600 }}>₱{p.price.toFixed(2)}</td>
                <td>
                  <span style={{
                    fontWeight: 600,
                    color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : 'var(--ink1)',
                  }}>
                    {p.stock}
                    {p.stock === 0 && <span style={{ fontSize: 10, marginLeft: 4 }}>OUT</span>}
                    {p.stock > 0 && p.stock <= 5 && <span style={{ fontSize: 10, marginLeft: 4 }}>LOW</span>}
                  </span>
                </td>
                <td>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 99, fontWeight: 600,
                    background: p.active ? '#dcfce7' : '#fee2e2',
                    color:      p.active ? '#166534' : '#991b1b',
                  }}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn color="#2563eb" onClick={() => openEdit(p)}>✏️ Edit</Btn>
                    <Btn color={p.active ? '#dc2626' : '#22c55e'} onClick={() => openToggle(p)}>
                      {p.active ? '🚫 Deactivate' : '✅ Activate'}
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {modal === 'add' && (
        <Modal title="Add New Product" onClose={closeModal}>
          <FormFields />
          <BtnRow primary="Add Product" onPrimary={handleAdd} onCancel={closeModal} />
        </Modal>
      )}

      {/* EDIT MODAL */}
      {modal === 'edit' && selected && (
        <Modal title={`Edit — ${selected.name}`} onClose={closeModal}>
          <FormFields />
          <BtnRow primary="Save Changes" onPrimary={handleEdit} onCancel={closeModal} />
        </Modal>
      )}

      {/* TOGGLE MODAL */}
      {modal === 'toggle' && selected && (
        <Modal title={selected.active ? 'Deactivate Product' : 'Activate Product'} onClose={closeModal}>
          {error && <ErrorBox msg={error} />}
          <p style={{ fontSize: 14, marginBottom: 16 }}>
            {selected.active
              ? <>Are you sure you want to <strong>deactivate</strong> <em>{selected.name}</em>? It will no longer appear during transactions.</>
              : <>Are you sure you want to <strong>reactivate</strong> <em>{selected.name}</em>?</>
            }
          </p>
          <BtnRow
            primary={selected.active ? 'Yes, Deactivate' : 'Yes, Activate'}
            primaryColor={selected.active ? '#dc2626' : '#22c55e'}
            onPrimary={handleToggle}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
};

// ── Reusable sub-components ──────────────────────────────────────────────────
const Btn = ({ color, onClick, children }) => (
  <button onClick={onClick} style={{
    fontSize: 11, padding: '4px 8px', borderRadius: 5,
    border: `1px solid ${color}`, background: 'transparent',
    color, cursor: 'pointer', whiteSpace: 'nowrap',
  }}>{children}</button>
);

const Modal = ({ title, onClose, children }) => (
  <div className="db-overlay">
    <div className="db-modal" style={{ maxWidth: 520, width: '90%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 className="db-modal-title" style={{ margin: 0 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink3)' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const BtnRow = ({ primary, primaryColor, onPrimary, onCancel }) => (
  <div className="db-btn-row" style={{ marginTop: 16 }}>
    <button className="db-btn-primary"
      style={primaryColor ? { background: primaryColor, borderColor: primaryColor } : {}}
      onClick={onPrimary}>{primary}</button>
    <button className="db-btn-secondary" onClick={onCancel}>Cancel</button>
  </div>
);

const ErrorBox = ({ msg }) => (
  <div style={{
    background: 'var(--red-bg,#fff0f0)', color: 'var(--red-text,#c0392b)',
    borderRadius: 6, padding: '8px 12px', fontSize: 12,
    marginBottom: 12, border: '1px solid var(--red-text,#c0392b)',
  }}>{msg}</div>
);

export default ProductManagement;