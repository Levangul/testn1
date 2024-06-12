import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { LOGIN_USER } from "../utils/mutations";



const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [login, { data, loading, error }] = useMutation(LOGIN_USER);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: { ...formData } });
      localStorage.setItem("id_token", data.login.token);
      console.log("Login successful:", data);
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
