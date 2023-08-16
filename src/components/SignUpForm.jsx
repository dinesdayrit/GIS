import React, { useState } from 'react';



const SignUpForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
    
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="email" onChange={handleChange} required/>
      <input type="password" name="password" placeholder="password" onChange={handleChange} required/>
      <button type="submit">Sign Up</button>
    </form>
    </div>
  );
};

export default SignUpForm;



