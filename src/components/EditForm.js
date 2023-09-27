import React, { useState, useEffect } from 'react';
import styles from './EditForm.module.css';




const EditForm = (props) => {
  const [title, setTitle] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [blkNumber, setBlkNumber] = useState('');
  const [area, setArea] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [status, setStatus] = useState('')
  const [textStatusColor, setTextStatusColor] = useState('')
  const [geojson, setGeoJSON] = useState('');
  const { polygonDetails } = props;
  const [isApproved, setIsApproved] = useState(false);


  useEffect(() => {
    generateGeoJSON();
    polygonStatus();
  }, [props.selectedCoordinates]);


  const generateGeoJSON = () => {
    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [props.selectedCoordinates],
      },
    };

    setGeoJSON(JSON.stringify(feature, null, 2));
  };

  const polygonStatus = () => {
    if(polygonDetails.status === 'APPROVED') {
      setTextStatusColor('blue')
      setStatus('APPROVED');
      setIsApproved(true);
    } else {
      setStatus('For Approval');
      setTextStatusColor('red');
      setIsApproved(false);
    }
  }

  const handleApprove = () => {
    // Update the status in the component state
    setStatus('APPROVED');
    setTextStatusColor('blue');

    // Send a PUT request to update the status in the backend
    fetch(`/approved/${polygonDetails.title}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'APPROVED',
        // Include other fields you want to update if needed
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Handle the response from the server as needed
      })
      .catch((error) => {
        console.error('Error updating status:', error);
        // Handle the error as needed
      });
  };

  return (
    <div className={styles['popup-form-container']}>
   
      <form>
        <label>Title number:</label>
        <input
          type="text"
          name="title"
          defaultValue={polygonDetails.title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />

        <label>Survey Number:</label>
        <input
          type="text"
          name="surveyNumber"
          defaultValue={polygonDetails.surveyNumber}
          onChange={(e) => setSurveyNumber(e.target.value)}
        />
     <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
       <div>
      <label>Lot Number:</label>
    <input
      type="text"
      name="lotNumber"
      defaultValue={polygonDetails.lotNumber}
      onChange={(e) => setLotNumber(e.target.value)}
    />
      </div>

       <div>
        <label>Blk No.:</label>
        <input
      type="text"
      name="blkNumber"
      defaultValue={polygonDetails.blkNumber}
      onChange={(e) => setBlkNumber(e.target.value)}
      />
      </div>
      <div>
      <label>Area (sq.m.):</label> 
        <input
          type="text"
          name="area"
          defaultValue={polygonDetails.lotArea}
          onChange={(e) => setArea(e.target.value)}
          required />

      </div>
      </div>

      <label>Owner Name</label>
      <input
          type="text"
          name="ownerName"
          defaultValue={polygonDetails.ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required />


      <label>Technnnical Description</label>
      <textarea
          rows={6}
          type="text"
          name="technicalDescription"
          defaultValue={polygonDetails.technicalDescription}
          // onChange={(e) => setOwnerName(e.target.value)}
          required />

        <label>Plus Code:</label>
        <input
          type="text"
          name="plusCode"
          value={props.plusCode}
          readOnly

        />

        <label>Generate GeoJSON Format:</label>
        <textarea
          
          name="geojson"
          rows={6}
          defaultValue={geojson}
          onChange={(e) => setGeoJSON(e.target.value)}
          readOnly
        />
    



        <div className={styles['button-wrapper']}>
        <button type="submit">Update</button>
        <button type="button" onClick={props.editOnCancel}>Cancel</button>
        </div>
        
      </form>
      <div style={{display: 'flex', marginTop: '10%'}}>
      <label style={{color: textStatusColor}}>STATUS: {status}</label>
      {!isApproved && ( 
          <button style={{ marginLeft: '20px' }} onClick={handleApprove}>
            APPROVE
          </button>
        )}
        </div>
      
    </div>
  );
};

export default EditForm;
