import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";

const useAuth = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

  const register = async (userInfo) => {
    try {
      const { data } = await api.post("/auth/register", {
        name: userInfo.username, // component sends username
        email: userInfo.email,
        password: userInfo.password,
      });
      console.log("Register success", data);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      toast.success("Registration successful");
      return data;
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      throw error;
    }
  };

  const login = async (userInfo) => {
    try {
      const { data } = await api.post("/auth/login", {
        email: userInfo.email,
        password: userInfo.password,
      });
      console.log("Login success", data);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      toast.success("Login successful");
      return data;
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.info("Logged out");
  };

  return { user, register, login, logout, isAuthenticated: !!user, isAdmin: user?.role === 'ADMIN' };
};

export default useAuth;
