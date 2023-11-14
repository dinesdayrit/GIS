import React, { useState, useEffect } from 'react';
import styles from './EditForm.module.css';
// import DatePicker from 'react-datepicker';
import axios from 'axios';

const EditForm = (props) => { 
  const [id, setId] = useState('');
  const [titleSearch, setTitleSearch] = useState ('');
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
  const [titleSearchData, setTitleSearchData] = useState([]);
  const token =  localStorage.getItem('authToken');

useEffect(() => {
  axios.get('/GisDetail', {
    headers: {
      Authorization: `Bearer ${token}`
    },
  })
  .then(response => response.data)
  .then((data) => {
    console.log('Fetched titleSearchData:', data);
    setTitleSearchData(data);
  
  }
)},[titleSearch])

const handleSearchTitle = () => {
  const matchingTitleSearch = titleSearchData.find(
    (search) => search.title === titleSearch
  );

 if(matchingTitleSearch){
  setId(matchingTitleSearch.id);
  setTitle(matchingTitleSearch.title);
  setTitleDate(matchingTitleSearch.titledate);
  setSurveyNumber(matchingTitleSearch.surveynumber);
  setLotNumber(matchingTitleSearch.lotnumber);
  setBlkNumber(matchingTitleSearch.blknumber);
  setArea(matchingTitleSearch.area);
  setBoundary(matchingTitleSearch.boundary);
  setGeoJSON(matchingTitleSearch.geojson);
  setOwnerName(matchingTitleSearch.ownername);
  setTct(matchingTitleSearch.prevtct);
  setTctDate(matchingTitleSearch.tctdate);
  setOct(matchingTitleSearch.oct);
  setOctDate(matchingTitleSearch.octdate);
  setStatus(matchingTitleSearch.status);
  if(matchingTitleSearch.status === 'APPROVED' || matchingTitleSearch.status === 'PIN ASSIGNED' || matchingTitleSearch.status === 'PIN APPROVED'){
    setTextStatusColor('blue')
    setStatus('APPROVED');
    setIsApproved(true);
  } else {
    setStatus('FOR APPROVAL');
    setTextStatusColor('red');
    setIsApproved(false);
  }

 } else {
  alert("NO MATCH FOUND");
 }
}

useEffect(() => {
  const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
  if (storedUserDetails && storedUserDetails.role === "user") {
    setIsAdmin(false);
   
  }
 
}, []);
  
  useEffect(() => {
    if (polygonDetails) {
    
    generateGeoJSON();
    polygonStatus();
    setId(polygonDetails.id)
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
    }
    // console.log('isadmin', isAdmin);
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
    if (
      polygonDetails &&
      ((polygonDetails.status === 'APPROVED' ||
        polygonDetails.status === 'PIN ASSIGNED' ||
        polygonDetails.status === 'PIN APPROVED'))
     ) {
      setTextStatusColor('blue')
      setStatus('APPROVED');
      setIsApproved(true);
    } else if(polygonDetails.status === 'For Approval'){
      setStatus('FOR APPROVAL');
      setTextStatusColor('red');
      setIsApproved(false);
    } else {
      setStatus('RETURNED');
      setTextStatusColor('red');
      setIsApproved(false);
    }
  }

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log("update clicked");

    const formData = {
      id: id,
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
      status: 'For Approval'
    };

    fetch(`/GisDetail/${id}`, { 
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
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
    // Send a PUT request to update the status in the backend
    fetch(`/approved/${id}`, {  
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'APPROVED',
      
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // alert('APPROVED');
        props.onPolygonApproval();
        console.log('isApproved',isApproved);
        setStatus('APPROVED');
        setTextStatusColor('blue');
        setIsApproved(true);
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
  };



  const handleReturn = () => {
    fetch(`/approved/${id}`, {    
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'RETURNED',
      
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setStatus('RETURNED');
        setTextStatusColor('RED');
        setIsApproved(false);
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
  }
 
    //Uppercase Inputs
    const handleInputChange = (value, setStateFunction) => {
      setStateFunction(value.toUpperCase());
    };
  
  return (
    <div className={styles['popup-form-container']}>
     <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' , justifyContent: 'flex-end'}}>
      <p style={{fontSize: '.9em'}}>Search Title:</p>
      <input 
       style={{width: '40%', marginLeft: '5px', height: '35px', marginRight: '5px'}}
       type="text"
        name="title"
        value={titleSearch}
        placeholder='Search...'
       onChange={(e) => handleInputChange (e.target.value, setTitleSearch)}
      />
      <button
      style={{height: '35px', width: '30px'}}
      onClick={handleSearchTitle}
      ><i className="fa-solid fa-magnifying-glass"></i></button>
      </div>
      <form onSubmit={handleUpdate}>
      <div style={{ border: '2px gray solid', padding: '10px' }}>
      <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>Title no.*</label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(e) => handleInputChange (e.target.value, setTitle)}
        />
         </div>
         <div>
         <label>Date</label>
         {/* <DatePicker 
        selected={titleDate} 
        placeholderText='MMM dd, yyyy'
        onChange={(titleDate) => setTitleDate(titleDate)}
        dateFormat="YYYY/MM/dd"
       
        />
         */}
        <input
        value ={titleDate}
        onChange={(e) => setTitleDate(e.target.value)}
        placeholder="MMM d, yyyy"
        />
        </div>
        </div>

        <label>Survey no.*</label>
        <input
          type="text"
          name="surveyNumber"
          value={surveyNumber}
          onChange={(e) => handleInputChange (e.target.value, setSurveyNumber)}
          required
        />
     <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
       <div>
      <label>Lot no.*</label>
    <input
      type="text"
      name="lotNumber"
      value={lotNumber}
      onChange={(e) => handleInputChange (e.target.value, setLotNumber)}
      required
    />
      </div>

       <div>
        <label>Blk no.*</label>
        <input
      type="text"
      name="blkNumber"
      value={blkNumber}
      onChange={(e) => handleInputChange (e.target.value, setBlkNumber)}
      required
      />
      </div>
      <div>
      <label>Area (sq.m.)*</label> 
        <input
          type="text"
          name="area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          required />

      </div>
      </div>


      <label>Boundaries*</label>
      <textarea 
        rows={6}
        type="text"
        name="boundary"
        value={boundary}
        onChange={(e) => handleInputChange (e.target.value, setBoundary)}
        required
      />
      

      <label>Owner Name*</label>
      <input
          type="text"
          name="ownerName"
          value={ownerName}
          onChange={(e) => handleInputChange (e.target.value, setOwnerName)}
          required />
      

      <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>OCT No.*</label>
        <input
          type="text"
          name="OCT"
          value={oct}
          onChange={(e) => handleInputChange (e.target.value, setOct)}
        />
         </div>
         <div>
         <label>Date</label>
        <input
        value ={octDate}
        onChange={(e) => setOctDate(e.target.value)}
        placeholder="MMM d, yyyy"
        />
        </div>
        </div>

        <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>Prev TCT No.*</label>
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
         <label>Date</label>
        <input
        value ={tctDate}
        onChange={(e) => setTctDate(e.target.value)}
        placeholder="MMM d, yyyy"
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
        </div>
        
      </form>
  
      <div style={{display: 'flex', marginTop: '3%', alignItems: 'center' }}>
    
      <label style={{color: textStatusColor}}>STATUS: {status}</label>
      </div>

      <div className={styles['button-wrapper']}>
      
      {!isApproved && isAdmin &&( 
        <>
          <button style={{ verticalAlign: 'middle' , marginLeft: '5px', background: 'rgba(15, 118, 214, 0.897)'}} 
          onClick={handleApprove} >
          <i className="fa-solid fa-check" style={{marginRight: "5px"}}></i>
          APPROVE
          </button>

          <button  style={{ backgroundColor: 'red'}} onClick={handleReturn}>Return</button>
          </>
        )}
      </div>
   
       
     
      
  </div>
  );
};

export default EditForm;
