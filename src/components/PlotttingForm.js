import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const Plottingform = (props) => {

  function createTieLine() {
    return {
      c14: '', //degree angle
      d14: '', //degree
      e14: '', //minutes
      f14: '', //minutes angle
      g14: '', // distance
    };
  }

  const [formData, setFormData] = useState({
    monument: '',
    eastingValue: '', 
    northingValue:'',
    tieLines: [createTieLine()],
  });
  const [results, setResults] = useState([]);
  const [pointCount, setPointCount] = useState(0);
  const [numberOfPoints, setNumberOfPoints] = useState('');
  const [isInitialRender, setIsInitialRender] = useState(true);
  // const [techincalDescription, setTechnicalDescription] = useState("");

  useEffect(() => { 
    handleCalculate(); 
    const formattedResults = results.map(coord => `${coord.eastingCoordinate},${coord.northingCoordinate}`).join('\n'); 
    props.onGridCoordinatesChange(formattedResults);
    console.log(formattedResults);
    const newTechnicalDescription = generateTechnicalDescription(formData);
    props.onTechnicalDescriptionChange(newTechnicalDescription);

    
    setIsInitialRender(true);

    if (isInitialRender) { 
    setFormData({
    ...formData,
    // gridCoordinates: formattedResults,
   });
   setIsInitialRender(false);
  }
  }, [formData]); 


  const handleChange = (e, index) => {
    const { name, value } = e.target;
   

    if (name.startsWith('tieLines[')) {
        const updatedTieLines = [...formData.tieLines];
        const parts = name.match(/\[(\d+)\]\.(\w+)/);
        const tieLineIndex = parseInt(parts[1]);
        const fieldName = parts[2];
        updatedTieLines[tieLineIndex][fieldName] = value;
     

        setFormData({
            ...formData,
            tieLines: updatedTieLines,
            
          });
       
        } else {
          setFormData({
            ...formData,
            [name]: value,
          });
          
        }

        
      };

  const calculateDecimalBearig = (d14, e14) => {
    return parseFloat(d14) + parseFloat(e14) / 60;
  };

  const calculateAzimuth = (d14, e14, c14, f14) => {
    const decimalBearing = calculateDecimalBearig(d14, e14);
    let calculatedCoordinates;

    if (c14 === 'N' && f14 === 'E') {
      calculatedCoordinates = decimalBearing + 180;
    } else if (c14 === 'S' && f14 === 'E') {
      calculatedCoordinates = decimalBearing * -1 + 360;
    } else if (c14 === 'S' && f14 === 'W') {
      calculatedCoordinates = decimalBearing;
    } else if (c14 === 'N' && f14 === 'W') {
      calculatedCoordinates = decimalBearing * -1 + 180;
    } else {
      calculatedCoordinates = '';
    }

    return calculatedCoordinates;
  };

  const handleAddTieLine = () => {
    const numPointsToAdd = parseInt(numberOfPoints);
  
    if (!isNaN(numPointsToAdd) && numPointsToAdd > 0) {
      const newTieLines = Array(numPointsToAdd).fill().map(() => createTieLine());
  
      setFormData({
        ...formData,
        tieLines: newTieLines,
      });
  
      setPointCount(numPointsToAdd);
    }
  };
  

  const handleRemovePoint = (indexToRemove) => {
    const updatedTieLines = formData.tieLines.filter((_, index) => index !== indexToRemove);

    setFormData({
      ...formData,
      tieLines: updatedTieLines,
    });
  };

  const handleCalculate = () => {
    let cumulativeEasting = parseFloat(formData.eastingValue);
  let cumulativeNorthing = parseFloat(formData.northingValue);


    const resultsArray = formData.tieLines.map((tieLine) => {
      const azimuth = calculateAzimuth(tieLine.d14, tieLine.e14, tieLine.c14, tieLine.f14);
      const sine = parseFloat(tieLine.g14) * Math.sin(azimuth * (Math.PI / 180)) * -1;
      const cosine = parseFloat(tieLine.g14) * Math.cos(azimuth * (Math.PI / 180)) * -1;
      const eastingCoordinate = cumulativeEasting + sine;
      cumulativeEasting = eastingCoordinate; // Update cumulative Easting
  
      const northingCoordinate = cumulativeNorthing + cosine;
      cumulativeNorthing = northingCoordinate; // Update cumulative Northing
  
      return { eastingCoordinate, northingCoordinate };
   
    });

    setResults(resultsArray);
  };

  const generateTechnicalDescription = (formData) => {
    const tieLineDescriptions = formData.tieLines.map((tieLine, index) => (
    `${index === 0 ? '[Tie Line]' : `[Point ${index}]`}
   ${tieLine.c14} ${tieLine.d14} ${tieLine.e14} ${tieLine.f14} ${tieLine.g14}`
    )).join('\n');
  
    return `monument: ${formData.monument}
  eastingValue: ${formData.eastingValue}
  northingValue: ${formData.northingValue}
  ${tieLineDescriptions}`.trim('');
  };

//CSV Upload Start Here
const handleFileUpload = (e) => {
  const files = e.target.files;
  if (files.length === 0) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true, // dapat naka true para e disregard niya empty lines/rows
      complete: (result) => {
        if (result.data.length > 0) {
          const headerToData = result.data[0];

          const numberOfPointsValue = headerToData['numberofpoints'] || '';
          setNumberOfPoints(numberOfPointsValue);

          const tieLines = result.data.map((row) => ({
            c14: row['c14'] || '',
            d14: row['d14'] || '',
            e14: row['e14'] || '',
            f14: row['f14'] || '',
            g14: row['g14'] || '',
          }));

          setFormData({
            monument: headerToData['monument'] || '',
            eastingValue: headerToData['eastingValue'] || '',
            northingValue: headerToData['northingValue'] || '',
            numberOfPoints: numberOfPointsValue,
            tieLines,
          });

          alert('Data uploaded from CSV file.');
        } else {
          alert('CSV file is empty or invalid.');
        }
      },
    });
  };

  reader.readAsText(files[0]);
};

  return (
    <div>

      <label>Upload CSV File:</label>
        <input
          type="file"
          name="files"
          accept=".csv"
          onChange={handleFileUpload}
      />
      <label>Monument</label>
      <input        
        type="text"
        name="monument"
        value={formData.monument}
        onChange={(e) => handleChange(e)}
      />

      <label>Easting Value</label>
      <input
        type="text"
        name="eastingValue"
        value={formData.eastingValue}
        onChange={(e) => handleChange(e)}
      />

      <label>Northing Value</label>
      <input
        type="text"
        name="northingValue"
        value={formData.northingValue}
        onChange={(e) => handleChange(e)}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label>Number of points:</label>
      <input style ={{width: '15%'}}
          type="text"
          name="numberOfPoints"
          onSelect={handleAddTieLine}
          onChange={(e) => setNumberOfPoints(e.target.value)}
      />
     
      
      </div>
      {formData.tieLines.map((tieLine, index) => (
        <div key={index} >
        <label>
        {index === 0
          ? 'Tie Line'
        : `Point ${index}`
      }
    </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <select
        style={{ width: '30%' }}
         name={`tieLines[${index}].c14`}
         value={tieLine.c14}
          onChange={(e) => handleChange(e, index)}
             >
        <option value={null}></option>
         <option value="N">N</option>
          <option value="S">S</option>
         </select>
          <input
            style={{width: '20%'}}
            type="text"
            name={`tieLines[${index}].d14`}
            value={tieLine.d14}
            onChange={(e) => handleChange(e, index)}
          />
          <input
            style={{width: '20%'}}
            type="text"
            name={`tieLines[${index}].e14`}
            value={tieLine.e14}
            onChange={(e) => handleChange(e, index)}
          />
          <select
            style={{width: '30%'}}
            type="text"
            name={`tieLines[${index}].f14`}
            value={tieLine.f14}
            onChange={(e) => handleChange(e, index)}
            >
        <option value={null}></option>
         <option value="E">E</option>
          <option value="W">W</option>
         </select>
          
          <input
            style={{width: '40%'}}
            placeholder='DISTANCE'
            type="text"
            name={`tieLines[${index}].g14`}
            value={tieLine.g14}
            onChange={(e) => handleChange(e, index)}
       
          />
          
            <button
              type="button"
              onClick={() => handleRemovePoint(index)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '2%', color: 'black'}}
            >
            x
            </button>
        
          </div>
        
            </div>
            
        
      ))}
      {/* <label>Technical Description</label>
      <textarea 
        name= 'technicalDescription'
        rows={4}
        value={generateTechnicalDescription(formData)}
        onChange={(e) => setTechnicalDescription(e.target.value)} 
      /> */}
      {/* <label>Number of points</label>
      <div style={{ display: 'flex' }}>
      <input style ={{width: '50%'}}
          type="text"
          name="numberOfPoints"
          
          onChange={(e) => setNumberOfPoints(e.target.value)}
      />
      <button type='button' onClick={handleAddTieLine} style ={{width: '30%',borderRadius: '50%', textAlign: 'center'}}>+</button>
      
      </div> */}
    </div>
  );
};

export default Plottingform;
