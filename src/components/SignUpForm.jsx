import React, { useState } from 'react';



const SignUpForm = () => {
  const token =  localStorage.getItem('authToken');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
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
        window.location.href = "/";
      } else {
        alert("Something went wrong");
      }
    
    })
   
};

  return (
    <div className='container'>
    
    <form onSubmit={handleSubmit} className='.LoginForm'>
    <input  type="name" name="name" placeholder="full Name" onChange={handleChange} className='LoginFormInput' required/>
      <input type="email" name="email" placeholder="email" onChange={handleChange} className='LoginFormInput' required/>
      <input type="password" name="password" placeholder="password" onChange={handleChange} className='LoginFormInput' required/>
      <button type="submit" className='loginButton'>Sign Up</button>
    </form>
    </div>
  );
};

export default SignUpForm;



