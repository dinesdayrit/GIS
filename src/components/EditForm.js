import React, { useState, useEffect } from 'react';
import styles from './EditForm.module.css';




const EditForm = (props) => {
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


  return (
    <div className={styles['popup-form-container']}>
    
      <form>
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
        styles={{width: '25%'}}
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
        <button type="submit">Update</button>
        
        </div>
      </form>
      <button type="button" onClick={props.editOnCancel}>Cancel</button>
    </div>
  );
};

export default EditForm;
