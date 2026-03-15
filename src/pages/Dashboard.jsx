import React, { useState } from 'react';

const Dashboard = () => {
  // 1. Initial Product Data (Administrator Story)
  const [products, setProducts] = useState([
    { id: 1, name: 'Notebook', price: 25, stock: 50, status: 'Active' },
    { id: 2, name: 'Ballpen', price: 12, stock: 100, status: 'Active' },
    { id: 3, name: 'Cooking Oil', price: 55, stock: 15, status: 'Active' },
    { id: 4, name: 'Sari-Sari Bread', price: 15, stock: 0, status: 'Inactive' }
  ]);

  // 2. Logic to Deactivate/Activate Products
  const toggleProductStatus = (id) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p
    ));
  };

  // 3. Simple Audit Log (Supervisor Story)
  const auditLogs = [
    { id: 101, user: 'Stephanie', action: 'Void Item #2', reason: 'Customer changed mind', time: '17:45 PM' },
    { id: 102, user: 'Renz', action: 'Reprint Receipt #88', reason: 'Printer jammed', time: '18:10 PM' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* SECTION 1: PRODUCT MANAGEMENT */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Product Management</h2>
          <button className="btn btn-dark" onClick={() => alert("Add Product Modal Placeholder")}>+ Add New Product</button>
        </div>
        
        <table style={{ marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#000', color: '#fff' }}>
              <th>Product Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #ddd', opacity: p.status === 'Inactive' ? 0.5 : 1 }}>
                <td>{p.name}</td>
                <td>₱{p.price.toFixed(2)}</td>
                <td>{p.stock} units</td>
                <td style={{ fontWeight: 'bold', color: p.status === 'Active' ? 'green' : 'red' }}>
                  {p.status}
                </td>
                <td>
                  <button className="btn" style={{ fontSize: '12px', marginRight: '5px' }}>Edit</button>
                  <button 
                    className="btn" 
                    style={{ fontSize: '12px', color: p.status === 'Active' ? 'red' : 'black' }}
                    onClick={() => toggleProductStatus(p.id)}
                  >
                    {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION 2: AUDIT LOGS (Supervisor Story) */}
      <div className="card" style={{ background: '#f9f9f9', borderStyle: 'dashed' }}>
        <h3>Supervisor Audit Logs</h3>
        <p style={{ fontSize: '13px', marginBottom: '15px' }}>Tracking all sensitive system activities (Voids, Reprints, Status Changes).</p>
        
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {auditLogs.map(log => (
            <div key={log.id} style={{ padding: '10px', borderLeft: '4px solid #000', background: '#fff', marginBottom: '10px', fontSize: '14px' }}>
              <strong>[{log.time}]</strong> {log.user}: <em>{log.action}</em> - <small>Reason: {log.reason}</small>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;