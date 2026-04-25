export const LOG_ACTIONS = {
  VOID_ITEM: 'VOID_ITEM',
  CANCEL_TRANSACTION: 'CANCEL_TRANSACTION',
  POST_VOID: 'POST_VOID',
  REPRINT_RECEIPT: 'REPRINT_RECEIPT',
};

export function addAuditLog({ action, performedBy, details }) {
  const logs = getAuditLogs();
  const entry = {
    id: Date.now(),
    action,
    performedBy,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.push(entry);
  localStorage.setItem('auditLogs', JSON.stringify(logs));
  return entry;
}

export function getAuditLogs() {
  try {
    return JSON.parse(localStorage.getItem('auditLogs')) || [];
  } catch {
    return [];
  }
}