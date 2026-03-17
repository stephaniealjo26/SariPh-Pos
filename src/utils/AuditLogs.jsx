// src/utils/AuditLogs.jsx

export const LOG_ACTIONS = {
  VOID_ITEM: 'VOID_ITEM',
  CANCEL_TRANSACTION: 'CANCEL_TRANSACTION',
  SALE: 'SALE'
};

export const getAuditLogs = () => {
  const saved = localStorage.getItem('pos_audit_logs');
  return saved ? JSON.parse(saved) : [];
};

export const addAuditLog = (entry) => {
  const logs = getAuditLogs();
  const newLog = {
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    ...entry
  };
  localStorage.setItem('pos_audit_logs', JSON.stringify([newLog, ...logs]));
  window.dispatchEvent(new Event('storage')); // Notifies Dashboard to refresh
};