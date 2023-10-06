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
  // const [technicalDescription, setTechnicalDescription] = useState('');
  // const [technicaldescremarks, setTechnicaldescremarks] = useState('');
  const [status, setStatus] = useState('')
  const [textStatusColor, setTextStatusColor] = useState('');
  const [geojson, setGeoJSON] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const { polygonDetails } = props;
  const [defaultCode, setDefaultCode] = useState('');
  const [pin, setPin] = useState('');
  const [brgycodes, setBrgycodes] = useState([]);
  const [selectedBrgy, setSelectedBrgy] = useState('');
  const [selectedBrgyCode, setSelectedBrgyCode] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedSectionCode, setSelectedSectionCode] = useState('');

useEffect(() => {
  const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
  if (storedUserDetails && storedUserDetails.role === "user") {
    setIsAdmin(false);
   
  }
 
}, []);
  
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
    // setTechnicalDescription(polygonDetails.technicalDescription);
    // setTechnicaldescremarks(polygonDetails.technicaldescremarks);
    console.log('isadmin', isAdmin);
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
      titleDate: titleDate,
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
      technicalDescription: polygonDetails.technicalDescription,
      technicaldescremarks: polygonDetails.technicaldescremarks,
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
    setIsApproved(false);
   

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
        alert('APPROVED');
        console.log('isApproved',isApproved);
        // Handle the response from the server as needed
      })
      .catch((error) => {
        console.error('Error updating status:', error);
        // Handle the error as needed
      });
  };
 
  useEffect(() => {
    // Fetch brgycode data and set it in the brgycodes state
    fetch('/brgycode')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched brgycode:', data);
        setBrgycodes(data);

        const matchingBrgycode = brgycodes.find(
        (targetBrgycode) => targetBrgycode.brgy === selectedBrgy
        );
        console.log('matchingBrgycode', matchingBrgycode);
      
          if (matchingBrgycode) {
            setSelectedBrgyCode(matchingBrgycode.brgycode);
            setSelectedDistrict(matchingBrgycode.admindistrict);
            setSelectedDistrictCode(matchingBrgycode.districtcode);
          } 

          const generatedPin = `172-${selectedDistrictCode}-${selectedBrgyCode}-${selectedSectionCode}-`.trim();
          setDefaultCode(generatedPin);
      })
      .catch((error) => {
        console.error('Error fetching brgycodes:', error);
        alert('Error fetching brgycodes:', error);
      });
     
  }, [selectedBrgy, selectedBrgyCode,selectedBrgyCode , selectedSectionCode]);

  const handleBrgyChange = (e) => {
    const selectedBrgyValue = e.target.value;
    setSelectedBrgy(selectedBrgyValue);
  };
  
  return (
    <div className={styles['popup-form-container']}>
   
      <form onSubmit={handleUpdate}>
      <div style={{ border: 'green solid', padding: '10px' }}>
      <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>Title no.*</label>
        <input
          type="text"
          name="title"
          defaultValue={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          required
        />
         </div>
         <div>
         <label>Date</label>
        <input
        defaultValue ={titleDate}
        onChange={(e) => setTitleDate(e.target.value)}
        />
        </div>
        </div>

        <label>Survey no.*</label>
        <input
          type="text"
          name="surveyNumber"
          defaultValue={surveyNumber}
          onChange={(e) => setSurveyNumber(e.target.value)}
          required
        />
     <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
       <div>
      <label>Lot no.*</label>
    <input
      type="text"
      name="lotNumber"
      defaultValue={lotNumber}
      onChange={(e) => setLotNumber(e.target.value)}
      required
    />
      </div>

       <div>
        <label>Blk no.*</label>
        <input
      type="text"
      name="blkNumber"
      defaultValue={blkNumber}
      onChange={(e) => setBlkNumber(e.target.value)}
      required
      />
      </div>
      <div>
      <label>Area (sq.m.)*</label> 
        <input
          type="text"
          name="area"
          defaultValue={area}
          onChange={(e) => setArea(e.target.value)}
          required />

      </div>
      </div>


      <label>Boundaries*</label>
      <textarea 
        rows={6}
        type="text"
        name="boundary"
        defaultValue={boundary}
        onChange={(e) => {
        setBoundary(e.target.value);
        }}
        required
      />
      

      <label>Owner Name*</label>
      <input
          type="text"
          name="ownerName"
          defaultValue={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required />
      

      <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>OCT No.*</label>
        <input
          type="text"
          name="OCT"
          defaultValue={oct}
          onChange={(e) => {
            setOct(e.target.value);
          }}
        />
         </div>
         <div>
         <label>Date</label>
        <input
        defaultValue ={octDate}
        onChange={(e) => setOctDate(e.target.value)}
        />
        </div>
        </div>

        <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>Prev TCT No.*</label>
        <input
          type="text"
          name="tct"
          defaultValue={tct}
          onChange={(e) => {
            setTct(e.target.value);
          }}
        />
         </div>
         <div>
         <label>Date</label>
        <input
        defaultValue ={tctDate}
        onChange={(e) => setTctDate(e.target.value)}
        />
        </div>
        </div>
        
{/* 
      <label>Technnnical Description*</label>
      <textarea
          rows={6}
          type="text"
          name="technicalDescription"
          defaultValue={technicalDescription}
          onChange={(e) => setTechnicalDescription(e.target.value)}
          required 

          /> */}

      {/* <label>REMARKS</label>
      <textarea 
          rows={3}
          type="text"
          name="remarks"
          defaultValue={technicaldescremarks}
          onChange={(e) => {
            setTechnicaldescremarks(e.target.value);
          }}
        /> */}


        <label>Plus Code*</label>
        <input
          type="text"
          name="plusCode"
          defaultValue={props.plusCode}
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
        </div>
        
      </form>
      <div style={{ border: 'green solid', padding: '10px', position: 'relative', marginTop: '30px' }}>
      <p
        style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          backgroundColor: 'whitesmoke',
          padding: '0 5px',
        }}
      >
      Assign PIN
      </p>
       <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>    
      <div>
        <p>Brgy*</p>
        <select
        name='brgy'
        onChange={handleBrgyChange}
         value={selectedBrgy}
    >
      {brgycodes.map((targetBrgycode) => (
        <option key={targetBrgycode.id} value={targetBrgycode.brgy}>
          {targetBrgycode.brgy}
        </option>
      ))}
    </select>
      </div>

      <div>
        <p>District*</p>
        <input 
          name='district'
          defaultValue={selectedDistrict}
        />
      </div>
      <div>
        <p>Section*</p>
        <input 
          name='section'
          onChange={(e) => setSelectedSectionCode(e.target.value)}
          
        />
      </div>
      
      </div> 

     
      <input 
          name='pin' 
          defaultValue={defaultCode} 
          // onChange={(e) => {
          //   setPin(e.target.value);
          // }}
      />
       <div className={styles['button-wrapper']}>
        <button type="submit" style={{width: "40%"}}>SAVE</button>
        </div>
    </div>
  
      <div style={{display: 'flex', marginTop: '5%'}}>
      <label style={{color: textStatusColor}}>STATUS: {status}</label>
      {!isApproved && isAdmin &&( 
          <button style={{ marginLeft: '20px' }} onClick={handleApprove}>
            APPROVE
          </button>
        )}
        </div>
     
      
    </div>
  );
};

export default EditForm;
