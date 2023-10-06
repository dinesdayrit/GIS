import React, { useState, useEffect } from 'react';
import styles from './KmlUploadForm.module.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import toGeoJSON from 'togeojson';

const KmlUploadForm = (props) => {
    const [kmlDetailsSaved, setKmlDetailsSaved] = useState(false);
    const [tableRows, setTableRows] = useState([]);
    const [extractedData, setExtractedData] = useState(null);
    const [extractedCoordinates, setExtractedCoordinates] = useState([]);
    const [editableData, setEditableData] = useState([]);
    const [editedData, setEditedData] = useState({});

    useEffect(() => {
      if (extractedData && extractedData.length > 0) {
        setEditableData([...extractedData]);
      }
    }, [extractedData]);

    // const handleKMLUpload = (e) => {
    //   const file = e.target.files[0];
    //   if (file) {
    //     const reader = new FileReader();
    //     reader.onload = (event) => {
    //       try {
    //         const kmlData = event.target.result;
    //         const convertedGeoJSON = toGeoJSON.kml(new DOMParser().parseFromString(kmlData, 'text/xml'));
    //         props.onKMLUpload(convertedGeoJSON);
    //         const coordinates = extractCoordinatesFromGeoJSON(convertedGeoJSON);
    //         console.log('kani ang convert', coordinates);
            
    //         const { extractedData, extractedCoordinates, headerNames } = extractKMLData(kmlData);
    //         setExtractedData(extractedData);
    //         setExtractedCoordinates(extractedCoordinates);
    //         const rows = generateTableRows(extractedData, headerNames);
    //         setTableRows(rows);
    //       } catch (error) {
    //         console.error('Error processing KML data:', error);
    //       }
    //     };
    //     reader.readAsText(file);
    //   }
    // };

    const handleKMLUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const kmlData = event.target.result;
            const convertedGeoJSON = toGeoJSON.kml(new DOMParser().parseFromString(kmlData, 'text/xml'));
            props.onKMLUpload(convertedGeoJSON);
    
            // Accessing coordinates from the GeoJSON
            const coordinates = extractCoordinatesFromGeoJSON(convertedGeoJSON);
    
            console.log('Coordinates:', coordinates);
    
            const { extractedData, headerNames } = extractKMLData(kmlData);
            setExtractedData(extractedData);
            const rows = generateTableRows(extractedData, headerNames);
            setTableRows(rows);
          } catch (error) {
            console.error('Error processing KML data:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    
      // Function to extract coordinates from GeoJSON
         const extractCoordinatesFromGeoJSON = (geoJSON) => {
          const coordinates = [];
    
      if (geoJSON && geoJSON.features) {
        geoJSON.features.forEach((feature) => {
          if (feature.geometry && feature.geometry.coordinates) {
            coordinates.push(feature.geometry.coordinates);
          }
        });
      }
    
      return coordinates;
    };
    
      const extractKMLData = (kmlData) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(kmlData, 'text/xml');
    
      const coordinatesNodes = xmlDoc.querySelectorAll('coordinates');
      const simpleDataNodesList = xmlDoc.querySelectorAll('Placemark');
    
      const extractedData = [];
      const headerNames = new Set();
      const extractedCoordinates = [];
    
      coordinatesNodes.forEach((coordinatesNode, index) => {
        const simpleDataNodes = simpleDataNodesList[index].querySelectorAll('SimpleData');
        
        const data = {
          coordinates: coordinatesNode ? coordinatesNode.textContent : '',
          SimpleData: {},
        };

        const coords = coordinatesNode ? coordinatesNode.textContent.split(' ') : [];
        extractedCoordinates.push(coords);
    
        simpleDataNodes.forEach((node) => {
          const name = node.getAttribute('name');
          const value = node.textContent;
          data.SimpleData[name] = value;
          headerNames.add(name);
        });
    
        extractedData.push(data);
        // console.log(`Coordinates for Placemark ${index}:`, data.coordinates);
        console.log('extracted Data', extractedData);
      });
      
      return { extractedData, extractedCoordinates, headerNames: Array.from(headerNames) };
    
    };

    const generateTableRows = (data, headerNames) => {
      const displayHeaders = ['id', 'applicant', 'area', 'blk_no', 'lot_no', 'owner', 'res_no', 'surv_no', 't_date', 'title_no', 'coordinates'];
    
      const filteredHeaderNames = headerNames.filter(name => displayHeaders.includes(name));
    
      const headerRow = [...filteredHeaderNames.map((name) => <th key={name}>{name}</th>), <th key="coordinates">Coordinates</th>];
    
      const bodyRows = data.map((item, index) => (
        <tr key={index}>
          {filteredHeaderNames.map((name) => (
            <td
              key={name}
              contentEditable={true}
              onBlur={(e) => handleCellEdit(e, index, name)}
              suppressContentEditableWarning={true} // Suppress the warning
            >
              {editedData[index] && editedData[index][name]
                ? editedData[index][name]
                     : item.SimpleData[name]}
            </td>
          ))}
          <td> {`[${item.coordinates}]`}</td>
        </tr>
      ));
    
      return [headerRow, ...bodyRows];
    };

    const handleCellEdit = (event, rowIndex, columnName) => {
      const updatedEditedData = { ...editedData };
  
      if (!updatedEditedData[rowIndex]) {
        updatedEditedData[rowIndex] = {};
      }
  
      updatedEditedData[rowIndex][columnName] = event.target.textContent;
      setEditedData(updatedEditedData);
    };

  // Saves Changes from the table to Database
    const handleSaveAllChanges = () => {
      const updatedDataToSave = [];
      for (let rowIndex in editedData) {
        const updatedDataRow = {
          SimpleData: {},
          coordinates: extractedCoordinates[rowIndex] || '',
        };
  
        for (let columnName in editedData[rowIndex]) {
          updatedDataRow.SimpleData[columnName] = editedData[rowIndex][columnName];
        }
  
        updatedDataToSave.push(updatedDataRow);
      }
      if (updatedDataToSave.length > 0) {
        let savedCount = 0;
  
        const handleSaveComplete = () => {
          savedCount++;
          if (savedCount === updatedDataToSave.length) {
            alert('All data updated and saved!');
            setKmlDetailsSaved(true);
          }
        };
        
        for (let r = 0; r < updatedDataToSave.length; r++) {
          const updatedPlacemarkData = updatedDataToSave[r];
          const updatedPlacemarkCoordinates = extractedCoordinates[r];
  
          const dataToSave = {
            ...updatedPlacemarkData,
            coordinates: updatedPlacemarkCoordinates,
          };

          
          fetch('/kmlDetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave),
          })
            .then((res) => res.json())
            .then((data) => {
              handleSaveComplete();
            })
            .catch((error) => {
              alert('Error saving data:', error);
            });
        }
      } else {
        alert('No changes to save.');
      }
    };



//Direct Save to Database
  const handleSaveToDatabase = () => {
    let savedCount = 0;

    const handleSaveComplete = () => {
      savedCount++;
      if (savedCount === extractedData.length) {
        alert('KML Details Saved to Database');
        setKmlDetailsSaved(true);
      }
    };

    if (extractedData.length > 0 && extractedCoordinates.length > 0) {
      for (let r = 0; r < extractedData.length; r++) {
        const placemarkData = extractedData[r];
        const placemarkCoordinates = extractedCoordinates[r];
  
        const {
          id,
          applicant,
          area,
          blk_no,
          date_enact,
          date_pass,
          lot_no,
          map_no,
          ord_no,
          owner,
          plot_edit,
          plotted_ba,
          projtype,
          purpose,
          res_no,
          surv_no,
          t_date,
          title_no,
          zone_class,
          plotted_by,
          pgplot_by,
          date_time,
          coordinate,
          centroid,
          pluscode,
        } = placemarkData.SimpleData;
  
        const dataToSave = {
          id,
          applicant,
          area,
          blk_no,
          date_enact,
          date_pass,
          lot_no,
          map_no,
          ord_no,
          owner,
          plot_edit,
          plotted_ba,
          projtype,
          purpose,
          res_no,
          surv_no,
          t_date,
          title_no,
          zone_class,
          plotted_by,
          pgplot_by,
          date_time,
          coordinate: placemarkCoordinates,
          centroid,
          pluscode,
        };
  
        fetch('/kmlDetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSave),
        })
          .then((res) => res.json())
          .then((data) => {
            handleSaveComplete();
          })
          .catch((error) => {
            alert('Error saving KML details to the database:', error);
          });
      }
    } else {
      alert('No extracted data available.');
    }
  };
  

      return (
        <div className={styles['popup-form-container']}>
            <label style={{fontSize: '16px'}}>Upload KML File:</label>    
                <div style={{display: 'flex', flexWrap: 'nowrap'}}>
                <input
                type="file"
                name="kmlFile"
                accept=".kml"
                onChange={handleKMLUpload}
                style={{ color: 'white', height: '10%' }}
                />
                <button onClick={handleSaveToDatabase}>Save to Database</button>
                <button onClick={handleSaveAllChanges}>Save All Changes</button>
                <button onClick={props.closeKmlTable}>Cancel</button>
                </div>

                <table style={{ width: '100%', marginTop: '1em', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{tableRows[0]}</tr>
                  </thead>
                  <tbody>{tableRows.slice(1)}</tbody>
                </table>
        </div>
      );
};

export default KmlUploadForm;