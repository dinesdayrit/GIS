import LeafletMap from "./LeafletMap"
import React, { useState } from "react";
import styles from './Home.module.css';
import AddForm from './AddForm';
import EditForm from "./EditForm";
import HomeHeader from "./HomeHeader";

const Home = (props) => {
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);

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
  };

  const selectedDrawing = () => {
    setShowPopupForm(true);
  };

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const editOnCancel = () => {
    setShowEditForm(false);
  };

  const handleShapeClick = (clickedCoordinates) => {
    setSelectedCoordinates(clickedCoordinates);
    selectedDrawing();
  };

  return (
    <div className={styles.home}>
    <HomeHeader 
    onAddParcelClick={togglePopupForm}
    onLogoutClick={props.onLogout}
    />
     

      {showPopupForm && (
        <AddForm
          selectedCoordinates={selectedCoordinates}
          onFormSubmit={togglePopupForm}
          onDraw={handleDraw}
          onCustomCoordinatesChange={(coordinates) => setSelectedCoordinates(coordinates)}
        />
      )}
      {showEditForm && <EditForm editOnCancel={editOnCancel}/>}

      <div className={styles.mapWrapper}>
        <LeafletMap
          polygonCoordinates={polygonCoordinates}
          handleShapeClick={handleShapeClick}
          handleEditClick={handleEditClick}
          editOnCancel = {editOnCancel}
        />
      </div>
    </div>
  );
};

export default Home;
