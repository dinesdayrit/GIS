import React, { useState } from 'react';
import styles from './SignUpForm.module.css';



const SignUpForm = () => {
  const token =  localStorage.getItem('authToken');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log(formData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Make the POST request here
    fetch('/userDetail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data, "userRegister");
      if (data.status === "ok") {
        alert("Registration Successful");
      } else {
        alert("Something went wrong");
      }
    
    })
   
};

  return (
    <div className={styles['popup-form-container']}>
    <label style={{textAlign: "center", color: '#3e8e41', fontSize: '18px'}}>Create an Account</label>
    <form onSubmit={handleSubmit} className='.LoginForm'>
    <label style={{color: '#3e8e41'}}>User Type: </label>
      <select id="" name="role" onChange={handleChange} value={formData.role} required>
      <option></option>
      <option value="admin">Admin</option>
      <option value="user">User</option>
      </select>
    <input  type="name" name="name" placeholder="Name" onChange={handleChange} className='LoginFormInput' required/>
      <input type="email" name="email" placeholder="Email" onChange={handleChange} className='LoginFormInput' required/>
      <input type="password" name="password" placeholder="Password" onChange={handleChange} className='LoginFormInput' required/>
      <button type="submit" className=''>Create Account</button>
    </form>
    </div>
  );
};

export default SignUpForm;



