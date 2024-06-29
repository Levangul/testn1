import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loginMutation, { loading, error }] = useMutation(LOGIN_USER);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // Create a history object

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Redirect if user is already logged in
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginMutation({ variables: { ...formData } });
      localStorage.setItem("id_token", data.login.token);
      login(data.login.token);
      console.log("Login successful:", data);
      navigate("/"); // Redirect to the homepage
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default Login;