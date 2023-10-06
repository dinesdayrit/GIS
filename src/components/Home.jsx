import LeafletMap from "./LeafletMap"
import React, { useState } from "react";
import styles from './Home.module.css';
import AddForm from './AddForm';
import EditForm from "./EditForm";
import HomeHeader from "./HomeHeader";
import ListofMonuments from "./ListOfMonuments";
import KmlUploadForm from "./KmlUploadForm";


const Home = (props) => {
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMonumentForm, setShowMonumentForm] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [tieLineCoordinates, setTieLineCoordinates] = useState([]);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const [plusCode, setPlusCode] = useState([]);
  const [selectedPolygonDetails, setSelectedPolygonDetails] = useState('');
  const [showKmlForm, setShowKmlForm] = useState(false);
  const [geojsonData, setGeojsonData] = useState('');


  const handleKMLUpload = (convertedGeoJSON) => {
    setGeojsonData(convertedGeoJSON);
    console.log('geojsonData', geojsonData);
  };



  const toggleKmlTable = () => {
    setShowKmlForm(true);
  };

  const closeKmlTable = () => {
    setShowKmlForm(false);
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
    console.log('click')
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
    setPlusCode("");
    

  };

  // const selectedDrawing = () => {
  //   setShowPopupForm(true);
  // };

  const handleEditClick = (polygonDetails) => {
    setSelectedPolygonDetails(polygonDetails);
    setShowEditForm(true);
    console.log("kani",selectedPolygonDetails);
  
  };



  const editOnCancel = () => {
    setShowEditForm(false);
  };

  
  const formOnCancel = () => {
    setShowPopupForm(false);
    setShowMonumentForm(false);
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

  return (
    <div className={styles.home}>
    <HomeHeader 
    onAddParcelClick={togglePopupForm}
    onLogoutClick={props.onLogout}
    formOnCancel = {formOnCancel}
    onMonumentClick ={showMonument}
    onKMLUpload={toggleKmlTable}
    />
     
      {showKmlForm && (
              <KmlUploadForm
                plusCode={plusCode}
                onKMLUpload={handleKMLUpload}
                closeKmlTable={closeKmlTable}
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
        


          />}


     {showMonumentForm && 
        <ListofMonuments
          

          />}

      <div className={styles.mapWrapper}>
        <LeafletMap
          polygonCoordinates={polygonCoordinates}
          handleShapeClick={handleShapeClick}
          handleEditClick={handleEditClick}
          editOnCancel = {editOnCancel}
          handlePlusCode ={handlePlusCode}
          tieLineCoordinates = {tieLineCoordinates}
          kmlData={geojsonData}
        />
      </div>
    </div>
  );
};

export default Home;
