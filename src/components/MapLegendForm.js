import React from 'react';
import styles from './MapLegendForm.module.css'

const MapLegendForm = () => {
  return (
    <div className={styles.legend}>
      <h4 style={{color: "black", fontWeight: 'bold'}}>Legend</h4>
      <p style={{color: "red", fontWeight: 'bold'}}>RED - FOR APPROVAL</p>
      <p style={{color: "blue", fontWeight: 'bold'}}>BLUE - PLOT APPROVED</p>
      <p style={{color: "green", fontWeight: 'bold'}}>GREEN - PIN ASSIGNED</p>
    </div>
  );
};

export default MapLegendForm;

