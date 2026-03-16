import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // PRODUCT DATA
  const [products, setProducts] = useState([
    { id: 1, name: 'Notebook', price: 25, stock: 50, status: 'Active' },
    { id: 2, name: 'Ballpen', price: 12, stock: 100, status: 'Active' },
    { id: 3, name: 'Cooking Oil', price: 55, stock: 15, status: 'Active' },
    { id: 4, name: 'Sari-Sari Bread', price: 15, stock: 0, status: 'Inactive' }
  ]);

  // TOGGLE PRODUCT STATUS
  const toggleProductStatus = (id) => {
    setProducts(products.map(product =>
      product.id === id
        ? { ...product, status: product.status === 'Active' ? 'Inactive' : 'Active' }
        : product
    ));
  };

  // LOGOUT
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // AUDIT LOGS
  const auditLogs = [
    { id: 101, user: 'Stephanie', action: 'Void Item #2', reason: 'Customer changed mind', time: '17:45 PM' },
    { id: 102, user: 'Renz', action: 'Reprint Receipt #88', reason: 'Printer jammed', time: '18:10 PM' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

      {/* USER INFO */}
      <div className="card">
        <h2>Admin Dashboard</h2>
        <p><strong>User:</strong> {currentUser?.username}</p>
        <p><strong>Role:</strong> {currentUser?.role}</p>

        <button
          className="btn"
          style={{ marginTop: '10px', background: '#000', color: '#fff' }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>


      {/* PRODUCT MANAGEMENT */}
      <div className="card">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Product Management</h2>

          <button
            className="btn btn-dark"
            onClick={() => alert("Add Product Modal Placeholder")}
          >
            + Add New Product
          </button>
        </div>

        <table style={{ marginTop: '20px', width: '100%' }}>

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

            {products.map(product => (

              <tr
                key={product.id}
                style={{
                  borderBottom: '1px solid #ddd',
                  opacity: product.status === 'Inactive' ? 0.5 : 1
                }}
              >

                <td>{product.name}</td>

                <td>₱{product.price.toFixed(2)}</td>

                <td>{product.stock} units</td>

                <td
                  style={{
                    fontWeight: 'bold',
                    color: product.status === 'Active' ? 'green' : 'red'
                  }}
                >
                  {product.status}
                </td>

                <td>

                  <button
                    className="btn"
                    style={{ fontSize: '12px', marginRight: '5px' }}
                  >
                    Edit
                  </button>

                  <button
                    className="btn"
                    style={{
                      fontSize: '12px',
                      color: product.status === 'Active' ? 'red' : 'black'
                    }}
                    onClick={() => toggleProductStatus(product.id)}
                  >
                    {product.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* AUDIT LOGS */}
      <div className="card" style={{ background: '#f9f9f9', borderStyle: 'dashed' }}>

        <h3>Supervisor Audit Logs</h3>

        <p style={{ fontSize: '13px', marginBottom: '15px' }}>
          Tracking all sensitive system activities (Voids, Reprints, Status Changes).
        </p>

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>

          {auditLogs.map(log => (

            <div
              key={log.id}
              style={{
                padding: '10px',
                borderLeft: '4px solid #000',
                background: '#fff',
                marginBottom: '10px',
                fontSize: '14px'
              }}
            >

              <strong>[{log.time}]</strong> {log.user}: <em>{log.action}</em>

              <br />

              <small>Reason: {log.reason}</small>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;