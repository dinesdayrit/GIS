import React, { useState, useEffect } from 'react';



const Plottingform = (props) => {
  const [formData, setFormData] = useState({
    monument: '',
    eastingValue: '', 
    northingValue:'',
    tieLines: [
      {
        c14: '', //bearing degree angle
        d14: '', //degree
        e14: '', //Minutes
        f14: '', //Minutes angle
        g14: '', //distance
      },
    ],
  });
  const [results, setResults] = useState([]);
  const [pointCount, setPointCount] = useState(0);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => { 
    handleCalculate(); 
    const formattedResults = results.map(coord => `${coord.eastingCoordinate},${coord.northingCoordinate}`).join('\n'); 
    props.onGridCoordinatesChange(formattedResults);
    console.log(formattedResults);
    
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
    const newTieLine = {
      c14: '',
      d14: '',
      e14: '',
      f14: '',
      g14: '',
    };

    setFormData({
      ...formData,
      tieLines: [...formData.tieLines, newTieLine],
    });

    
    if (pointCount > 0) {
        setPointCount(pointCount + 1);
  };
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


  return (
    <div>
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


      {formData.tieLines.map((tieLine, index) => (
        <div key={index} >
        <label>
        {index === 0
              ? 'Tie Line'
              : index === 1
              ? `Point ${pointCount + 1}`
              : `Point ${index  + pointCount}`
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
            // onBeforeInputCapture={handleAddTieLine}
          />
            <button
              type="button"
              onClick={() => handleRemovePoint(index)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '2%' }}
            >
            x
            </button>
        
          </div>
        
            </div>
            
        
      ))}
      <button type='button' onClick={handleAddTieLine} style ={{width: '15%',borderRadius: '50%', textAlign: 'center'}}>+</button>
    </div>
  );
};

export default Plottingform;
