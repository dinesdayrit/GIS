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
  const [ownerName, setOwnerName] = useState('');
  const [geojson, setGeoJSON] = useState('');
  const [coordinatesInput, setCoordinatesInput] = useState('');
  const [prs92Coordinates, setPrs92Coordinates] = useState([]);

  const handleCalculate = (results) => {
    const formattedCoordinates = results.map(coord => `${coord.eastingCoordinate},${coord.northingCoordinate}`).join('\n');
  setCoordinatesInput(formattedCoordinates);
  };
  
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
const handleConvert = () => {
  const inputLines = coordinatesInput.split('\n').map(line => line.trim());
  const newCoordinates = inputLines.map(line => {
    const [x, y] = line.split(',').map(Number); 
    return proj4("EPSG:3125", "EPSG:4326", [x, y]);
  });


  setPrs92Coordinates(newCoordinates);

  console.log('Coordinates converted and added:', newCoordinates);
  
};
  

  const handleDrawClick = () => {
    props.onDraw(JSON.stringify(prs92Coordinates, null, 2));
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

        <Plottingform onCalculate={handleCalculate}/>

       <label>Grid Coordinates</label>
       <textarea
         id="coordinatesInput"
         rows={4}
         value={coordinatesInput}
         onChange={(e) => setCoordinatesInput(e.target.value)}
        />
        <button type="button" id="convert" onClick={handleConvert}>
           Convert
        </button>

        
        <label>Converted Coordinates:</label>
          <textarea
          id="convertedCoordinates"
          name="convertedCoordinates"
          rows={5}
          value={JSON.stringify(prs92Coordinates, null, 2)}
          readOnly
          />   
        <button type="button" id="drawButton" onClick={handleDrawClick}>
           Draw
        </button> 

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

export default AddForm;
