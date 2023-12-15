import React, {useState, useEffect} from "react";
import styles from "./AssignPinForm.module.css"
import axios from "axios";
import CancelPinForSub from "./CancelPinForSub";
import CancelPinForConsolidate from "./CancelPinForConsolidate";

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
    const [origPin, setOrigPin] = useState('');
    const [districts, setDistricts] = useState([]);
    const [brgycodes, setBrgycodes] = useState([]);
    const [selectedBrgy, setSelectedBrgy] = useState('');
    const [selectedBrgyCode, setSelectedBrgyCode] = useState('000');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState('00');
    const [selectedSectionCode, setSelectedSectionCode] = useState('000');
    const [selectedParcelCode, setSelectedParcelCode] = useState('');
    const [assignedPins, setAssignedPins] = useState([]);
    const [savedPin, setSavedPin] = useState('');
    const [pinStatus, setPinStatus] = useState('');
    const [isPinAssigned, setIsPinAssigned] = useState(false);
    const [isPolygonApproved, setIsPolygonApproved] = useState(false);
    const [isPinApproved, setIsPinApproved] = useState(false);
    const [isAdmin, setIsAdmin] = useState(true);
    const [type, setType] = useState('');
    const [isForSub, setIsforSub] = useState(false);
    const [isForConsolidate, setIsForConsolidate]  = useState(false);
    const [isForNewDec, setIsForNewDec] = useState(true);
    const [prevPinToCancel, setPrevPinToCancel] = useState('');
    const token =  localStorage.getItem('authToken');
    const [isLoading, setIsLoading] = useState(false);
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));

    useEffect(() => {
      const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));
      if (storedUserDetails && storedUserDetails.role === "user") {
        setIsAdmin(false);
       
      }

     
    }, []);

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
            
      if (polygonDetails.status === 'PIN APPROVED'){
        setIsPinApproved(true);
      } else {
        setIsPinApproved(false);
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
            setAssignedPins(data);
    
            const matchingPin = assignedPins.find(
            (targetPin) => targetPin.pluscode === props.plusCode
            );
            
    
              if (matchingPin) {
                setPinStatus(matchingPin.status)
                setSavedPin(matchingPin.pin);
                setPin(matchingPin.pin);
                setIsPinAssigned(true);

                if(matchingPin.type === "Subdivide") {
                  setIsforSub(true);
                  setIsLoading(true);
                  setType('Subdivide');
                  axios.get('/pintable')
                    .then(response => response.data)
                    .then((data) => {
                      
                      const matchingPinToCancel = data.find(
                        (targetPin) => targetPin.newpin === savedPin
                        
                      );
                      if (matchingPinToCancel) {
                        setIsLoading(false);
                        setPrevPinToCancel(matchingPinToCancel.prevpin);
                       
                        
                      }
                      
                   })
                     .catch(error => {
                      console.error("Error fetching pintable:", error);
                   });
                } else {
                  setIsforSub(false);
                  setPrevPinToCancel('');
                  setType('');
                }

              } else if(!matchingPin){
                setSavedPin("NO ASSIGNED PIN YET");
                setIsPinAssigned(false);
              }
  
          })
          .catch((error) => {
            console.error('Error fetching PINS:', error);
            alert('Error fetching PINS:', error);
          });
          if (polygonDetails.status === 'APPROVED' || polygonDetails.status === 'PIN ASSIGNED' || polygonDetails.status === 'PIN APPROVED') {
            setIsPolygonApproved(true);
            }else{
              setIsPolygonApproved(false);
      
            }
          autoPopulateParcelCode();
       
      },[props.plusCode, savedPin])

      useEffect(() =>{
        axios.get('/GisDetail', {
          headers: {
            Authorization: `Bearer ${token}`
          },
        })
          .then(response => response.data)
          .then((data) => {
    
            const matchingPluscode = data.find(
              (targetPluscode) => targetPluscode.pluscode === props.plusCode
            )
    
            if (matchingPluscode){
              if(matchingPluscode.status === 'PIN APPROVED'){
                setIsPinApproved(true)
            } else {
              setIsPinApproved(false)
            }
          }
          })
          .catch((error) => {
            console.error('Error fetching PINS:', error);
            alert('Error fetching PINS:', error);
          });
    
       
      },[props.plusCode])

    const fecthTmod = () => {
      axios.get('/tmod', {
        headers: {
          'x-api-key': 'thisIsOurTmodAPIKey',
        },
      })
        .then(response => response.data)
        .then((data) => {
          console.log('Fetched tmod:', data);
          setAssignedPins(data);
  
        });

    }
      

   useEffect(() => {
      
        // Fetch brgycode data and set it in the districts state
        fetch('/brgycode')
          .then((response) => response.json())
          .then((data) => {
            console.log('Fetched data:', data);
            setDistricts(data);
    
            const matchingDistricts = districts.filter(
            (targetDistrict) => targetDistrict.admindistrict === selectedDistrict
            );
            console.log('matchingDistricts', matchingDistricts);
          

       
            if (matchingDistricts.length > 0) {
              // const brgycodes = matchingDistricts.map((district) => district.brgy);
              setBrgycodes(matchingDistricts);
              console.log('matchingDistrictsnaa', brgycodes);
              const matchingBrgy = brgycodes.find(
                      (targetBrgycode) => targetBrgycode.brgy === selectedBrgy
                      );

               if (matchingBrgy) {
                    setSelectedBrgyCode(matchingBrgy.brgycodelast3);
                    setSelectedDistrictCode(matchingBrgy.districtcode);
                } 

          }
          
    
              const generatedPin = `172-${selectedDistrictCode}-${selectedBrgyCode}-${selectedSectionCode}-${selectedParcelCode}`.trim();
              setPin(generatedPin);

             
          })
          .catch((error) => {
            console.error('Error fetching brgycodes:', error);
            alert('Error fetching brgycodes:', error);
          });
        
      

      }, [selectedBrgy, selectedBrgyCode ,selectedDistrict , selectedDistrictCode ,selectedSectionCode, selectedParcelCode, props.plusCode]);

      

    useEffect(() =>{
      autoPopulateParcelCode();
    }, [pin, title, props.selectedCoordinates, props.plusCode]);

      const handleBrgyChange = (e) => {
        const selectedBrgyValue = e.target.value;
        setSelectedBrgy(selectedBrgyValue);
        autoPopulateParcelCode();
      };
      
      const autoPopulateParcelCode = () => {
        const inputPrefix = pin.substring(0, 16);
      
        const matchingPins = assignedPins.filter((pinParcel) =>
          pinParcel.pin.startsWith(inputPrefix)
        );
      
        if (matchingPins.length > 0) {
          const maxLastTwoDigits = matchingPins.reduce((max, pinParcel) => {
            const lastTwoDigits = parseInt(pinParcel.pin.substring(16, 18), 10);

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
                districtCode: selectedDistrictCode,
                brgyCode: selectedBrgyCode,
                sectionCode: selectedSectionCode,
                parcelCode: pin.slice(-2),
                RPTGeoCode:`${selectedDistrictCode}${selectedBrgyCode}-${props.plusCode}-${selectedSectionCode}${pin.slice(-2)}`,
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
                username: storedUserDetails.name,
                type: type,
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
                    fetch(`/approved/${polygonDetails.id}`, {
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
                        sendDataToPinTable();
                        alert('PIN ASSIGNED');
                        // window.location.href = "/home";
                        fecthTmod();
                        setIsPinAssigned(true);
                        setSavedPin(pin);
                        props.handleAssignPin(props.plusCode);
                   
                       
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
  fetch(`/approved/${polygonDetails.id}`, {
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

  const sendDataToSMV = async  () => {
    const formData = {
      rpt_geo_code: props.plusCode,
      pin : savedPin,
    }
  
    
    try {
      const response = await axios.post('/insertSMV', formData);
      console.log(response.data);
    } catch (error) {
    
      console.error('Error sending data to SMV:', error);
   
    }
  }

      const handleApprovePin = () => {
        
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
            updateStatusOnTitleTable();
            sendDataToSMV();
            setIsPinApproved(true);
          })
          .catch((error) => {
            console.error('Error updating PIN status:', error);
          });

      };

      //handle Pin Return
      const handleReturn = () => {
        fetch(`/approvedpin/${savedPin}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'RETURNED',
          
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            alert('RETURNED');
          })
          .catch((error) => {
            console.error('Error updating PIN status:', error);
          });

      }

      const handleDeletePin = () => {
      //add function to delete the PIN
       if (window.confirm("Are you sure you want to delete this PIN?")) {
        axios.delete(`/deletePin/${savedPin}`,{
         headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
           },
       })
        .then((response) => {
          if (response.status === 200) {
            alert("PIN has been deleted successfully.");
            fecthTmod();
          } else {
            alert("Failed to delete the PIN. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error deleting PIN:", error);
          alert("Error deleting PIN " + savedPin + ". Please try again.");
        });
    }
        //update the status back to APPROVED on title_table
        fetch(`/approved/${polygonDetails.id}`, {
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
          })
          .catch((error) => {
            console.error('Error updating status:', error);
          });
            
      
        setIsPinAssigned(false);
        
      }

      const handleRadioChange = (e) => {
        const selectedValue = e.target.value;
    
        if (selectedValue === 'Subdivide') {
          setIsforSub(true);
          setIsForNewDec(false);
          setIsForConsolidate(false);
          setType('Subdivide')
        } else if (selectedValue === 'NewDec'){
          setIsforSub(false);
          setIsForConsolidate(false);
          setIsForNewDec(true);
          setType('NewDec');
          setPinToCancel('NewDec');
          setPluscodeToCancel('NewDec');
        } else if (selectedValue === 'Consolidate'){
          setIsforSub(false);
          setIsForNewDec(false);
          setIsForConsolidate(true);
          setType('Consolidate');
        }
      };

      const [pinToCancel, setPinToCancel] = useState ('')
      const [pluscodeToCancel, setPluscodeToCancel] = useState ('')

      const handlePinToCancelChange = (pinToCancel) => {
        setPinToCancel(pinToCancel);
      };

      const handlePluscodeToCancelChange = (plusCodeToCancel) => {
        setPluscodeToCancel(plusCodeToCancel);
      };
     
      const sendDataToPinTable = async () => {

        const formData = {
          newpin: pin,
          pluscode : props.plusCode,
          prevpin: pinToCancel,
          prevpluscode: pluscodeToCancel,
          status: 'FOR APPROVAL'
        }
      
        
        try {
          const response = await axios.post('/pintable', formData);
          console.log(response.data);
        } catch (error) {
        
          console.error('Error sending data to SMV:', error);
       
        }
      };

    return (
    
    <div className={styles['popup-form-container']}>
    
    <h2 style={{marginBottom: '1rem', fontWeight: 'bold', color: '#3e8e41'}}>Pin Approval/Assign</h2>
    {isPolygonApproved ?(
    <>
    {!isPinApproved && (
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

 
      <label style={{display: 'flex', flexDirection: 'row', marginLeft: '5%'}}>
        <input type="radio" value="NewDec" name="pinningType" onChange={handleRadioChange} checked={isForNewDec}/>
        NEW DISCOVERY
      </label>


 
      <label style={{display: 'flex', flexDirection: 'row', marginLeft: '20%' }}>
        <input type="radio" value="Subdivide" name="pinningType" onChange={handleRadioChange} checked={isForSub}/>
        SUBDIVIDE
      </label>


  
      <label  style={{display: 'flex', flexDirection: 'row', marginLeft: '20%'}}>
        <input type="radio" value="Consolidate" name="pinningType" onChange={handleRadioChange} checked={isForConsolidate}/>
        CONSOLIDATE
      </label>
  
    </div>
   
    </div>
    )}
    {isForSub && !isPinApproved &&( 
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
          color: 'red',
        }}
      >
      PIN TO CANCEL
      </p>

    {isLoading ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30%' }}>
      <i className="fa-solid fa-spinner fa-spin fa-spin-reverse" style={{ fontSize: '40px' }}></i>
      </div>
    
    ): ( 
      <CancelPinForSub 
      PinToBeCancel = {handlePinToCancelChange}
      pluscodeToBeCancel = {handlePluscodeToCancelChange}
      prevPintoCancel = {prevPinToCancel}
      isLoading = {isLoading}
    />
      )}
    </div>
    )}

    {isForConsolidate && (
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
          color: 'red',
        }}
      >
      PINS TO CANCEL
      </p>
      <CancelPinForConsolidate />

      </div>
    )}

    
      
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

     <div className={styles['button-wrapper']}>
        
     {isAdmin ? (
       <>

       {!isPinApproved && !isForSub ? (
         <>
      <button onClick={handleApprovePin}>APPROVE</button>
      <button  style={{ backgroundColor: 'red'}} onClick={handleReturn}>return</button>
      </>
      ) : !isPinApproved &&(
        <p style={{color: 'red'}}>USE PIN APPROVAL(SUBDIVIDE) MENU TO APPROVE</p>
      )}

     </>
     ) : (
      <label>Status: {pinStatus}</label>
    )}

    {!isPinApproved && (
     <button onClick={handleDeletePin} style={{ backgroundColor: 'red'}}><i className="fa-solid fa-trash-can"></i></button>
    )}
</div>

  </div>
  
)}


    <form onSubmit={handleSubmit} >
  {!isPinAssigned &&(
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
          color: 'green',
        }}
      >
      NEW PIN
      </p>

    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>    
    
    <div >
        <p>District*</p>
        <select
          name='district'
          defaultValue= {selectedDistrict}   
          onChange={(e) => setSelectedDistrict(e.target.value)}
          
        >
        <option value="Select District">Select District</option>
        <option value="Poblacion">Poblacion</option>
        <option value="Agdao">Agdao</option>
        <option value="Baguio">Baguio</option>
        <option value="Buhangin">Buhangin</option>
        <option value="Bunawan">Bunawan</option>
        <option value="Calinan">Calinan</option>
        <option value="Marilog">Marilog</option>
        <option value="Paquibato">Paquibato</option>
        <option value="Talomo">Talomo</option>
        <option value="Toril">Toril</option>
        <option value="Tugbok">Tugbok</option>
   
        </select>
      </div>
      <div >

        <p>Brgy*</p>
        <select
        name='brgy'
        onChange={handleBrgyChange}
        defaultValue= {selectedBrgy}    
    >

      <option value="Select Brgy">Select Brgy</option>
      {brgycodes.map((targetBrgycode) => (
        <option key={targetBrgycode.id} value={targetBrgycode.brgy}>
          {targetBrgycode.brgy}
        </option>
      ))}
    </select>

      </div>

    
      
      <div >
        <p>Section*</p>
        <input 
          name='section'
          defaultValue= {selectedSectionCode}  
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

      <label>Original PIN(amellar PIN)</label>
      <input
          name='origPin'
          value={origPin}
          onChange={(e) => {
            setOrigPin(e.target.value)
          }}
      />

    </div>
    
  )}



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
    {!isPinApproved && !isPinAssigned &&(
        <button type="submit" style={{width: "40%"}}>SAVE</button>
        )}
    </div>
    </form>
    </>
  ) : (
    // Display this if isPolygonApproved is false
    <div style={{alignItems: 'center', color: 'red'}}>SELECT AN APPROVED PARCEL</div>
  )
    }

    </div>

  
    )
}




export default AssignPinForm;

