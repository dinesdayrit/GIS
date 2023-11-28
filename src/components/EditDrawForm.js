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
      // const [drawTieLine, setDrawTieLine] = useState("");
      const [numberOfPoints, setNumberOfPoints] = useState('');

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