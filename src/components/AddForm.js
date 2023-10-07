import React, { useState, useEffect } from 'react';
import styles from './AddForm.module.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import Plottingform from './PlotttingForm';
import proj4 from 'proj4';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


proj4.defs("EPSG:3125","+proj=tmerc +lat_0=0 +lon_0=125 +k=0.99995 +x_0=500000 +y_0=0 +ellps=clrk66 +towgs84=-127.62,-67.24,-47.04,-3.068,4.903,1.578,-1.06 +units=m +no_defs +type=crs");

const AddForm = (props) => {
  const [title, setTitle] = useState('');
  const [titleDate, setTitleDate] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [blkNumber, setBlkNumber] = useState('');
  const [area, setArea] = useState('');
  const [boundary, setBoundary] = useState('');
  const [oct, setOct] = useState('');
  const [octDate, setOctDate] = useState('');
  const [prevTct, setPrevTct] = useState('');
  const [tctDate, setTctDate] = useState('');
  const [geojson, setGeoJSON] = useState('');
  const [gridCoordinates, setGridCoordinates] = useState(''); 
  const [tieLineCoordinates, setTieLineCoordinates] = useState('');
  const [prs92Coordinates, setPrs92Coordinates] = useState([]);
  const [tieLinePrs92Coordinates, setTieLinePrs92Coordinates] = useState([]);
  const [technicalDescriptionValue, setTechnicalDescriptionValue] = useState('');
  const [ownerNames, setOwnerNames] = useState([{
    lName: "",
    fName: "",
    mi: "",
    suffix: "",
  }]);
  const [businessName, setBusinessName] = useState('');
  const [remarks, setRemarks] = useState('');

  
  
  const handleAddOwnerName = () => {
    // Create a copy of the current ownerNames array and add a new object with default values
    const newOwnerNames = [...ownerNames, { lName: '', fName: '', mi: '', suffix: '' }];
    setOwnerNames(newOwnerNames);
  };

  const handleRemoveOwnerName = (indexToRemove) => {
    // Create a copy of the current ownerNames array and remove the element at the specified index
    const newOwnerNames = ownerNames.filter((_, index) => index !== indexToRemove);
    setOwnerNames(newOwnerNames);
  };

  const handleOwnerNameChange = (index, fieldName, value) => {
    // Create a copy of the current ownerNames array and update the specified field at the specified index
    const newOwnerNames = [...ownerNames];
    newOwnerNames[index][fieldName] = value;
    setOwnerNames(newOwnerNames);
    
  };

  const getCombinedOwnerName = () => {
    const ownerNamesArray = ownerNames
      .map((ownerName) => {
        const { lName, fName, mi, suffix } = ownerName;
        return `${lName} ${fName} ${mi} ${suffix}`.trim();
      })
      .filter((name) => name !== '');
  
    if (businessName) {
      ownerNamesArray.push(businessName);
    }
  
    return ownerNamesArray.join(', ');
  };

  const combinedOwnerName = getCombinedOwnerName();
 
  const handleTieLineCoordinatesChange = (bagoTieLineCoordinates) => {
    setTieLineCoordinates(bagoTieLineCoordinates);
  };
  

  const handleGridCoordinatesChange = (newGridCoordinates) => {
    setGridCoordinates(newGridCoordinates);
  };

  useEffect(() => {
    // Automatically call handleConvert whenever gridCoordinates changes
    handleConvert();
    
  }, [gridCoordinates]);

  useEffect(() => {
    // Automatically call handleConvert whenever gridCoordinates changes
    handleTieLineConvert();
  }, [tieLineCoordinates]);



useEffect(() => {
    generateGeoJSON();
   
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
  

  
  


  const handleDrawClick = () => {
    props.onTieLineDraw(JSON.stringify(tieLinePrs92Coordinates, null, 2));
    props.onDraw(JSON.stringify(prs92Coordinates, null, 2));
    props.handleShapeClick(JSON.stringify(prs92Coordinates, null, 2));
  
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedTitleDate = titleDate instanceof Date && !isNaN(titleDate)
  ? titleDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  : null;

const formattedOctDate = octDate instanceof Date && !isNaN(octDate)
  ? octDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  : null;

const formattedTctDate = tctDate instanceof Date && !isNaN(tctDate)
  ? tctDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  : null;


    const formData = {
      title: title,
      titleDate: formattedTitleDate,
      surveyNumber: surveyNumber,
      lotNumber: lotNumber,
      blkNumber: blkNumber,
      area: area,
      boundary: boundary,
      ownerName: combinedOwnerName,
      oct: oct,
      octDate: formattedOctDate,
      tct: prevTct,
      tctDate: formattedTctDate,
      technicalDescription: technicalDescriptionValue,
      technicaldescremarks: remarks,
      plusCode: props.plusCode,
      geojson: geojson,
      status: 'For Approval',
      
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

      <div style={{border: 'green solid', borderRadius: '%', padding: '10px', marginBottom: '20px'}}>
      <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>Title no.*</label>
       
        <input
          type="text"
          name="title"
          placeholder='Title number'
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
         </div>
         <div>
         <label>Date*</label>
        <DatePicker 
        selected={titleDate} 
        placeholderText='MMM dd, yyyy'
        onChange={(titleDate) => setTitleDate(titleDate)}
        dateFormat="MMM d, yyyy"
        />
        </div>
        </div>
      

        <label>Survey no.*</label>
        <input
          type="text"
          name="surveyNumber"
          placeholder='Survey number'
          onChange={(e) => setSurveyNumber(e.target.value)}
        />
    
        
     <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
       <div>
      <label>Lot no.*</label>
    <input
      type="text"
      name="lotNumber"
      // value={lotNumber}
      placeholder='Lot no.'
      onChange={(e) => setLotNumber(e.target.value)}
    />
      </div>

       <div>
        <label>Blk no.*</label>
        <input
      type="text"
      name="blkNumber"
      // value={blkNumber}
      placeholder='Block no.'
      onChange={(e) => setBlkNumber(e.target.value)}
      />
      </div>


      <div>
      <label>Area (sq.m.)*</label> 
        <input
          type="text"
          name="area"
          placeholder='Lot Area(sqm)'
          onChange={(e) => setArea(e.target.value)}
          required />

      </div>
      </div>

      <label>Boundaries*</label>
      <textarea 
        rows={6}
        type="text"
        name="boundary"
        placeholder='Boundaries'
        onChange={(e) => {
        setBoundary(e.target.value);
        }}

      />

      </div>
        
      <div style={{border: 'green solid', borderRadius: '%', padding: '10px',position: 'relative', marginBottom: '15px'}}>
        <label
        style={{
          position: 'absolute',
          top: '-15px',
          left: '10px',
          backgroundColor: 'whitesmoke',
          padding: '0 5px',
         
        }}
        >Owner (Name/Business name)* </label>
       
       {/* <p>(Last name, First name, Middle Initials, Suffix)</p> */}
        {ownerNames.map((ownerName, index) => (
          <div key={index} className={styles.inputWrapper}>
        
          <input
              type="text"
              name="lName"
              placeholder="Last Name"
              style={{ width: '25%' }}
              // value={ownerName.lName}
              onChange={(e) => handleOwnerNameChange(index, 'lName', e.target.value)}
            />
            <input
              type="text"
              name="fName"
              placeholder="First Name"
              style={{ width: '25%' }}
              // value={ownerName.fName}
              onChange={(e) => handleOwnerNameChange(index, 'fName', e.target.value)}
            />
            <input
              type="text"
              name="mi"
              placeholder="MI"
              style={{ width: '25%' }}
              // value={ownerName.mi}
              onChange={(e) => handleOwnerNameChange(index, 'mi', e.target.value)}
            />
            <input
              type="text"
              name="suffix"
              placeholder="Suffix"
              style={{ width: '25%' }}
              // value={ownerName.suffix}
              onChange={(e) => handleOwnerNameChange(index, 'suffix', e.target.value)}
            />
            <button
              type="button"
              onClick={() => handleRemoveOwnerName(index)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '2%', color: 'black' }}
            >
              x
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddOwnerName}
          style={{width: '35%'}}
        >
          +  Add Name
        </button>

        {/* <p>Business Name</p> */}
        <input 
          type='text'
          name="businessName"
          // value={businessName}
          placeholder='Business Name'
          onChange={(e) => setBusinessName(e.target.value)}
        />
        </div>
        

  
  

         {/* <input
          type="text"
          name="ownerName"
          value={combinedOwnerName}
      
        /> */}
        <div style={{border: 'green solid', borderRadius: 'auto%', padding: '10px',marginBottom: '15px'}}>
        <div className={styles.inputWrapper}>
        <div style={{width: '90%'}}>
        <label>OCT No.*</label>
        <input
          type='text'
          name="oct"
          // value={oct}
          placeholder='OCT'
          onChange={(e) => setOct(e.target.value)}
        />
        </div>

        <div>
        <label>Date</label>
        <DatePicker 
        selected={octDate} 
        placeholderText='MMM dd, yyyy'
        onChange={(octDate) => setOctDate(octDate)}
        dateFormat="MMM d, yyyy"
        />
        </div>
        </div>

        <div className={styles.inputWrapper}>
        <div style={{width: '90%'}}>
        <label>Prev TCT No.*</label>
        <input
          type='text'
          name="prevTct"
          // value={prevTct}
          placeholder='Previous TCT'
          onChange={(e) => setPrevTct(e.target.value)}
        />
        </div>

        <div>
        <label>Date</label>
        <DatePicker 
        selected={tctDate} 
        placeholderText='MMM dd, yyyy'  
        onChange={(tctDate) => setTctDate(tctDate)}
        dateFormat="MMM d, yyyy"
        />
        </div>
        </div>
        </div>
      
        <div style={{border: 'green solid', borderRadius: '%', padding: '10px',position: 'relative', marginBottom: '15px'}}>
        <label
        style={{
          position: 'absolute',
          top: '-15px',
          left: '10px',
          backgroundColor: 'whitesmoke',
          padding: '0 5px',
        }}
        >Technical Description</label>
        <Plottingform 
        onGridCoordinatesChange={handleGridCoordinatesChange}
        onTieLineCoordinates={handleTieLineCoordinatesChange}
        onTechnicalDescriptionChange={(newTechnicalDescription) =>
        setTechnicalDescriptionValue(newTechnicalDescription)
          }
          required
         />
        

        {/* <label>LongLat Coordinates:</label>
          <textarea
          id="convertedCoordinates"
          name="convertedCoordinates"
          rows={5}
          value={JSON.stringify(prs92Coordinates, null, 2)}
          />    */}
        <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '10%'}}>
        <button type="button" id="drawButton" onClick= {handleDrawClick} style={{width: '35%'}}>
           DRAW
        </button> 
        </div>

        <label>REMARKS</label>
        <textarea 
          rows={3}
          type="text"
          name="remarks"
          placeholder='Techical description Remarks'
          onChange={(e) => {
            setRemarks(e.target.value);
          }}
        />
         </div>

        <label>Plus Code*</label>
        <input
          type="text"
          name="plusCode"
          placeholder='Pluscode'
          value={props.plusCode}
          readOnly
        
        />


        {/* <label>Technical Description</label>
      <textarea 
        name= 'technicalDescription'
        rows={4}
        value={technicalDescriptionValue}
        onChange={(e) => setTechnicalDescriptionValue(e.target.value)}
        /> */}
{/* 
        <label>Generated GeoJSON Format:</label>
        <textarea
          name="geojson"
          rows={6}
          value={geojson}
          onChange={(e) => setGeoJSON(e.target.value)}
          readOnly
        /> */}
        
        <div style={{display: 'flex', justifyContent: 'center'}}>
        <button type="submit" style={{width: '80%'}}>SAVE</button>
    
        </div>
      </form>

    </div>
  );
};

export default AddForm;
