import React, {useEffect, useState } from "react";
import styles from './AssignedPinApproval.module.css'
import axios from "axios";

const AssignedPinApproval = (props) => {
    const [subdivide, setSubdivide] = useState(false);
    const [consolidate, setConsolidate] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPinsToApprove, setNewPinsToApprove] = useState([]);
    const [matchingPins, setMatchingPins] = useState([]);
    const [approveButton, setApproveButton] = useState(false);

    const handleRadioChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'Subdivide') {
        setSubdivide(true);
        setConsolidate(false);
        } else if (selectedValue === 'Consolidate'){
            setConsolidate(true)
            setSubdivide(false);
        }
      };

    useEffect(() => {
        axios.get('/pintable')
        .then(response => response.data)
        .then((data) => {
        setNewPinsToApprove(data)

    })
    .catch(error => {
        console.error("Error fetching pintable:", error);
    });
    },[]);

    const handlePrevPinSearch = () => {
        const matchingPinToCancel = newPinsToApprove.filter(
            (targetPin) => targetPin.prevpin === oldPin
        )

        setMatchingPins(matchingPinToCancel);
        setApproveButton(true);

    };

    return (
     <div className={styles['popup-form-container']}>
        <div style={{ border: '2px gray solid', padding: '10px', position: 'relative', marginTop: '30px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
    <p
        style={{
          position: 'absolute',
          top: '-10px',
          left: '10px',
          backgroundColor: 'whitesmoke',
          padding: '0 5px',
          marginBottom: '10px',
          fontSize:  '14px',
        }}
      >
      SELECT TYPE:
      </p>

      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>

 
      <label style={{display: 'flex', flexDirection: 'row', marginLeft: '10%' }}>
        <input type="radio" value="Subdivide" name="pinningType" onChange={handleRadioChange}/>
        Subdivide
      </label>


      <label  style={{display: 'flex', flexDirection: 'row', marginLeft: '40%'}}>
        <input type="radio" value="Consolidate" name="pinningType" onChange={handleRadioChange}/>
        Consolidate
      </label>
  
    </div>
   
    </div>


    {subdivide && (
        <div style={{ border: '2px gray solid', padding: '10px', marginTop: '30px' }}>
        <label>OLD PIN*</label>
        <div className={styles.inputWrapper}>
        <input 
          onChange={(e) => setOldPin(e.target.value)}
        />
        <button onClick={handlePrevPinSearch}>search</button>
        </div>

        <div>
        <table>
              <thead>
                <tr>
                  <th>PINS to Approve</th>
                </tr>
              </thead>
              <tbody>
                {matchingPins.map((matchingPin, index) => (
                  <tr key={index}>
                    <td>{matchingPin.newpin}</td>
                  </tr>
                ))}
              </tbody>
             
        </table>
        
        {approveButton && (
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        <button>APPROVE</button>
        </div>
        )}

        </div>

        </div>
    )}

    {consolidate && (
        <div>
        WIP
        </div>
    )}
     </div>
    )
}


export default AssignedPinApproval;