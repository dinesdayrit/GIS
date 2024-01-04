import React, {useEffect, useState } from "react";
import styles from './AssignedPinApproval.module.css'
import axios from "axios";

const AssignedPinApproval = (props) => {
    // const [subdivide, setSubdivide] = useState(false);
    // const [consolidate, setConsolidate] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPinsToApprove, setNewPinsToApprove] = useState([]);
    const [matchingPins, setMatchingPins] = useState([]);
    const [approveButton, setApproveButton] = useState(false);
    const [searchDataToZoom, setSearchDataTozoom] = useState('');
    const [pluscodeToCancel, setPluscodeToCancel] = useState('');
    const [status, setStatus] = useState('');
    const token =  localStorage.getItem('authToken');

    // const handleRadioChange = (e) => {
    //     const selectedValue = e.target.value;
    
    //     if (selectedValue === 'Subdivide') {
    //     setSubdivide(true);
    //     setConsolidate(false);
    //     } else if (selectedValue === 'Consolidate'){
    //         setConsolidate(true)
    //         setSubdivide(false);
    //     }
    //   };

  useEffect(() => {
        axios.get('/pintable')
        .then(response => response.data)
        .then((data) => {
          const pinsToApprove = data.filter(pin => pin.status === 'FOR APPROVAL' || pin.status === 'RETURNED');
          setNewPinsToApprove(pinsToApprove);

    })
    .catch(error => {
        console.error("Error fetching pintable:", error);
    });

    
    const matchingOldPinSearch = newPinsToApprove.find(
    (search) => search.prevpin === oldPin
    );

    if(matchingOldPinSearch) {
      setPluscodeToCancel(matchingOldPinSearch.prevpluscode)
    }

    

    },[oldPin]);

  useEffect(() => {
      axios.get('/gisDetail', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => response.data)
      .then((data) => {
        setSearchDataTozoom(data);
  })
  .catch(error => {
      console.error("Error fetching pintable:", error);
  });


  },[oldPin]);


    const handlePrevPinSearch = () => {
      //zoom to parcel
      const matchingSearch = searchDataToZoom.find(
        (search) => search.pluscode === pluscodeToCancel

      );

      if(matchingSearch){
        props.onSearchTitle(matchingSearch.id)

      }else {
        alert('NO PARCEL TO ZOOM');
        setApproveButton(false);
      }


      const matchingPinToCancel = newPinsToApprove.filter(
            (targetPin) => targetPin.prevpin === oldPin
        )
        // console.log('matchingPinToCancel', newPinsToApprove)
      if(matchingPinToCancel) {
        setMatchingPins(matchingPinToCancel);
        setApproveButton(true);
      } else {
        setApproveButton(false);
        alert('NO DATA FOUND');
        
      }
    };
  
  const updateStatusOnTitleTable = () => {
    const titlesToApprove = matchingPins.map((matchingPin) => matchingPin.pluscode);
    
    axios.put('/approveTitles', { titlesToApprove})
    .then((response) => {
      console.log(response.data);
      alert('APPROVED Titles');

    })
    .catch((error) => {
      console.error('Error approving pins:', error);
    });
    
  };

const updateTitleToCancelOnTitleTable = () => {
  const titleToBeCancel = matchingPins.find(
    (matchingPin) => matchingPin.prevpluscode);
   const titleToCancel = titleToBeCancel.prevpluscode

  axios.put('/cancelTitle', {titleToCancel})
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error('Error approving pins:', error);
    });
};

  const pintoCancel = () =>{
    //update status on rptas table
    fetch(`/approvedpin/${oldPin}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'CANCELLED',
      
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error('Error updating PIN status:', error);
      });

  };

  const handleApproveClick = () => {
    const pinsToApprove = matchingPins.map((matchingPin) => matchingPin.newpin);

  // Send the list of pins to the backend
  axios.put('/approvePins', { pinsToApprove})
    .then((response) => {
      console.log(response.data);
      pintoCancel();
      updateStatusOnTitleTable();
      updateTitleToCancelOnTitleTable();
      sendDataToSMV();
      setApproveButton(false);
      setStatus('APPROVED');
      alert('APPROVED PINS');
    })
    .catch((error) => {
      console.error('Error approving pins:', error);
    });
    };

    const handleReturn = () => {

      const pinsToReturn = matchingPins.map((matchingPin) => matchingPin.newpin);

      // Send the list of pins to the backend
      axios.put('/returnPins', { pinsToReturn})
        .then((response) => {
          console.log(response.data);
          setApproveButton(false);
          alert('RETURNED');
          setStatus('RETURNED');
        })
        .catch((error) => {
          console.error('Error returning pins:', error);
        });
        };


        const sendDataToSMV = async () => {
          const pinsToApprove = matchingPins.map((matchingPin) => matchingPin.newpin);
          const pluscodesToApprove = matchingPins.map((matchingPin) => matchingPin.pluscode);
        
          if (pinsToApprove.length !== pluscodesToApprove.length) {
            console.error('Error: pinsToApprove and pluscodesToApprove arrays must have the same length.');
            return;
          }
        
          for (let i = 0; i < pinsToApprove.length; i++) {
            const formData = {
              rpt_geo_code: pluscodesToApprove[i],
              pin: pinsToApprove[i],
            };
        
            try {
              const response = await axios.post('/insertSMV', formData);
              console.log(response.data);
            } catch (error) {
              console.error('Error sending data to SMV:', error);
            }
          }
        };

    return (
     <div className={styles['popup-form-container']}>

      <h2 style={{marginBottom: '1rem', fontWeight: 'bold', color: '#3e8e41'}}>PIN Approval(SUBDIVIDE)</h2>
        {/* <div style={{ border: '2px gray solid', padding: '10px', position: 'relative', marginTop: '30px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
 */}

    {/* {subdivide && ( */}
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
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {matchingPins.map((matchingPin, index) => (
                  <tr key={index}>
                    <td>{matchingPin.newpin}</td>
                    <td>{matchingPin.status}</td>
                  </tr>
                ))}
              </tbody>

             
        </table>
        
        {approveButton ? (
        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '5px'}}>
        <button 
          onClick={handleApproveClick}
        >APPROVE</button>

        <button 
          style={{backgroundColor: 'red', marginLeft: '5px'}}
          onClick={handleReturn}
        >RETURN</button>
        </div>
        ):(
          <label style={{display: 'flex', justifyContent: 'flex-end', marginTop: '5px'}}>{status}</label>
        )}

        </div>

        </div>
    {/* )} */}
{/* 
    {consolidate && (
        <div>
        WIP
        </div>
    )} */}
     </div>
    )
}


export default AssignedPinApproval;