import LeafletMap from "./LeafletMap"
import React, { useState, useEffect, useRef  } from "react";
import styles from './Home.module.css';
import AddForm from './AddForm';
import EditForm from "./EditForm";
import HomeHeader from "./HomeHeader";
import ListofMonuments from "./ListOfMonuments";
import KmlUploadForm from "./KmlUploadForm";
import AssignPinForm from "./AssignPinForm";
import SignUpForm from "./SignUpForm";


const Home = (props) => {
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMonumentForm, setShowMonumentForm] = useState(false);
  const [showPinAssignForm, setShowPinAssignForm] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [tieLineCoordinates, setTieLineCoordinates] = useState([]);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [plusCode, setPlusCode] = useState('');
  const [selectedPolygonDetails, setSelectedPolygonDetails] = useState('');
  const [showKmlForm, setShowKmlForm] = useState(false);
  const [geojsonData, setGeojsonData] = useState('');
  const [plusCodes, setPlusCodes] = useState([]);
  const [isPolygonApproved, setIsPolygonApproved] = useState(false);
  const [pinAssign , setPinAssign] = useState('');
  const [selectedPolygonId, setSelectedPolygonId] = useState('');
  const leafletMapRef = useRef();
  const [showSignUpForm, setShowSignUpForm] = useState('');
 
  useEffect(() => {
    if (selectedPolygonId) {
        leafletMapRef.current.zoomToPolygon(selectedPolygonId);
    }
  }, [selectedPolygonId]);


const handleAssignPin = (savedPin) => {
  setPinAssign(savedPin);
  // console.log('naClick PIN', savedPin);
}

  const handleKMLUpload = (convertedGeoJSON) => {
    setGeojsonData(convertedGeoJSON);
    // console.log('geojsonData', convertedGeoJSON);
  };

  const handlePlusCodesUpdate = (plusCodes) => {
    setPlusCodes(plusCodes);
  };
  
  const toggleKmlTable = () => {
    setShowKmlForm(true);
  };

  const toggleSignUpForm = () => {
    setShowSignUpForm(!showSignUpForm);
  };

  const handleTieLineDraw = (coordinates) => {
    console.log('click')
    try {
      const parsedCoordinates = JSON.parse(coordinates);
      if (Array.isArray(parsedCoordinates) && parsedCoordinates.length >= 0) {
        setTieLineCoordinates(parsedCoordinates);
      } else {
        alert('Please enter valid Tie Line coordinates.');
      }
    } catch (error) {
      alert('Please enter valid tae Line coordinates.');
    }
  };


  const handleDraw = (coordinates) => {
    // console.log('click')
    try {
      const parsedCoordinates = JSON.parse(coordinates);
      if (Array.isArray(parsedCoordinates) && parsedCoordinates.length >= 3) {
        setPolygonCoordinates(parsedCoordinates);
      } else {
        alert('Please enter valid coordinates.');
      }
    } catch (error) {
      alert('Please enter valid coordinates.');
    }
  };

  const togglePopupForm = () => {
    setShowPopupForm(!showPopupForm);
  };


  const handleEditClick = ()=> {
   
    setShowEditForm(true);
  };

  const handleSearchTitle = (polygonId) => {
    console.log('polygonId', polygonId);
    setSelectedPolygonId(polygonId); 
    
  };
  
  const parcelDetails = (polygonDetails) => {
    setSelectedPolygonDetails(polygonDetails);
    console.log("kani",selectedPolygonDetails)
  }

  const editOnCancel = () => {
    setShowEditForm(false);
  };

  const handlePinClick = () => {
    setShowPinAssignForm(true);
    console.log("click PIN");
  };


  
  const formOnCancel = () => {
    setShowPopupForm(false);
    setShowMonumentForm(false);
    setShowPinAssignForm(false);
    setShowMonumentForm(false);
    setShowKmlForm(false);
    setShowEditForm(false);
    setShowSignUpForm(false);
  };

  const handleShapeClick = (clickedCoordinates) => {
    setSelectedCoordinates(clickedCoordinates);
    // console.log("mao ni" + clickedCoordinates);
    // selectedDrawing();
    
  };

  const handlePlusCode = (clickedplusCode) => {
    setPlusCode(clickedplusCode);
  }

  const showMonument = () =>{
    setShowMonumentForm(true);
  }

  const handlePolygonApproval = () => {
    setIsPolygonApproved(true);
    console.log("handlePolygonApproval sa home", isPolygonApproved)
  };



  return (
    <div className={styles.home}>

    <HomeHeader 
    onAddParcelClick={togglePopupForm}
    onLogoutClick={props.onLogout}
    formOnCancel = {formOnCancel}
    onMonumentClick ={showMonument}
    onKMLUploadClick={toggleKmlTable}
    onAssignPinClick= {handlePinClick}
    onEditFormOpen = {handleEditClick}
    onToggleSignUpForm={toggleSignUpForm}
   
    />
     
      {showKmlForm && (
            <KmlUploadForm
              plusCode={plusCode}
              plusCodes={plusCodes}
              handlePlusCode ={handlePlusCode}
              onKMLUpload={handleKMLUpload}
              geojson={geojsonData}
              handleShapeClick={handleShapeClick}
              handlePlusCodesUpdate={handlePlusCodesUpdate}
          />
              )}

      {showPopupForm && (
        <AddForm
          selectedCoordinates={selectedCoordinates}
          plusCode = {plusCode}
          onFormSubmit={togglePopupForm}
          onDraw={handleDraw}
          onCustomCoordinatesChange={(coordinates) => setSelectedCoordinates(coordinates)}
          handleShapeClick={handleShapeClick}
          handlePlusCode ={handlePlusCode}
          onTieLineDraw={handleTieLineDraw}  
          
        />
      )}
      {showEditForm && 
        <EditForm 
          editOnCancel={editOnCancel}
          polygonDetails={selectedPolygonDetails}
          selectedCoordinates={selectedCoordinates}
          handleShapeClick={handleShapeClick}
          plusCode = {plusCode}
          // polygonId={selectedPolygonDetails.id}
          onPolygonApproval={handlePolygonApproval}
          onSearchTitle={handleSearchTitle}
       
  
        


          />}


     {showMonumentForm && 
        <ListofMonuments
          

          />}

    {showPinAssignForm && 
        <AssignPinForm
            polygonDetails={selectedPolygonDetails}
            selectedCoordinates={selectedCoordinates}
            plusCode = {plusCode}
            handleAssignPin = {handleAssignPin}
          
          />}

        {showSignUpForm && 
              <SignUpForm 
              
              
                />}

      <div className={styles.mapWrapper}>
        <LeafletMap
          polygonCoordinates={polygonCoordinates}
          handleShapeClick={handleShapeClick}
          // handleEditClick={handleEditClick}
          parcelDetails = {parcelDetails}
          editOnCancel = {editOnCancel}
          handlePlusCode ={setPlusCode}
          tieLineCoordinates = {tieLineCoordinates}
          kmlData={geojsonData}
          onPlusCodesUpdate={handlePlusCodesUpdate}
          isPolygonApproved={isPolygonApproved}
          handleAssignPin={pinAssign}
          selectedPolygonId={selectedPolygonId}
          leafletMapRef={leafletMapRef}
          
       
        />
      </div>
    </div>
  );
};

export default Home;
