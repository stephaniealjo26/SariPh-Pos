import React, { useState } from 'react';
import { getAuditLogs } from '../utils/AuditLog.jsx';

const ACTION_COLORS = {
  VOID_ITEM: '#fff3cd',
  CANCEL_TRANSACTION: '#f8d7da',
  POST_VOID: '#f5c6cb',
  REPRINT_RECEIPT: '#d1ecf1',
};

export default function AuditLogs() {
  const logs = getAuditLogs().reverse();
  const [filter, setFilter] = useState('ALL');

  const filtered =
    filter === 'ALL' ? logs : logs.filter((l) => l.action === filter);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>📋 Audit Logs</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'VOID_ITEM', 'CANCEL_TRANSACTION', 'POST_VOID', 'REPRINT_RECEIPT'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              border: '2px solid #000',
              cursor: 'pointer',
              background: filter === f ? '#000' : '#fff',
              color: filter === f ? '#fff' : '#000',
              fontWeight: 'bold',
            }}
          >
            {f.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: '#888' }}>No logs found.</p>
      ) : (
        filtered.map((log) => (
          <div
            key={log.id}
            style={{
              background: ACTION_COLORS[log.action] || '#f9f9f9',
              border: '2px solid #ccc',
              borderRadius: '8px',
              padding: '14px 18px',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <strong>{log.action.replace(/_/g, ' ')}</strong>
              <span style={{ color: '#555', fontSize: '0.9rem' }}>
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <p style={{ marginTop: '4px' }}>
              👤 <strong>{log.performedBy}</strong>
            </p>
            <pre
              style={{
                marginTop: '8px',
                fontSize: '0.85rem',
                background: 'rgba(0,0,0,0.05)',
                padding: '8px',
                borderRadius: '4px',
                overflowX: 'auto',
              }}
            >
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        ))
      )}
    </div>
  );
}