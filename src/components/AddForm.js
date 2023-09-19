import React, { useState, useEffect } from 'react';
import styles from './AddForm.module.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import Plottingform from './PlotttingForm';
import proj4 from 'proj4';
import { center } from '@turf/turf';

proj4.defs("EPSG:3125","+proj=tmerc +lat_0=0 +lon_0=125 +k=0.99995 +x_0=500000 +y_0=0 +ellps=clrk66 +towgs84=-127.62,-67.24,-47.04,-3.068,4.903,1.578,-1.06 +units=m +no_defs +type=crs");

const AddForm = (props) => {
  const [title, setTitle] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [blkNumber, setBlkNumber] = useState('');
  const [area, setArea] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [geojson, setGeoJSON] = useState('');
  const [gridCoordinates, setGridCoordinates] = useState(''); 
  const [prs92Coordinates, setPrs92Coordinates] = useState([]);
  const [technicalDescriptionValue, setTechnicalDescriptionValue] = useState('');
  const [ownerNames, setOwnerNames] = useState([{
    lName: "",
    fName: "",
    mi: "",
    suffix: "",
  }]);



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
    const combinedOwnerName = ownerNames
      .map((ownerName) => {
        const { lName, fName, mi, suffix } = ownerName;
        return `${lName} ${fName} ${mi} ${suffix}`.trim();
      })
      .filter((name) => name !== '')
      .join(', ');

    return combinedOwnerName;
  };

  const combinedOwnerName = getCombinedOwnerName();
 

  

  const handleGridCoordinatesChange = (newGridCoordinates) => {
    setGridCoordinates(newGridCoordinates);
  };

  useEffect(() => {
    // Automatically call handleConvert whenever gridCoordinates changes
    handleConvert();
  }, [gridCoordinates]);


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
  
  

  const handleDrawClick = () => {
    
    props.onDraw(JSON.stringify(prs92Coordinates, null, 2));
    props.handleShapeClick(JSON.stringify(prs92Coordinates, null, 2));
    
  };
  // const handleConvertAndDraw = () => {
  //   handleConvert();
  //   handleDrawClick();
  // };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      title: title,
      surveyNumber: surveyNumber,
      lotNumber: lotNumber,
      blkNumber: blkNumber,
      area: area,
      ownerName: combinedOwnerName,
      technicalDescription: technicalDescriptionValue,
      plusCode: props.plusCode,
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
          onChange={(e) => setArea(e.target.value)}
          required />

      </div>
      </div>
        
        <label>Owner Name: <p>(Last name, First name, Middle Initials, Suffix)</p></label>
      
        {ownerNames.map((ownerName, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
          <input
              type="text"
              name="lName"
              placeholder="Last Name"
              style={{ width: '25%' }}
              value={ownerName.lName}
              onChange={(e) => handleOwnerNameChange(index, 'lName', e.target.value)}
            />
            <input
              type="text"
              name="fName"
              placeholder="First Name"
              style={{ width: '25%' }}
              value={ownerName.fName}
              onChange={(e) => handleOwnerNameChange(index, 'fName', e.target.value)}
            />
            <input
              type="text"
              name="mi"
              placeholder="MI"
              style={{ width: '25%' }}
              value={ownerName.mi}
              onChange={(e) => handleOwnerNameChange(index, 'mi', e.target.value)}
            />
            <input
              type="text"
              name="suffix"
              placeholder="Suffix"
              style={{ width: '25%' }}
              value={ownerName.suffix}
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '2%', color: 'black' }}
        >
          +
        </button>
        

  
  

         {/* <input
          type="text"
          name="ownerName"
          value={combinedOwnerName}
          onChange={(e) => setOwnerName(e.target.value)}
        /> */}
        


        <Plottingform 
        onGridCoordinatesChange={handleGridCoordinatesChange}
        onTechnicalDescriptionChange={(newTechnicalDescription) =>
        setTechnicalDescriptionValue(newTechnicalDescription)
          }
         />

        {/* <label>LongLat Coordinates:</label>
          <textarea
          id="convertedCoordinates"
          name="convertedCoordinates"
          rows={5}
          onClick={handleConvert}
          onSelect={handleConvert}
          value={JSON.stringify(prs92Coordinates, null, 2)}
          />    */}
        
        <button type="button" id="drawButton" onClick= {handleDrawClick}>
           Draw
        </button> 

        <label>Plus Code:</label>
        <input
          type="text"
          name="plusCode"
          value={props.plusCode}
        
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
        <div>
        <button type="submit">Save</button>
    
        </div>
      </form>

    </div>
  );
};

export default AddForm;
