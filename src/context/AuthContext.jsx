import { createContext, useState, useContext, useEffect } from "react";

export const AuthContext = createContext();

const ROLES = ['Administrator', 'Manager', 'Cashier', 'Stock Clerk', 'User'];

const DEFAULT_USERS = [
  { id: 1, username: "admin",      password: "admin123",  role: "Administrator" },
  { id: 2, username: "manager1",   password: "manager123",role: "Manager"       },
  { id: 3, username: "cashier1",   password: "cash1234",  role: "Cashier"       },
  { id: 4, username: "stock1",     password: "stock1234", role: "Stock Clerk"   },
  { id: 5, username: "user1",      password: "user1234",  role: "User"          },
];

export const ROLE_HOME = {
  Administrator: '/dashboard',
  Manager:       '/dashboard',
  Cashier:       '/pos',
  'Stock Clerk': '/pos',
  User:          '/shop',   // ✅ Users go to /shop, not /pos
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('sariph_users');
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch { return DEFAULT_USERS; }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sariph_session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem('sariph_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sariph_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sariph_session');
    }
  }, [currentUser]);

  const login = (username, password) => {
    const trimmed = username.trim();
    const user = users.find(
      (u) => u.username === trimmed && u.password === password
    );
    if (!user) return { success: false, message: 'Invalid username or password.' };
    const { password: _pw, ...safeUser } = user;
    setCurrentUser(safeUser);
    return { success: true, message: '', role: user.role };
  };

  const logout = () => setCurrentUser(null);

  const addUser = (newUser) => {
    const trimmed = newUser.username.trim();
    if (users.find(u => u.username.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, message: `Username "${trimmed}" already exists.` };
    }
    const user = { id: Date.now(), ...newUser, username: trimmed };
    setUsers(prev => [...prev, user]);
    return { success: true, message: '' };
  };

  const editUser = (id, updates) => {
    const trimmed = updates.username?.trim();
    if (trimmed && users.find(u => u.username.toLowerCase() === trimmed.toLowerCase() && u.id !== id)) {
      return { success: false, message: `Username "${trimmed}" already exists.` };
    }
    setUsers(prev =>
      prev.map(u => u.id === id ? { ...u, ...updates, username: trimmed ?? u.username } : u)
    );
    if (currentUser?.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates, username: trimmed ?? prev.username }));
    }
    return { success: true, message: '' };
  };

  const deleteUser = (id) => {
    if (currentUser?.id === id) {
      return { success: false, message: "You cannot delete your own account." };
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    return { success: true, message: '' };
  };

  const hasRole = (...roles) => roles.includes(currentUser?.role);
  const isAdmin   = () => hasRole('Administrator');
  const isManager = () => hasRole('Administrator', 'Manager');

  return (
    <AuthContext.Provider value={{
      users, currentUser,
      login, logout,
      addUser, editUser, deleteUser,
      hasRole, isAdmin, isManager,
      ROLES,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);