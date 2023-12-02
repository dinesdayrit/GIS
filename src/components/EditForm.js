import React, { useState, useEffect } from 'react';
import styles from './EditForm.module.css';
// import DatePicker from 'react-datepicker';
import axios from 'axios';
import EditDrawForm from './EditDrawForm';
import proj4 from 'proj4';

proj4.defs("EPSG:3125","+proj=tmerc +lat_0=0 +lon_0=125 +k=0.99995 +x_0=500000 +y_0=0 +ellps=clrk66 +towgs84=-127.62,-67.24,-47.04,-3.068,4.903,1.578,-1.06 +units=m +no_defs +type=crs");

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
  const [pluscode, setPluscode] = useState('');
  const [technicalDescription, setTechnicalDescription] = useState('');
  const [draftTechnicalDesc, setDraftTechnicalDesc] = useState('');
  const [technicaldescremarks, setTechnicaldescremarks] = useState('');
  const [isTechnicalDescChange, setIsTechnicalDescChange] = useState(false);
  const [plottedBy, setPlottedBy] = useState('')
  const [status, setStatus] = useState('')
  const [textStatusColor, setTextStatusColor] = useState('');
  const [geojson, setGeoJSON] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const { polygonDetails } = props;
  const [titleSearchData, setTitleSearchData] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [plottingForm , setPlottingForm] = useState(false);
  const [gridCoordinates, setGridCoordinates] = useState('');
  const [tieLineCoordinates, setTieLineCoordinates] = useState('');
  const [prs92Coordinates, setPrs92Coordinates] = useState([]);
  const [tieLinePrs92Coordinates, setTieLinePrs92Coordinates] = useState([]);
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

///////initialData to be pass to EditDrawForm
const parseTechnicalDescription = (technicalDescription) => {
 
  if (technicalDescription === null || technicalDescription === '') {

    return {
      monument: '',
    };
  } else {
  const lines = technicalDescription.split('\n');
  console.log("lines",lines)

  const monumentLine = lines[0].split(':');
  const monument = monumentLine.length > 1 ? monumentLine[1].trim() : '';
  
  const eastingLine = lines[1].split(':');
  const eastingValue = eastingLine.length > 1 ? eastingLine[1].trim() : '';

  const northingLine = lines[2].split(':');
  const northingValue = northingLine.length > 1 ? northingLine[1].trim() : '';

  const numberOfPoints = lines.length /2;
  const numberOfPointsValue = numberOfPoints - 3;

  const tieLines = [];
    for (let i = 5; i < lines.length; i +=2) {
      const lineParts = lines[i].split(' ');
      const directionAngle = lineParts[0];
      const degrees = lineParts[1];
      const minutes = lineParts[2];
      const minutesAngle = lineParts[3];
      const distance = lineParts[4];
      const coordinate = `${directionAngle} ${degrees} ${minutes} ${minutesAngle} ${distance}`;
      tieLines.push(coordinate);
    }
   
  return {
    monument,
    eastingValue,
    northingValue,
    numberOfPointsValue,
    tieLines,
  };
}
};

////////

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
  setGeoJSON(JSON.stringify(matchingTitleSearch.geojson, null, 2));
  setOwnerName(matchingTitleSearch.ownername);
  setTct(matchingTitleSearch.prevtct);
  setTctDate(matchingTitleSearch.tctdate);
  setOct(matchingTitleSearch.oct);
  setOctDate(matchingTitleSearch.octdate);
  setStatus(matchingTitleSearch.status);
  setTechnicalDescription(matchingTitleSearch.tecnicaldescription);
  setTechnicaldescremarks(matchingTitleSearch.technicaldescremarks);
  setPlottedBy(matchingTitleSearch.username);
  props.onSearchTitle(matchingTitleSearch.id);
  setPluscode(matchingTitleSearch.pluscode);
  setPlottingForm(false);
  if(matchingTitleSearch.status === 'APPROVED' || matchingTitleSearch.status === 'PIN ASSIGNED' || matchingTitleSearch.status === 'PIN APPROVED'){
    setTextStatusColor('blue')
    setStatus('APPROVED');
    setIsApproved(true);
  } else if (matchingTitleSearch.status === 'For Approval') {
    setStatus('FOR APPROVAL');
    setTextStatusColor('red');
    setIsApproved(false);
  } else {
    setStatus('RETURNED');
    setTextStatusColor('red');
    setIsApproved(true);
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
    // polygonStatus();
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
    setPluscode(props.plusCode);
    setTechnicalDescription(polygonDetails.technicalDescription);
    setTechnicaldescremarks(polygonDetails.technicaldescremarks);
    setPlottedBy(polygonDetails.username);
    setPlottingForm(false);
    }
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

 
  useEffect(() =>{
    axios.get('/GisDetail', {
      headers: {
        Authorization: `Bearer ${token}`
      },
    })
      .then(response => response.data)
      .then((data) => {

        const matchingPluscode = data.find(
          (targetPluscode) => targetPluscode.pluscode === pluscode
        )

        if (matchingPluscode){
          if(matchingPluscode.status === 'APPROVED' ||
          matchingPluscode.status === 'PIN ASSIGNED' ||
          matchingPluscode.status === 'PIN APPROVED')
          {
          setTextStatusColor('blue')
          setStatus('APPROVED');
          setIsApproved(true);
        }  else if (matchingPluscode.status === 'For Approval') {
          setTextStatusColor('red')
          setStatus('FOR APPROVAL');
          setIsApproved(false);
        } else {
          setTextStatusColor('red')
          setStatus('RETURNED');
          setIsApproved(true);
        }
      }
      })
      .catch((error) => {
        console.error('Error fetching PINS:', error);
        alert('Error fetching PINS:', error);
      });

   
  },[pluscode])
  //////////////
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
      technicalDescription: technicalDescription,
      technicaldescremarks: technicaldescremarks,
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

  const handleTieLineCoordinatesChange = (bagoTieLineCoordinates) => {
    setTieLineCoordinates(bagoTieLineCoordinates);
  };

  const handleGridCoordinatesChange = (newGridCoordinates) => {
    setGridCoordinates(newGridCoordinates);
  };

  useEffect(() => {
    // Automatically call handleConvert whenever gridCoordinates changes
    handleConvert();
    console.log("convertCoordinates")
  }, [gridCoordinates]);

  useEffect(() => {
    // Automatically call handleConvert whenever gridCoordinates changes
    handleTieLineConvert();
  }, [tieLineCoordinates]);

  const handleConvert = () => {
    const inputLines = gridCoordinates.split('\n').map(line => line.trim());
    const newCoordinates = [];


  
    try {
      inputLines.forEach(line => {
        const [x, y] = line.split(',').map(Number);
  
        if (!isFinite(x) || !isFinite(y)) {
          throw new Error(`Invalid coordinate: ${line}`);
        }
  
        const converted = proj4("EPSG:3125", "EPSG:4326", [x, y]);
        newCoordinates.push(converted);
      });

      setPrs92Coordinates(newCoordinates);
      console.log('Coordinates converted and added:', newCoordinates);

           
    } catch (error) {
      // alert(`Error converting coordinates: ${error.message}`);

    }

  };

  const handleTieLineConvert = () => {
    const tieLine = tieLineCoordinates.split('\n').map(line => line.trim());
    const newTieLineCoordinates = []; 
  
    try {
      tieLine.forEach(line => {
        const [x, y] = line.split(',').map(Number);
  
        if (!isFinite(x) || !isFinite(y)) {
          throw new Error(`Invalid tie line coordinate: ${line}`);
        }
  
        const converted = proj4("EPSG:3125", "EPSG:4326", [x, y]);
        newTieLineCoordinates.push(converted);
      });
  
      setTieLinePrs92Coordinates(newTieLineCoordinates); // Update the state variable here
      console.log('Tie line coordinates converted and added:', newTieLineCoordinates);
  
    } catch (error) {
      // alert(`Error converting Tie line coordinates: ${error.message}`);
    }
  };

  useEffect (() => {
    if (isTechnicalDescChange) {
      setTechnicalDescription(draftTechnicalDesc);
    };
    setIsTechnicalDescChange(false);
  },[props.plusCode])

  const handleDrawClick = () => {
    setIsTechnicalDescChange(true);
    props.onTieLineDraw(JSON.stringify(tieLinePrs92Coordinates, null, 2));
    props.onDraw(JSON.stringify(prs92Coordinates, null, 2));
    props.handleShapeClick(JSON.stringify(prs92Coordinates, null, 2)); 
  }

  const handleApprove = () => {
    const isConfirmed = window.confirm('Are you sure you want to approve this parcel?');

    if (!isConfirmed) {
      return;
    }

    //if user click "OK" Send a PUT request to update the status in the backend
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
        // props.onPolygonApproval();
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
    fetch(`/GisDetail/${id}`, {    
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
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
      technicalDescription: technicalDescription,
      technicaldescremarks: technicaldescremarks,
      geojson: geojson,
        status: 'RETURNED',
      
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setStatus('RETURNED');
        setTextStatusColor('RED');
        setIsApproved(true);
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
  }
 
    //Uppercase Inputs
    const handleInputChange = (value, setStateFunction) => {
      setStateFunction(value.toUpperCase());
    };
    const handleSearchInputChange = (value, setStateFunction) => {
      const filtered = titleSearchData.filter((search) =>
        search.title.toLowerCase().includes(value.toLowerCase())
      );
    
      setFilteredSuggestions(filtered);
      setStateFunction(value.toUpperCase());
    };
    const handleSuggestionClick = (suggestion) => {
      setTitleSearch(suggestion.title);
      setFilteredSuggestions([]);
    };
const handleRedraw = () => {
  setPlottingForm(!plottingForm);
}

//Area Decimal Points
const decimalAreaInput = (e) => {
  const inputValue = e.target.value;
  const regex = /^[0-9]+(\.[0-9]{0,2})?$/;
  if (regex.test(inputValue) || inputValue === "") {
    
    setArea(inputValue);
  } else {
    console.log("Invalid area input.");
  }
};


  return (
    <div className={styles['popup-form-container']}>
     <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
      <p style={{fontSize: '.9em'}}>Search Title:</p>
      <input 
       style={{width: '40%', marginLeft: '5px', height: '35px', marginRight: '5px'}}
       type="text"
        name="title"
        value={titleSearch}
        placeholder='Search...'
       onChange={(e) => handleSearchInputChange (e.target.value, setTitleSearch)}
      />
      <button
      style={{height: '35px', width: '30px'}}
      onClick={handleSearchTitle}
      ><i className="fa-solid fa-magnifying-glass"></i></button>

{titleSearch && filteredSuggestions.length > 0 && (
  <ul style={{ position: 'absolute', top: '100%', left: '50', width: '50%', maxHeight: '300%', overflowY: 'auto',backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', zIndex: '100', padding: '0', listStyleType: 'none' }}>
    {filteredSuggestions.map((suggestion) => (
      <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)} style={{ padding: '8px', cursor: 'pointer', transition: 'background-color 0.3s', ':hover': { backgroundColor: 'gray' }, ':focus': { backgroundColor: 'gray' } }}>
        <div>{suggestion.title}</div>
        <div style={{ fontSize: '0.8em', color: '#888' }}>{suggestion.lotnumber}</div>
      </li>
        ))}
      </ul>
     )}

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
        placeholder='YYYY/MM/DD'
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
      />
      </div>
      <div>
      <label>Area (sq.m.)*</label> 
        <input
          type="text"
          name="area"
          value={area}
          onChange={decimalAreaInput}
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
        placeholder='YYYY/MM/DD'
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
        placeholder='YYYY/MM/DD'
        />
        </div>
        </div>
        
      {!plottingForm ? (
        <>
      <label>Technnnical Description*</label>
      <textarea
          rows={6}
          type="text"
          name="technicalDescription"
          value={technicalDescription}
          onChange={(e) => setTechnicalDescription(e.target.value)}
          style={{marginBottom: '0px'}}
          readOnly
          />
        </>
      ):(
        <>
        <EditDrawForm 
          initialData={parseTechnicalDescription(technicalDescription)}
          onGridCoordinatesChange={handleGridCoordinatesChange}
          onTieLineCoordinates={handleTieLineCoordinatesChange}
          onTechnicalDescriptionChange={(newTechnicalDescription) =>
          setDraftTechnicalDesc(newTechnicalDescription)
          }
        />
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
        <button type="button" id="drawButton" onClick= {handleDrawClick} style={{width: '35%'}}>
           DRAW
        </button> 
        </div>
        </>
      )}
      {props.selectedCoordinates.length >= 1 && (
      <p
      onClick={handleRedraw}
      style={{display:  'flex', justifyContent: 'flex-end', color: 'blue'}}>
      {!plottingForm ? 're-draw' : 'cancel'}
          <style>
        {`
        p:hover {
         text-decoration: underline;
          font-weight: bold;
          cursor: pointer;
         }
       `}
       </style>
      </p>
      )}
     

      <label>Technical Desc. Remarks</label>
      <textarea 
          rows={3}
          type="text"
          name="remarks"
          defaultValue={technicaldescremarks}
          onChange={(e) => {
            setTechnicaldescremarks(e.target.value);
          }}
        />


        <label>Plus Code*</label>
        <input
          type="text"
          name="plusCode"
          value={pluscode}
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

      {isAdmin &&(
        <p>Plotted by: {plottedBy} </p>)}

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
