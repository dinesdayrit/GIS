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
  const [drawTieLine, setDrawTieLine] = useState("");
  const [results, setResults] = useState([]);
  // const [pointCount, setPointCount] = useState(0);
  const [numberOfPoints, setNumberOfPoints] = useState('');
  const [isInitialRender, setIsInitialRender] = useState(true);
  // const [techincalDescription, setTechnicalDescription] = useState("");

  useEffect(() => { 
    calculateTieLine();
    handleCalculate(); 
    const formattedResults = results.map(coord => `${coord.eastingCoordinate},${coord.northingCoordinate}`).join('\n'); 
    props.onGridCoordinatesChange(formattedResults);
    console.log(formattedResults);
    const newTechnicalDescription = generateTechnicalDescription(formData);
    props.onTechnicalDescriptionChange(newTechnicalDescription);
    props.onTieLineCoordinates(drawTieLine);

    
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
  
      // setPointCount(numPointsToAdd);
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

  const calculateTieLine = () => {
    //get the the easting, northing and the first tie line's eastingCoordinate and northingCoordinate
  const { eastingValue, northingValue } = formData;

  // Check if there are any results
  if (results.length > 0) {
    // Get the eastingCoordinate and northingCoordinate of the first tie line
    const firstTieLine = results[0];
    const { eastingCoordinate, northingCoordinate } = firstTieLine;

    // Now you have access to these values for drawing
    console.log('Easting:', eastingValue);
    console.log('Northing:', northingValue);
    console.log('Easting Coordinate (First Tie Line):', eastingCoordinate);
    console.log('Northing Coordinate (First Tie Line):', northingCoordinate);

    
    

    setDrawTieLine(
      `${eastingValue}, ${northingValue}\n` +
      `${eastingCoordinate}, ${northingCoordinate}`
      );

    
      props.onTieLineCoordinates(drawTieLine);
      
  } else {
    console.log('No results available to draw.');
  }
  }


  const generateTechnicalDescription = (formData) => {
    const tieLineDescriptions = formData.tieLines.map((tieLine, index) => (
    `${index === 0 ? '[Tie Line]' : `[Point ${index}]`}
${tieLine.c14} ${tieLine.d14} ${tieLine.e14} ${tieLine.f14} ${tieLine.g14}`
    )).join('\n');
  
  return `Monument: ${formData.monument}\nEastingValue: ${formData.eastingValue}\nNorthingValue: ${formData.northingValue}\n\n${tieLineDescriptions}`.trim('');
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

          const lNameArray = [];
          const fNameArray = [];
          const miArray = [];
          const suffixArray = [];

          result.data.forEach((row) => {
            lNameArray.push(row['LastName'] || '');
            fNameArray.push(row['FirstName'] || '');
            miArray.push(row['MiddleName'] || '');
            suffixArray.push(row['Suffix'] || '');
          });

          const extractedData = {
            title: headerToData['Title'],
            titleDate: headerToData['TitleDate'],
            surveyNumber: headerToData['SurveyNumber'],
            lotNumber: headerToData['LotNumber'],
            blkNumber: headerToData['BlkNumber'],
            area: headerToData['Area'],
            boundary: headerToData['Boundary'],
            lName: lNameArray,
            fName: fNameArray,
            mi: miArray,
            suffix: suffixArray,
            businessName: headerToData['BusinessName'],
            oct: headerToData['OCT'],
            octDate: headerToData['OCTDate'],
            prevTct: headerToData['PrevTCT'],
            tctDate: headerToData['TCTDate'],
            remarks: headerToData['Remarks'],
          };

          props.onCsvDataChange(extractedData);

          const numberOfPointsValue = headerToData['NumberOfPoints'] || '';
          setNumberOfPoints(numberOfPointsValue);

          const tieLines = result.data.map((row) => ({
            c14: row['DegreeAngle'] || '',
            d14: row['Degree'] || '',
            e14: row['Minutes'] || '',
            f14: row['MinutesAngle'] || '',
            g14: row['Distance'] || '',
          }));

          setFormData({
            monument: headerToData['Monument'] || '',
            eastingValue: headerToData['Easting'] || '',
            northingValue: headerToData['Northing'] || '',
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

 // Fetch data from /monuments
 useEffect(() => {
  fetch('/monuments')
    .then((response) => response.json())
    .then((monuments) => {
      console.log('Fetched Monuments:', monuments);
      const matchingMonument = monuments.find(
        (monument) => monument.monument === formData.monument
      );

      console.log('Matching Monument:', matchingMonument);

      if (matchingMonument) {
        setFormData({
          ...formData,
          eastingValue: matchingMonument.easting,
          northingValue: matchingMonument.northing,
        });
      }
    })
    .catch((error) => {
      alert('Error fetching Monuments:', error);
    });
}, [formData.monument]);


  return (
    <div>

      <label>Upload CSV File:</label>
        <input
          type="file"
          name="files"
          accept=".csv"
          onChange={handleFileUpload}
      />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
          <div>
      <label>Monument*</label>
      <input        
        type="text"
        name="monument"
        placeholder='Monument'
        defaultValue={formData.monument}
        onChange={(e) => setFormData({ ...formData, monument: e.target.value })} 
      />
      </div>

       <div>
      <label>Easting*</label>
      <input
        type="text"
        name="eastingValue"
        placeholder='Easting'
        value={formData.eastingValue}
        onChange={(e) => handleChange(e)}
        required
      />
      </div>
      
      <div>
      <label>Northing*</label>
      <input
        type="text"
        name="northingValue"
        placeholder='Northing'
        value={formData.northingValue}
        onChange={(e) => handleChange(e)}
        required
      />
      </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <p>Number of points</p>
      <input style ={{width: '15%'}}
          type="text"
          name="numberOfPoints"
          value={numberOfPoints}
          onSelect={handleAddTieLine}
          onChange={(e) => setNumberOfPoints(e.target.value)}
          
      />
     
      
      </div>
      {formData.tieLines.map((tieLine, index) => (
        <div key={index} >
        <label>
        {index === 0
          ? 'Tie Line*'
        : `Point ${index}*`
      }
    </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <select
        style={{ width: '30%' }}
         name={`tieLines[${index}].c14`}
         value={tieLine.c14}
         placeholder='N/S'
          onChange={(e) => handleChange(e, index)}
             >
        <option value={null} placeholder='N/S'></option>
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
            placeholder='E/W'
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
      
      {/* <button type='button' onClick={calculateTieLine}>draw tie line</button>
      <textarea 
        rows={4}
        defaultValue={drawTieLine}
        
      /> */}
    </div>
  );
};

export default Plottingform;
