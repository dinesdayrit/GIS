import React, { useState } from 'react';
import styles from './PopupForm.module.css';

const PopupForm = (props) => {
  const [title, setTitle] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
 

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      title,
      surveyNumber,
      lotNumber,
      ownerName,
      coordinates: props.selectedCoordinates,
    };

    fetch('/GisDetail', {
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
        window.location.href = "/home";
      } else {
        alert("Something went wrong");
      }
    });
  };

  return (
    <div className={styles['popup-form-container']}>
      <form onSubmit={handleSubmit}>
        <label>Title number:</label>
        <input
          type="text"
          name="title"
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />

        <label>Survey Number:</label>
        <input
          type="text"
          name="surveyNumber"
          onChange={(e) => setSurveyNumber(e.target.value)}
        />

        <label>Lot Number:</label>
        <input
          type="text"
          name="lotNumber"
          onChange={(e) => setLotNumber(e.target.value)}
        />

        <label>Owner:</label>
        <input
          type="text"
          name="ownerName"
          onChange={(e) => setOwnerName(e.target.value)}
        />

        <label>Coordinates:</label>
        <textarea
          name="coordinates"
          rows={props.selectedCoordinates.length + 1} 
          value={JSON.stringify(props.selectedCoordinates, null, 2)}
          readOnly
          
        />
        <div>
        <button type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default PopupForm;
