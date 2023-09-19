import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles.css';

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Make the POST request for login here
    fetch('/userLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, 'userLogin');
        // Pass the data to the onLogin function
        // onLogin(data);
        if (data.status === 'ok') {
           // Store the authentication token in localStorage
           localStorage.setItem('authToken', data.token); // assuming your response has a token field
           onLogin(data);
          // Show the alert for successful login
          alert('Login Successful');
          // Navigate to the home page after successful login
          navigate('/home');
        } else {
          alert('Invalid email or password');
        }
      })
      .catch((error) => {
        console.log('Error occurred during the fetch:', error);
      });
  };

  return (
    <div className='container'>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className='.LoginForm'>
        <input
          type='email'
          name='email'
          placeholder='Email'
          onChange={handleChange}
          className='LoginFormInput'
          required
        />
        <input
          type='password'
          name='password'
          placeholder='Password'
          onChange={handleChange}
          className='LoginFormInput'
          required
        />

        
        <button type='submit' className='loginButton'>Login</button>
      </form>
      <p>
        Don't have an account? <Link to='/signup'>Sign Up</Link>
      </p>
    </div>
  );
};

export default LoginForm;
