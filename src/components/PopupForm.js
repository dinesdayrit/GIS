import React, { useState, useEffect } from 'react';
import styles from './PopupForm.module.css';

const PopupForm = (props) => {
  const [title, setTitle] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [geojson, setGeoJSON] = useState('');


  useEffect(() => {
    generateGeoJSON();
  }, [title, surveyNumber, lotNumber, ownerName, props.selectedCoordinates]);


  const generateGeoJSON = () => {
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [props.selectedCoordinates],
      },
      properties: {
        title: title,
        surveyNumber: surveyNumber,
        lotNumber: lotNumber,
        ownerName: ownerName,
      },
    };

    setGeoJSON(JSON.stringify(feature, null, 2));
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      geojson: geojson,
      
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
      console.log(data, "New Data Saved");
      if (data.status === "ok") {
        alert("New Data Saved");
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


        <label>Generate GeoJSON Format:</label>
        <textarea
          name="geojson"
          rows={6}
          value={geojson}
          onChange={(e) => setGeoJSON(e.target.value)}
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
