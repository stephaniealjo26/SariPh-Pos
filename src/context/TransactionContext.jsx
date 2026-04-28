import { createContext, useState, useContext, useEffect, useMemo } from "react";

export const TransactionContext = createContext();

export const DISCOUNT_TYPES = {
  NONE:         { label: "None",           rate: 0 },
  SENIOR:       { label: "Senior Citizen", rate: 0.20 },
  PWD:          { label: "PWD",            rate: 0.20 },
  ATHLETE:      { label: "Athlete",        rate: 0.10 },
  SOLO_PARENT:  { label: "Solo Parent",    rate: 0.10 },
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("sariph_transactions");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [auditLog, setAuditLog] = useState(() => {
    try {
      const saved = localStorage.getItem("sariph_audit");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("sariph_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("sariph_audit", JSON.stringify(auditLog));
  }, [auditLog]);

  const addAudit = (entry) => {
    setAuditLog(prev => [{ 
      ...entry, 
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString() 
    }, ...prev]);
  };

  const saveTransaction = (tx) => {
    // Ensure status and createdAt exist
    const finalTx = {
      ...tx,
      status: tx.status || "COMPLETED",
      createdAt: tx.createdAt || new Date().toISOString(),
    };
    setTransactions(prev => [finalTx, ...prev]);
    
    addAudit({
      type: "SALE",
      txId: finalTx.id,
      cashier: finalTx.cashier,
      total: finalTx.total,
      details: `Sale completed — ₱${Number(finalTx.total || 0).toFixed(2)}`,
    });
    return finalTx;
  };

  const cancelTransaction = (txId, cashier) => {
    addAudit({
      type: "CANCEL",
      txId,
      cashier,
      details: "Sale canceled before payment.",
    });
  };

  const logVoidItem = (txId, item, cashier) => {
    addAudit({
      type: "VOID_ITEM",
      txId,
      cashier,
      details: `Void item: ${item?.name || 'Unknown'} x${item?.qty || 0} — ₱${((item?.price || 0) * (item?.qty || 0)).toFixed(2)}`,
    });
  };

  const postVoidTransaction = (txId, reason, approver, cashier) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === txId
        ? { ...tx, status: "VOIDED", voidReason: reason, voidApprover: approver, voidedAt: new Date().toISOString() }
        : tx
      )
    );
    addAudit({
      type: "POST_VOID",
      txId,
      cashier,
      approver,
      details: `Post-void approved by ${approver}. Reason: ${reason}`,
    });
  };

  const markTransactionDone = (txId, cashier) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === txId
        ? { ...tx, status: "MARKED_DONE", markedDoneAt: new Date().toISOString() }
        : tx
      )
    );
    addAudit({
      type: "MARK_DONE",
      txId,
      cashier,
      details: `Transaction marked as done. Reprinting disabled.`,
    });
  };

  const logReprint = (txId, cashier) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === txId
        ? { ...tx, reprints: (tx.reprints || 0) + 1, lastReprintAt: new Date().toISOString() }
        : tx
      )
    );
    addAudit({
      type: "REPRINT",
      txId,
      cashier,
      details: `Receipt reprinted.`,
    });
  };

  // Memoized to prevent unnecessary re-renders
  const lastTransaction = useMemo(() => transactions[0] ?? null, [transactions]);

  // Modified todayStats with heavy safety guards
  const getTodayStats = () => {
    const todayStr = new Date().toDateString();
    
    const todayTx = transactions.filter(tx => {
      if (!tx?.createdAt) return false;
      return new Date(tx.createdAt).toDateString() === todayStr && tx.status === "COMPLETED";
    });

    return {
      count: todayTx.length,
      total: todayTx.reduce((sum, tx) => sum + (Number(tx.total) || 0), 0),
      items: todayTx.reduce((sum, tx) => 
        sum + (tx.items?.reduce((acc, item) => acc + (Number(item.qty) || 0), 0) || 0), 0
      ),
    };
  };

  return (
    <TransactionContext.Provider value={{
      transactions, 
      auditLog,
      saveTransaction, 
      cancelTransaction,
      logVoidItem, 
      postVoidTransaction,
      markTransactionDone,
      logReprint, 
      lastTransaction, 
      todayStats: getTodayStats(), // Return the result of the function
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
};