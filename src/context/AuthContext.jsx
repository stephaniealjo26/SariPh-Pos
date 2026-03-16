import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [users, setUsers] = useState([
    { id: 1, username: "admin", password: "admin123", role: "Administrator" },
    { id: 2, username: "cashier1", password: "1234", role: "Cashier" }
  ]);

  const [currentUser, setCurrentUser] = useState(null);

  const login = (username, password) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setCurrentUser(user);
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (newUser) => {
    setUsers([...users, { id: Date.now(), ...newUser }]);
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        login,
        logout,
        addUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

