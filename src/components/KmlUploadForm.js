import React, { useState } from 'react';
import styles from './KmlUploadForm.module.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import toGeoJSON from 'togeojson';


const KmlTable = (props) => {
    const [kmlDetailsSaved, setKmlDetailsSaved] = useState(false);
    const [tableRows, setTableRows] = useState([]);
    const [extractedData, setExtractedData] = useState(null);
    const [extractedCoordinates, setExtractedCoordinates] = useState([]);
    const [loading, setLoading] = useState(false);
    const token =  localStorage.getItem('authToken');
    const storedUserDetails = JSON.parse(localStorage.getItem('userDetails'));

    const handleKMLUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const kmlData = event.target.result;
            const convertedGeoJSON = toGeoJSON.kml(new DOMParser().parseFromString(kmlData, 'text/xml'));
            props.onKMLUpload(convertedGeoJSON);
          
            const { extractedData, extractedCoordinates, headerNames } = extractKMLData(kmlData);
            setExtractedData(extractedData);
            setExtractedCoordinates(extractedCoordinates);
            const rows = generateTableRows(extractedData, headerNames);
            setTableRows(rows);
            
          } catch (error) {
            console.error('Error processing KML data:', error);
          }
        };
        reader.readAsText(file);
      }
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
        // console.log(`Coordinates for Placemark ${index}:`, data.coordinates); //debug
      });
      
      return { extractedData, extractedCoordinates, headerNames: Array.from(headerNames) };
    
    };

    const generateTableRows = (data, headerNames) => {
      const displayHeaders = ['title_no','t_date', 'surv_no', 'lot_no', 'blk_no', 'area', 'boundary', 'owner', 'oct', 'oct_date', 'prev_tct', 'prtct_date', 'applicant'];
    
      const filteredHeaderNames = headerNames.filter(name => displayHeaders.includes(name));
    
      const headerRow = filteredHeaderNames.map(name => <th key={name}>{name.toUpperCase()}</th>);
    
      const bodyRows = data.map((item, index) => (
        <tr key={index}>
          {filteredHeaderNames.map(name => (
            <td key={name}>
            {item.SimpleData[name] ? item.SimpleData[name].toUpperCase() : ''}
          </td>

          ))}
        </tr>
      ));
    
      return [headerRow, ...bodyRows];
    };
    


//Direct Save to Database
  const handleSaveToDatabase = () => {
    setLoading(true);
    let savedCount = 0;

    const handleSaveComplete = () => {
      savedCount++;
      if (savedCount === extractedData.length) {
        alert('KML Data Saved to Database');
        setLoading(false);
        setKmlDetailsSaved(true);
      }
    };

    if (extractedData.length > 0 && extractedCoordinates.length > 0) {
      for (let r = 0; r < extractedData.length; r++) {
        const placemarkData = extractedData[r];
        const placemarkCoordinates = extractedCoordinates[r];
        const plusCodesForData = props.plusCodes[r];
    
      const cleanedData = placemarkCoordinates.filter(item => item.trim() !== "");
      const coordinatePairs = cleanedData.map(pair => {
        const [long, lat] = pair.split(',').map(Number);
        return [long, lat];
      });

      const geojsonFeature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon', 
          coordinates: [coordinatePairs], 
        },
      };

      const geojsonString = JSON.stringify(geojsonFeature);

        const {
          title_no,
          surv_no,
          lot_no,
          blk_no,
          owner,
          area,
          boundary,
          oct,
          oct_date,
          prev_tct,
          prtct_date,
          t_date,
        } = placemarkData.SimpleData;

        const dataToSave = {
          title: title_no,
          titleDate: t_date,
          surveyNumber: surv_no,
          lotNumber: lot_no,
          blkNumber: blk_no,
          area,
          ownerName: owner,
          boundary: boundary,
          oct: oct,
          octDate: oct_date,
          tct: prev_tct,
          tctDate: prtct_date,
          plusCode: plusCodesForData,
          geojson: geojsonString,
          status: 'For Approval',
          username: storedUserDetails.name,
        };

        fetch('/GisDetail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dataToSave),
        })
          .then((res) => res.json())
          .then((data) => {
            handleSaveComplete();
          })
          .catch((error) => {
            setLoading(false);
            alert('Error saving KML Data to the database:', error);
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
                style={{ color: 'black', height: '10%' }}
                />
                <button onClick={handleSaveToDatabase} disabled={loading}>
                  {loading ? <i className="fa-solid fa-spinner fa-spin fa-spin-reverse"></i> : 'Save to Database'}
                </button>
                </div>

                  {kmlDetailsSaved && <p style={{fontWeight: 'bold', color: '#4CAF50'}}>KML Data Saved!</p>}

                <table style={{ width: '100%', marginTop: '1em', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{tableRows[0]}</tr>
                  </thead>
                  <tbody>{tableRows.slice(1)}</tbody>
                </table>
                <br/>
        </div>
      );
};

export default KmlTable;
