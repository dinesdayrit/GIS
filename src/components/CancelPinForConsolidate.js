import React, {useState, useEffect} from "react";
import styles from "./AssignPinForm.module.css"
import axios from "axios";

const CancelPinForConsolidate = (props) => {
    const [pinInputs, setPinInputs] = useState([{ 
      oldPin: "", 
      title: "", 
      plusCode: "" 
    }]);
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
            });
    
    },[]);


    

    const addNewInput = () => {
        const newPinInputs = [...pinInputs, { oldPin: '', title: '', plusCode: ''}];
        setPinInputs(newPinInputs);
      };

      const handleInputChange = (index, field, value) => {
        const newInputs = [...pinInputs];
        newInputs[index][field] = value;
        setPinInputs(newInputs);
      };

      const updatePinInputs = () => {
        setPinInputs(prevInputs => {
          return prevInputs.map((input, index) => {
            const matchingPin = assignedPins.find(
              (targetPin) => targetPin.pin === input.oldPin
            );
  
            if (matchingPin) {
              return {
                ...input,
                title: matchingPin.title,
                plusCode: matchingPin.pluscode
              };
            } else {
              return {
                ...input,
                title: "NO RECORD",
                plusCode: "NO RECORD"
              };
            }
          });
        });
      };

      useEffect(() => {
        updatePinInputs();
        const oldPinValues = pinInputs.map(input => input.oldPin);
        //  console.log('pinsTOCancel', oldPinValues.join(','));
         props.PinToBeCancel(oldPinValues);
         const oldPluscodeValues = pinInputs.map(input => input.plusCode);
         props.pluscodeToBeCancel(oldPluscodeValues);
      }, [pinInputs.map(input => input.oldPin).join(','),pinInputs.map(input => input.plusCode).join(','), assignedPins]);

      useEffect(() => {
        if(props.prevPintoCancel.length > pinInputs.length) {
        setPinInputs((prevPinInputs) => {
          const newInputs = props.prevPintoCancel.map((value, index) => {  
            if (index < prevPinInputs.length) {
              return { ...prevPinInputs[index], oldPin: value };
            } else{
              return{
                oldPin: value
              }
            }
          });
          return newInputs;
        
        });
        } else {
          setPinInputs((prevPinInputs) => {
            return [
              ...prevPinInputs,
              {
                oldPin: "",
                title: "", 
                plusCode: "",
              },
            ];
          });

        }
      }, [props.prevPintoCancel]);

      const handleRemove = (indexToRemove) => {
        // Create a copy of the current ownerNames array and remove the element at the specified index
        const newPinInputs = pinInputs.filter((_, index) => index !== indexToRemove);
        setPinInputs(newPinInputs);
      };
    
    return(

        <div>
        <label>OLD PINS</label>

        {pinInputs.map((pinInput, index) => (
          <div key={index} className={styles.inputWrapper}>
              <input
                type='text'
                name='oldPin'
                style={{ width: '60%' }}
                placeholder="OLD PIN"
                value={pinInput.oldPin}
                onChange={(e) => handleInputChange(index, "oldPin", e.target.value)}
                
              />
              <input
                type='text'
                name='title'
                style={{ width: '40%' }}
                placeholder="TITLE"
                value={pinInput.title}
                onChange={(e) => handleInputChange(index, "title", e.target.value)}
                readOnly
              />
              <input
                type='text'
                name='plusCode'
                style={{ width: '40%' }}
                placeholder="PLUSCODE"
                value={pinInput.plusCode}
                onChange={(e) => handleInputChange(index, "plusCode", e.target.value)}
                readOnly
              />

            {index === pinInputs.length - 1 && <button onClick={() => handleRemove(index)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '1%', color: 'black', padding: '0' }}
            >
            X
            </button>}
            </div>
        ))}
        <button onClick={addNewInput}>+ PIN TO CANCEL</button>
      </div>
    );
}


export default CancelPinForConsolidate;