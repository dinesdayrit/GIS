import React, {useState, useEffect} from "react";
import styles from "./AssignPinForm.module.css"
import axios from "axios";

const AssignPinForm = (props) => {
    const { polygonDetails } = props;
    const [title, setTitle] = useState('');
    const [titleDate, setTitleDate] = useState('');
    const [surveyNumber, setSurveyNumber] = useState('');
    const [lotNumber, setLotNumber] = useState('');
    const [blkNumber, setBlkNumber] = useState('');
    const [area, setArea] = useState('');
    const [boundary, setBoundary] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [oct, setOct ] = useState('');
    const [octDate, setOctDate] = useState('');
    const [tct, setTct] = useState('');
    const [tctDate, setTctDate] = useState('');
    const [pin, setPin] = useState('');
    const [brgycodes, setBrgycodes] = useState([]);
    const [selectedBrgy, setSelectedBrgy] = useState('');
    const [selectedBrgyCode, setSelectedBrgyCode] = useState('000');
    const [selectedDistrict, setSelectedDistrict] = useState('00');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
    const [selectedSectionCode, setSelectedSectionCode] = useState('000');
    const [selectedParcelCode, setSelectedParcelCode] = useState('');
    const [assignedPins, setAssignedPins] = useState([]);
    const [savedPin, setSavedPin] = useState('');
    const [isPinAssigned, setIsPinAssigned] = useState(false);
    const token =  localStorage.getItem('authToken');
    
    useEffect(() => {
      if (polygonDetails) {
        setTitle(polygonDetails.title);
        setTitleDate(polygonDetails.titleDate);
        setSurveyNumber(polygonDetails.surveyNumber);
        setLotNumber(polygonDetails.lotNumber);
        setBlkNumber(polygonDetails.blkNumber);
        setArea(polygonDetails.lotArea);
        setBoundary(polygonDetails.boundary);
        setOwnerName(polygonDetails.ownerName);
        setOct(polygonDetails.oct);
        setOctDate(polygonDetails.octDate);
        setTct(polygonDetails.tct);
        setTctDate(polygonDetails.tctDate);
      }
      }, [props.selectedCoordinates]);

      useEffect(() =>{
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
            (targetPin) => targetPin.title === title
            );
         
          
              if (matchingPin) {
                
                setSavedPin(matchingPin.pin);
                setPin(matchingPin.pin);
                setIsPinAssigned(true);
              } else if(!matchingPin){
                setSavedPin("NO ASSIGNED PIN YET");
                setIsPinAssigned(false);
              }

          })
          .catch((error) => {
            console.error('Error fetching PINS:', error);
            alert('Error fetching PINS:', error);
          });
       
      },[title])

    useEffect(() => {
        // Fetch brgycode data and set it in the brgycodes state
        fetch('/brgycode')
          .then((response) => response.json())
          .then((data) => {
            console.log('Fetched brgycode:', data);
            setBrgycodes(data);
    
            const matchingBrgycode = brgycodes.find(
            (targetBrgycode) => targetBrgycode.brgy === selectedBrgy
            );
            console.log('matchingBrgycode', matchingBrgycode);
          
              if (matchingBrgycode) {
                setSelectedBrgyCode(matchingBrgycode.brgycodelast3);
                setSelectedDistrict(matchingBrgycode.admindistrict);
                setSelectedDistrictCode(matchingBrgycode.districtcode);
              } 
    
              const generatedPin = `172-${selectedDistrictCode}-${selectedBrgyCode}-${selectedSectionCode}-${selectedParcelCode}`.trim();
              setPin(generatedPin);

              autoPopulateParcelCode();
          })
          .catch((error) => {
            console.error('Error fetching brgycodes:', error);
            alert('Error fetching brgycodes:', error);
          });
        
      

      }, [selectedBrgy, selectedBrgyCode , selectedSectionCode, selectedParcelCode]);

    
      const handleBrgyChange = (e) => {
        const selectedBrgyValue = e.target.value;
        setSelectedBrgy(selectedBrgyValue);
        autoPopulateParcelCode();
      };
      
      const autoPopulateParcelCode = () => {
        const inputPrefix = pin.substring(0, 15);
      
        const matchingPins = assignedPins.filter((pinParcel) =>
          pinParcel.pin.startsWith(inputPrefix)
        );
      
        if (matchingPins.length > 0) {
          const maxLastTwoDigits = matchingPins.reduce((max, pinParcel) => {
            const lastTwoDigits = parseInt(pinParcel.pin.substring(15, 17), 10);

            return lastTwoDigits > max ? lastTwoDigits : max;
          }, 0);
    
          const newLastTwoDigits = (maxLastTwoDigits + 1) % 100;

          if (newLastTwoDigits === 0) {
            alert('You have reached the maximum number of parcels in this section. Create a new section.');
          }
      
          const newLastTwoDigitsStr = newLastTwoDigits.toString().padStart(2, '0');
      
          setSelectedParcelCode(newLastTwoDigitsStr);
        } else {
          setSelectedParcelCode('01');
        }
      };
      
      

      const handleSubmit = (e) => {
        e.preventDefault();
      
        // Check if the PIN is already assigned
        fetch(`/checkPin/${pin}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.exists) {
              alert("Error: PIN is already assigned.");
            } else {
              // The PIN is not assigned, proceed with saving
              const formData = {
                pin: pin,
                plusCode: props.plusCode,
                title: title,
                titleDate: titleDate,
                surveyNumber: surveyNumber,
                lotNumber: lotNumber,
                blkNumber: blkNumber,
                area: area,
                boundary: boundary,
                ownerName: ownerName,
                oct: oct,
                octDate: octDate,
                tct: tct,
                tctDate: tctDate,
                status: 'For Approval',
              };
      
              // Save to rptas table
              fetch('/tmod', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
              })
                .then((res) => res.json())
                .then((data) => {
                  console.log(data, "New PIN Assigned");
                  if (data.status === "ok") {


                    // Update the status on title_table
                    fetch(`/approved/${polygonDetails.title}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        status: 'PIN ASSIGNED',
                      }),
                    })
                      .then((response) => response.json())
                      .then((data) => {
                        console.log(data);
                        alert('PIN ASSIGNED');
                        window.location.href = "/home";
                      })
                      .catch((error) => {
                        console.error('Error updating status:', error);
                      });
                  } else {
                    alert("Something went wrong");
                  }
                });
            }
          })
          .catch((error) => {
            console.error('Error checking PIN:', error);
          });
      };

      const updateStatusOnTitleTable = () => {
        // Update the status on title_table
  fetch(`/approved/${polygonDetails.title}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'PIN APPROVED',
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error('Error updating status:', error);
    });
      };


      const handleApprovePin = () => {
        updateStatusOnTitleTable();

        //update status on rptas table
        fetch(`/approvedpin/${savedPin}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'APPROVED',
          
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            alert('APPROVED ASSIGNED PIN');
            
          })
          .catch((error) => {
            console.error('Error updating PIN status:', error);
          });

      };

    return (
    <div className={styles['popup-form-container']}>
{isPinAssigned &&( 
<div style={{ border: '2px gray solid', padding: '10px', position: 'relative', marginTop: '30px' }}>
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
      PIN
      </p>
     <input 
        value={savedPin}
        readOnly
     />
     <button onClick={handleApprovePin}>APPROVE</button>
</div>
)}
    <form onSubmit={handleSubmit} >
     <div style={{ border: '2px gray solid', padding: '10px', position: 'relative', marginTop: '30px' }}>
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
      PIN
      </p>

    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>    
    
      <div>
        <p>Brgy*</p>
        <select
        name='brgy'
        onChange={handleBrgyChange}
        defaultValue= {selectedBrgy}
        
       
    >
      {brgycodes.map((targetBrgycode) => (
        <option key={targetBrgycode.id} value={targetBrgycode.brgy}>
          {targetBrgycode.brgy}
        </option>
      ))}
    </select>
      </div>

      <div style={{width: '70%'}}>
        <p>District*</p>
        <input 
          name='district'
          value={selectedDistrict}
          readOnly
       
        />
      </div>
      
      <div >
        <p>Section*</p>
        <input 
          name='section'
          onChange={(e) => setSelectedSectionCode(e.target.value)}
          
        />
      </div>

      <div>
        <p>Parcel*</p>
        <input 
          name='parcel'
          value={selectedParcelCode}
          onChange={(e) => setSelectedParcelCode (e.target.value)}
          
          
        />
      </div>
      
      </div> 

        
      <input 
          name='pin' 
          value={pin} 
          onChange={(e) => {
            setPin(e.target.value);
          }}
      />

    </div>


    <div style={{ border: '2px gray solid', padding: '10px', marginTop: '15px' }}>
      <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>Title no.*</label>
        <input
          type="text"
          name="title"
        value={title}
          readOnly
        />
         </div>
         <div>
         <label>Date</label>

        <input
        value={titleDate}
        readOnly
        />
        </div>
        </div>

        <label>Survey no.*</label>
        <input
          type="text"
          name="surveyNumber"
          value={surveyNumber}
         
        readOnly
        />
     <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
       <div>
      <label>Lot no.*</label>
    <input
      type="text"
      name="lotNumber"
      value={lotNumber}
     
      readOnly
    />
      </div>

       <div>
        <label>Blk no.*</label>
        <input
      type="text"
      name="blkNumber"
      value={blkNumber}
  
      readOnly
      />
      </div>
      <div>
      <label>Area (sq.m.)*</label> 
        <input
          type="text"
          name="area"
          value={area}
          readOnly

          />

      </div>
      </div>


      <label>Boundaries*</label>
      <textarea 
        rows={6}
        type="text"
        name="boundary"
        value={boundary}
        readOnly
      />
      

      <label>Owner Name*</label>
      <input
          type="text"
          name="ownerName"
          value={ownerName}
            readOnly
 />
      

      <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>OCT No.*</label>
        <input
          type="text"
          name="OCT"
        value={oct}
            readOnly
        />

         </div>
         <div>
         <label>Date</label>
        <input
        value={octDate}
        readOnly
        />
        </div>
        </div>

        <div className={styles.inputWrapper}>
      <div style={{width: '100%'}}>
        <label>Prev TCT No.*</label>
        <input
          type="text"
          name="tct"
        value={tct}
          readOnly
        />
         </div>
         <div>
         <label>Date</label>
        <input
        value={tctDate}
        readOnly
        />
        </div>
        </div>

        <label>Plus Code*</label>
        <input
          type="text"
          name="plusCode"
          value={props.plusCode}
          readOnly

        />
        </div>
    <div className={styles['button-wrapper']} style={{marginTop: "10px"}}>
        <button type="submit" style={{width: "40%"}}>SAVE</button>
    </div>
    </form>
    </div>
    )
}




export default AssignPinForm;

