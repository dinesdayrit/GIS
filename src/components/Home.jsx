import LeafletMap from "./LeafletMap"
import React from "react";
import styles from './Home.module.css';

const Home = (props) => {
  return (
    <div className={styles.home}>
      <h2>Davao City</h2>
      <button className={styles.logoutButton} onClick={props.onLogout}>
        Logout
      </button>
      <div className={styles.mapWrapper}>
        <LeafletMap />
      </div>
    </div>
  );
};
export default Home;