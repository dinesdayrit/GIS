import LeafletMap from "./LeafletMap"
import React, {useState} from "react";
import styles from './Home.module.css';
import PopupForm from './PopupForm';

const Home = (props) => {
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);

  const togglePopupForm = () => {
    setShowPopupForm(!showPopupForm);
  };
  const selectedDrawing = () => {
    setShowPopupForm('true');
  }
  const handleShapeClick = (clickedCoordinates) => {
    setSelectedCoordinates(clickedCoordinates);
    selectedDrawing();
  };

  return (
    <div className={styles.home}>
      <h2>Davao City</h2>
      <button className={styles.addButton} onClick={togglePopupForm}>
        Add
      </button>
      <button className={styles.logoutButton} onClick={props.onLogout}>
        Logout
      </button>
      {showPopupForm && (
        <PopupForm
          selectedCoordinates={selectedCoordinates}
          onFormSubmit={togglePopupForm}
        />
      )}
      <div className={styles.mapWrapper}>
        <LeafletMap handleShapeClick={handleShapeClick} />
      </div>

    </div>
  );
};
export default Home;