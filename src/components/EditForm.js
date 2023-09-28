import React, { useState, useEffect } from 'react';
import styles from './EditForm.module.css';





const EditForm = (props) => {
  const [title, setTitle] = useState('');
  const [titleDate, setTitleDate] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [blkNumber, setBlkNumber] = useState('');
  const [area, setArea] = useState('');
  const [boundary, setBoundary] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [oct, setOct ] = useState('');
  const [octDate, setOctDate] = useState('');
  const [tct, setTct] = useState('');
  const [tctDate, setTctDate] = useState('');
  const [technicalDescription, setTechnicalDescription] = useState('');
  const [technicaldescremarks, setTechnicaldescremarks] = useState('');
  const [status, setStatus] = useState('')
  const [textStatusColor, setTextStatusColor] = useState('');
  const [geojson, setGeoJSON] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const { polygonDetails } = props;
  


  
  useEffect(() => {
    generateGeoJSON();
    polygonStatus();
    setTitle(polygonDetails.title);
    setTitleDate(polygonDetails.titleDate);
    setSurveyNumber(polygonDetails.surveyNumber);
    setLotNumber(polygonDetails.lotNumber);
    setBlkNumber(polygonDetails.blkNumber);
    setArea(polygonDetails.lotArea);
    setBoundary(polygonDetails.boundary);
    setOwnerName(polygonDetails.ownerName);
    setOct(polygonDetails.oct);
    setOctDate(polygonDetails.octDate);
    setTct(polygonDetails.tct);
    setTctDate(polygonDetails.tctDate);
    setTechnicalDescription(polygonDetails.technicalDescription);
    setTechnicaldescremarks(polygonDetails.technicaldescremarks);
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

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("update clicked");

    const formData = {
      title: title,
      surveyNumber: surveyNumber,
      lotNumber: lotNumber,
      blkNumber: blkNumber,
      area: area,
      boundary: boundary,
      ownerName: ownerName,
      oct: oct,
      octDate: octDate,
      tct: tct,
      tctDate: tctDate,
      plusCode: props.plusCode,
      technicalDescription: technicalDescription,
      technicaldescremarks: technicaldescremarks,
      geojson: geojson,
    };

    fetch(`/GisDetail/${polygonDetails.title}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data, "Data Updated");
      if (data.status === "ok") {
        alert("Data Updated");
        window.location.href = "/home";
      } else {
        alert("Something went wrong");
      }
    });
    

  };

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
   
      <form onSubmit={handleUpdate}>

      <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>Title No.:</label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
         </div>
         <div>
         <label>Date:</label>
        <input
        value ={titleDate}
        onChange={(e) => setTitleDate(e.target.value)}
        />
        </div>
        </div>

        <label>Survey Number:</label>
        <input
          type="text"
          name="surveyNumber"
          value={surveyNumber}
          onChange={(e) => setSurveyNumber(e.target.value)}
        />
     <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
       <div>
      <label>Lot Number:</label>
    <input
      type="text"
      name="lotNumber"
      value={lotNumber}
      onChange={(e) => setLotNumber(e.target.value)}
    />
      </div>

       <div>
        <label>Blk No.:</label>
        <input
      type="text"
      name="blkNumber"
      value={blkNumber}
      onChange={(e) => setBlkNumber(e.target.value)}
    
      />
      </div>
      <div>
      <label>Area (sq.m.):</label> 
        <input
          type="text"
          name="area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          required />

      </div>
      </div>


      <label>Boundary:</label>
      <textarea 
        rows={6}
        type="text"
        name="boundary"
        value={boundary}
        onChange={(e) => {
        setBoundary(e.target.value);
        }}
      />
      

      <label>Owner Name</label>
      <input
          type="text"
          name="ownerName"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required />
      

      <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>OCT No.:</label>
        <input
          type="text"
          name="OCT"
          value={oct}
          onChange={(e) => {
            setOct(e.target.value);
          }}
        />
         </div>
         <div>
         <label>Date:</label>
        <input
        value ={octDate}
        onChange={(e) => setOctDate(e.target.value)}
        />
        </div>
        </div>

        <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>Prev TCT No.:</label>
        <input
          type="text"
          name="tct"
          value={tct}
          onChange={(e) => {
            setTct(e.target.value);
          }}
        />
         </div>
         <div>
         <label>Date:</label>
        <input
        value ={tctDate}
        onChange={(e) => setTctDate(e.target.value)}
        />
        </div>
        </div>

      <label>Technnnical Description</label>
      <textarea
          rows={6}
          type="text"
          name="technicalDescription"
          value={technicalDescription}
          onChange={(e) => setTechnicalDescription(e.target.value)}
          required 

          />

      <label>REMARKS:</label>
      <textarea 
          rows={3}
          type="text"
          name="remarks"
          value={technicaldescremarks}
          onChange={(e) => {
            setTechnicaldescremarks(e.target.value);
          }}
        />


        <label>Plus Code:</label>
        <input
          type="text"
          name="plusCode"
          value={props.plusCode}
          readOnly

        />



        {/* <label>Generate GeoJSON Format:</label>
        <textarea
          
          name="geojson"
          rows={6}
          defaultValue={geojson}
          onChange={(e) => setGeoJSON(e.target.value)}
          readOnly
        /> */}
    



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
