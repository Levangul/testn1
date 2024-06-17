import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { SIGNUP_USER } from '../utils/mutations';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [signup, { loading, error }] = useMutation(SIGNUP_USER);
  const navigate = useNavigate();
  const { login, isAuthenticated  } = useAuth(); // Access the login function from the auth context
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
      const { data } = await signup({ variables: { ...formData } });
      localStorage.setItem('id_token', data.addUser.token);
      login(data.addUser.token); // Authenticate the user
      console.log('Signup successful:', data);
      navigate('/'); // Redirect to the homepage
    } catch (err) {
      console.error('Error signing up:', err);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
};

export default Signup;