import React from "react";
import { useAuth } from "../context/AuthContext";
import "../index.css";

const products = [
  { name: "Notebook", price: 25, stock: 50, status: "Active" },
  { name: "Ballpen", price: 12, stock: 100, status: "Active" },
  { name: "Cooking Oil", price: 55, stock: 15, status: "Active" },
  { name: "Sari-Sari Bread", price: 15, stock: 0, status: "Inactive" },
];

const auditLogs = [
  {
    time: "17:45 PM",
    user: "Stephanie",
    action: "Void Item #2",
    reason: "Customer changed mind",
  },
  {
    time: "18:10 PM",
    user: "Renz",
    action: "Reprint Receipt #88",
    reason: "Printer jammed",
  },
];

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>

      {/* User Info */}
      <div className="user-info">
        <div className="user-avatar">{currentUser?.username?.[0]?.toUpperCase()}</div>
        <div className="user-details">
          <strong>{currentUser?.username}</strong>
          <span>Role: {currentUser?.role}</span>
        </div>
      </div>

      {/* Product Management */}
      <div className="product-section">
        <div className="section-header">
          <h2>Product Management</h2>
          <button className="add-product-btn">+ Add New Product</button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, index) => (
                <tr key={index}>
                  <td>{prod.name}</td>
                  <td>₱{prod.price.toFixed(2)}</td>
                  <td>{prod.stock} units</td>
                  <td>
                    <span className={prod.status === "Active" ? "status-active" : "status-inactive"}>
                      {prod.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn-edit">Edit</button>
                      {prod.status === "Active" ? (
                        <button className="btn-deactivate">Deactivate</button>
                      ) : (
                        <button className="btn-activate">Activate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supervisor Audit Logs */}
      <div className="audit-logs">
        <div className="section-header">
          <h2>Supervisor Audit Logs</h2>
        </div>
        <p style={{ color: "var(--muted)", fontSize: ".875rem", marginBottom: "16px" }}>
          Tracking all sensitive system activities — Voids, Reprints, Status Changes.
        </p>
        {auditLogs.map((log, index) => (
          <div className="audit-entry" key={index}>
            <div className="audit-icon">📋</div>
            <div className="audit-body">
              <div className="audit-time">{log.time} · {log.user}</div>
              <div className="audit-action">{log.action}</div>
              <div className="audit-reason">Reason: {log.reason}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;