import React, { useEffect, useState } from 'react';
import styles from './ListofMonuments.module.css';


const ListofMonuments = (props) => {
  const [monuments, setMonuments] = useState([]);

  useEffect(() => {
    fetch('/monuments')
      .then((response) => response.json())
      .then((fetchedMonuments) => {
        setMonuments(fetchedMonuments);
      });
  }, []);

  return (
    <div className={styles['popup-form-container']}>
      <h3 style={{marginBottom: '1rem', fontWeight: 'bold', color: '#3e8e41'}}>List of Monuments</h3>
      <br/>
      {/* <div style={{marginBottom: '10px', gap: '5px'}}>
        <label>Search Monument: </label>
        <input />
      </div> */}
      <table >
        <thead>
          <tr>
            <th>Monument</th>
            <th>Easting</th>
            <th>Northing</th>
          </tr>
        </thead>
        <tbody>
          {monuments.map((monumentData, index) => (
            <tr key={index}>
              <td>{monumentData.monument}</td>
              <td>{monumentData.easting}</td>
              <td>{monumentData.northing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListofMonuments;
