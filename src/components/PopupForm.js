import React, { useState } from 'react';
import styles from './PopupForm.module.css';

const PopupForm = ({ coordinates, area, onSubmit  }) => {
  const [title, setTitle] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [lotNumber, setlotNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, surveyNumber, lotNumber, ownerName });
  };

  return (
    <div className={styles['popup-form-container']}>
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Title number:</label>
      <input
        type="text"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <label htmlFor="surveyNumber">Survey Number:</label>
      <input
        type="text"
        id="surveyNumber"
        value={surveyNumber}
        onChange={(e) => setSurveyNumber(e.target.value)}
        required
      />
            <label htmlFor="lotNumber">Lot Number:</label>
      <input
        type="text"
        id="lotNumber"
        value={lotNumber}
        onChange={(e) => setSurveyNumber(e.target.value)}
        required
      />
            <label htmlFor="ownerName">Owner:</label>
      <input
        type="text"
        id="ownerName"
        value={ownerName}
        onChange={(e) => setSurveyNumber(e.target.value)}
        required
      />
        {coordinates && (
        <p className={styles.coordinates}>Coordinates: {JSON.stringify(coordinates)}</p>
      )}
      <button type="submit">Save</button>
    </form>


    </div>
  );
};

export default PopupForm;
