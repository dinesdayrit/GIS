import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUpForm from './SignUpForm.jsx';
import LoginForm from './LoginForm.jsx';
import Home from './Home.jsx';

function App() {
  const initialIsLoggedIn = !!localStorage.getItem('authToken');
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    console.log(isLoggedIn);
    if (authToken) {
      setIsLoggedIn(true);
      
    } else {
      setIsLoggedIn(false);
    }
   
  }, []); 

  const handleLogin = (data) => {
    if (data.status === 'ok' && data.token) {
      localStorage.setItem('authToken', data.token);
      setIsLoggedIn(true);
    } else {
      alert('Invalid email or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div>
        <Routes>
          {/* Set the login page as the default landing page */}
          <Route
            path='/'
            element={<LoginForm onLogin={(data) => handleLogin(data)} />}
          />
          <Route path='/signup' element={<SignUpForm />} />
          {/* Use the Route with a custom render function for the home page */}
          <Route
            path='/home'
            element={
              isLoggedIn ? (
                <Home onLogout={handleLogout} />
              ) : (
                // If not logged in, redirect to the login page
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
