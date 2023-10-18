import React, {useState, useEffect} from "react";
import styles from "./AssignPinForm.module.css"

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
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState('0');
    const [selectedSectionCode, setSelectedSectionCode] = useState('0');
    const [selectedParcelCode, setSelectedParcelCode] = useState('0');


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
          })
          .catch((error) => {
            console.error('Error fetching brgycodes:', error);
            alert('Error fetching brgycodes:', error);
          });
         
      
      }, [selectedBrgy, selectedBrgyCode,selectedBrgyCode , selectedSectionCode, selectedParcelCode]);
    
      const handleBrgyChange = (e) => {
        const selectedBrgyValue = e.target.value;
        setSelectedBrgy(selectedBrgyValue);
      };


    const handleSubmit = (e) =>{
      e.preventDefault();

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
  
      fetch('/tmod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "New PIN Assigned");
        if (data.status === "ok") {
          alert("New PIN Assigned");
         
        } else {
          alert("Something went wrong");
        }
      });

    };


    return (
    <div className={styles['popup-form-container']}>
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

