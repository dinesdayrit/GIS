import React from 'react';
import styles from './MapLegendForm.module.css'

const MapLegendForm = () => {
  return (
    <div className={styles.legend}>
      <h4 style={{color: "black", fontWeight: 'bold'}}>Polygon Legend:</h4>

      <div style={{display: 'flex', marginBottom: '5px' }}>
      <span style={{background: 'red',color: "red", marginRight: '2px'}}>color</span>
      <p style={{color: "red", fontWeight: 'bold'}}> - FOR APPROVAL</p>
      </div>

      <div style={{display: 'flex', marginBottom: '5px' }}>
      <span style={{background: 'blue',color: "blue", marginRight: '2px'}}>color</span>
      <p style={{color: "BLUE", fontWeight: 'bold'}}> - PLOT APPROVED</p>
      </div>

      <div style={{display: 'flex', marginBottom: '5px' }}>
      <span style={{background: 'green',color: "green", marginRight: '2px'}}>color</span>
      <p style={{color: "green", fontWeight: 'green'}}> - PIN ASSIGNED</p>
      </div>
    </div>
  );
};

export default MapLegendForm;

