import React, {useState, useEffect} from 'react';

const EditDrawForm = (props) => {
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
      const [monumentData, setMonumentData] = useState(null);
      const [drawTieLine, setDrawTieLine] = useState("");
      const [results, setResults] = useState([]);
      const [numberOfPoints, setNumberOfPoints] = useState('');
      const [isInitialRender, setIsInitialRender] = useState(true);

      useEffect(() => { 
        handleCalculate(); 
        calculateTieLine();
        const formattedResults = results.map(coord => `${coord.eastingCoordinate},${coord.northingCoordinate}`).join('\n'); 
        props.onGridCoordinatesChange(formattedResults);
        console.log('formattedResults',formattedResults);
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
      }, [formData, drawTieLine]); 


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
          const numPointsToAdd = parseInt(numberOfPoints) + 1;
        
          if (!isNaN(numPointsToAdd) && numPointsToAdd > 0) {
            const currentTieLines = formData.tieLines;
            const newTieLines = Array(numPointsToAdd).fill().map((_, index) => {
                const newIndex = index + currentTieLines.length + 1;
                return createTieLine(newIndex);
              });
        
            for (let i = 0; i < Math.min(numPointsToAdd, currentTieLines.length); i++) {
              newTieLines[i] = { ...currentTieLines[i] };
            }
        
            setFormData({
              ...formData,
              tieLines: newTieLines,
            });
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
          // console.log('Easting:', eastingValue);
          // console.log('Northing:', northingValue);
          // console.log('Easting Coordinate (First Tie Line):', eastingCoordinate);
          // console.log('Northing Coordinate (First Tie Line):', northingCoordinate);
      
          
          
      
          setDrawTieLine(
            `${eastingValue}, ${northingValue}\n` +
            `${eastingCoordinate}, ${northingCoordinate}`
            );
      
          
            // props.onTieLineCoordinates(drawTieLine);
            console.log("drawTieLine", drawTieLine);
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
        setMonumentData(matchingMonument);
      }
    })
    .catch((error) => {
      alert('Error fetching Monuments:', error);
    });
   }, [formData.monument]);

useEffect(() => {
  if (monumentData) {
    setFormData({
      ...formData,
      eastingValue: monumentData.easting,
      northingValue: monumentData.northing,
    });
  }
}, [monumentData]);
    return(
    <div style={{ border: '2px gray solid', padding: '10px', opacity: 0.2}}>
            WIP
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
            <div>
             <label>Monument</label>
             <input 
              type= 'text'
              name= 'monument'
              placeholder='Monument'
              defaultValue={formData.monument}
              onChange={(e) => setFormData({ ...formData, monument: e.target.value.toUpperCase() })}
              onInput={(e) => {
              e.target.value = e.target.value.toUpperCase();
              setFormData({ ...formData, monument: e.target.value.toUpperCase() });
           }}
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
           <input 
            style ={{width: '15%'}}
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
          required
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
            required
          />
          <input
            style={{width: '20%'}}
            type="text"
            name={`tieLines[${index}].e14`}
            value={tieLine.e14}
            onChange={(e) => handleChange(e, index)}
            required
          />
          <select
            style={{width: '30%'}}
            type="text"
            name={`tieLines[${index}].f14`}
            placeholder='E/W'
            value={tieLine.f14}
            onChange={(e) => handleChange(e, index)}
            required
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
            required
       
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
    
    </div>
    )
};

export default EditDrawForm;