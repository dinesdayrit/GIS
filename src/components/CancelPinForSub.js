import React, {useState, useEffect} from "react";
import axios from "axios";

const CancelPinForSub = (props) => {
const [pin, setPin] = useState('');
const [title, setTitle] = useState('');
const [surveyNumber, setSurveyNumber] = useState('');
const [pluscode, setPluscode] = useState('');
const [area, setArea] = useState('');
const [assignedPins, setAssignedPins] = useState([]);

useEffect (() => {
    axios.get('/tmod', {
        headers: {
          'x-api-key': 'thisIsOurTmodAPIKey',
        },
      })
        .then(response => response.data)
        .then((data) => {
          console.log('Fetched tmod:', data);
          setAssignedPins(data);

          const matchingPin = assignedPins.find(
            (targetPin) => targetPin.pin === pin
            );
            
    
              if (matchingPin) {
                setTitle(matchingPin.title)
                setSurveyNumber(matchingPin.surveynumber);
                setPluscode(matchingPin.pluscode);
                setArea(matchingPin.area);
              } else if(!matchingPin){
                setTitle("NO RECORD FOUND");
                setSurveyNumber("N/A");
                setPluscode("N/A");
                setArea("N/A");
              }
        });

props.PinToBeCancel(pin);
props.pluscodeToBeCancel(pluscode);
},[pin, title]);

useEffect (() => {
setPin(props.prevPintoCancel)
},[props.prevPintoCancel]);
 


return (
    <div>

     <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
        <div style={{width: '50%'}}>
          <label>PIN*</label>
          <input 
            value ={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>

        <div style={{width: '50%'}}>
          <label>Title</label>
          <input 
            value={title}
            readOnly
          />
        </div>
     </div>

     <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
        <div style={{width: '40%'}}>
          <label>Survey Number</label>
          <input 
            value={surveyNumber}
            readOnly
          />
        </div>

        <div style={{width: '40%'}}>
          <label>Plus Code</label>
          <input 
            value={pluscode}
            readOnly
          />
        </div>

        <div style={{width: '20%'}}>
          <label>Area</label>
          <input 
            value={area}
            readOnly
          />
        </div>
     </div>

    </div>
    );
};



export default CancelPinForSub;