import React, {useState} from 'react';

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


    return(
    <div style={{ border: '2px gray solid', padding: '10px', opacity: 0.5 }}>
            WIP

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
            <div>
             <label>Monument</label>
             <input />
           </div>
           <div>
             <label>Easting*</label>
             <input />
           </div>
           <div>
             <label>Northing*</label>
             <input />
           </div>
        
        </div>
    
    </div>
    )
};

export default EditDrawForm