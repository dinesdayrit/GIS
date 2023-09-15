import React, { useState, useEffect } from 'react';
import styles from './AddForm.module.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import Plottingform from './PlotttingForm';
import proj4 from 'proj4';

proj4.defs("EPSG:3125","+proj=tmerc +lat_0=0 +lon_0=125 +k=0.99995 +x_0=500000 +y_0=0 +ellps=clrk66 +towgs84=-127.62,-67.24,-47.04,-3.068,4.903,1.578,-1.06 +units=m +no_defs +type=crs");

const AddForm = (props) => {
  const [title, setTitle] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [blkNumber, setBlkNumber] = useState('');
  const [area, setArea] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [plusCode, setPlusCode] = useState('');
  const [geojson, setGeoJSON] = useState('');
  const [gridCoordinates, setGridCoordinates] = useState(''); 
  const [prs92Coordinates, setPrs92Coordinates] = useState([]);

  
  const handleGridCoordinatesChange = (newGridCoordinates) => {
    setGridCoordinates(newGridCoordinates);
  };

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
      alert(`Error converting coordinates: ${error.message}`);
    }
  };
  
  

  const handleDrawClick = () => {
    props.onDraw(JSON.stringify(prs92Coordinates, null, 2));
    props.handleShapeClick(JSON.stringify(prs92Coordinates, null, 2));
    
  };
// const handleConvertThenDraw = () => {
//   handleConvert();
//   handleDrawClick()

// }

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      title: title,
      surveyNumber: surveyNumber,
      lotNumber: lotNumber,
      blkNumber: blkNumber,
      area: area,
      ownerName: ownerName,
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

        <label>Lot Number:</label>
        <input
          type="text"
          name="lotNumber"
          valuue={lotNumber}
          onChange={(e) => setLotNumber(e.target.value)}
        />

        <label>Blk No.:</label>
        <input
          type="text"
          name="blkNumber"
          value={blkNumber}
          onChange={(e) => setBlkNumber(e.target.value)}
          />


        <label>Owner Name:</label>
        <input
          type="text"
          name="ownerName"
          onChange={(e) => setOwnerName(e.target.value)}
        />

        <label>Area (sq.m.):</label> 
        <input
          type="text"
          name="area"
          onChange={(e) => setArea(e.target.value)}
          required />


        <Plottingform 
        onGridCoordinatesChange={handleGridCoordinatesChange}
         />

        <label>LongLat Coordinates:</label>
          <textarea
          id="convertedCoordinates"
          name="convertedCoordinates"
          rows={5}
          onClick={handleConvert}
          onSelect={handleConvert}
          value={JSON.stringify(prs92Coordinates, null, 2)}

          />   
        <button type="button" id="drawButton" onClick={handleDrawClick}>
           Draw
        </button> 

        <label>Plus Code:</label>
        <input
          type="text"
          name="plusCode"
          value={props.plusCode}
          onChange={(e) => setPlusCode(e.target.value)}
        />

        <label>Generated GeoJSON Format:</label>
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

export default AddForm;
