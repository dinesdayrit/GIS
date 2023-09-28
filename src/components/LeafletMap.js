import React, { useEffect, useState, useRef } from 'react';
import { Map, TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-geometryutil';
import 'leaflet.pm';
import 'leaflet.pm/dist/leaflet.pm.css';
import { PlusCodes } from 'olc-plus-codes';
import * as turf from '@turf/turf';

const LeafletMap = (props) => {
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  // const mapRef = useRef(null);
  const drawnLayerRef = useRef(L.featureGroup());
  // const drawControlRef = useRef(null);


  useEffect(() => {
    const map = new Map(document.getElementById('leaflet-map'), {
      center: [7.078987297874518, 125.5428209424999],
      zoom: 13,
      zoomControl: false // Disable the default zoom control
    });

// Add the zoom control to the top-right corner
L.control.zoom({ position: 'topright' }).addTo(map);


  var wmsTechDescOptions = {
    layers: 'Davao:TechDesc',
    transparent: true,
    tiled: false,
    format: "image/png",
    opacity: 1,
    maxZoom: 20,
    maxNativeZoom: 20,
    crs: L.CRS.EPSG4326,
    Identify: false
    };

  var wmsdavTechDesc = L.tileLayer.wms('http://map.davaocity.gov.ph:8080/geoserver/wms?', wmsTechDescOptions);
  
  var wmsStreetsOptions = {
    layers: 'Davao:Grp_Zoning2019_Det',
    transparent: true,
    tiled: false,
    format: "image/png",
    opacity: 1,
    maxZoom: 20,
    maxNativeZoom: 20,
    crs: L.CRS.EPSG4326,
    Identify: false
    };

    var wmsdavZoning2019 = L.tileLayer.wms('http://map.davaocity.gov.ph:8080/geoserver/wms?', wmsStreetsOptions);

    // OSM
    const osm = new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    })

    // Hybrid View
    const googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });

    // Satellite View
    const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });

      // EsriSat
    const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);
    

    // LayerControl starts here
    let baseMaps =  {
      
      'OpenStreetMap': osm,
      'Hybrid': googleHybrid,
      'Satellite': googleSat,
      'esriSat':esriSat
    
    };

    let overlayMaps = {
      'wmsdavTechDesc': wmsdavTechDesc,
      'wmsdavZoning2019' : wmsdavZoning2019

    };

    L.control.layers(baseMaps, overlayMaps, { position: 'topleft' }).addTo(map);




    //New Draw Control
    const pmDrawnItems = new L.FeatureGroup();
      const editableLayers = new L.FeatureGroup();
      map.addLayer(editableLayers);
      map.addLayer(pmDrawnItems);

    pmDrawnItems.pm.enable({
      allowSelfIntersection: false,
      snap: true,
      snapDistance: 20,
    });

const options = {
  position: 'topleft',
  drawCircle: false,
  drawMarker: false,
  drawCircleMarker: false,
  drawRectangle: false,
  drawPolyline: false,
  drawPolygon: false,
  editMode: true,
  cutPolygon: false,
  removalMode: true,
  
};

map.pm.addControls(options);
map.addLayer(pmDrawnItems);



//calculate area in sqm
function calculatePolygonArea(coordinates) {
          
  const firstCoord = coordinates[0];
  const lastCoord = [...firstCoord];

  coordinates.push(lastCoord);

  const turfCoords = coordinates.map(coord => [coord[0], coord[1]]);
  const polygon = turf.polygon([turfCoords]);
  const areaInSqMeters = turf.area(polygon);

  return areaInSqMeters.toFixed(2);
}
//calculate centroid
function calculateCenterCoordinate(coordinates) {
  var sumLat = 0;
  var sumLng = 0;

  for (let r = 0; r < coordinates.length; r++) {
    sumLng += coordinates[r][1];
    sumLat += coordinates[r][0];
  }
  var centerLat = sumLat / coordinates.length;
  var centerLng = sumLng / coordinates.length;
  var plusCodes = new PlusCodes();
var centroidPlusCode = plusCodes.encode(centerLng, centerLat, 12);
return [centerLat, centerLng, centroidPlusCode];


}


    // Fetch data from '/GisDetail' and add polygons to the map
    fetch('/GisDetail')
      .then(response => response.json())
      .then(gisDetails => {
        gisDetails.forEach(gisDetail => {
          const geojsonObject = gisDetail.geojson;
          const title = gisDetail.title;
          const titleDate = gisDetail.titledate;
          const surveyNumber = gisDetail.surveynumber;
          const lotNumber = gisDetail.lotnumber;
          const blkNumber = gisDetail.blknumber;
          const ownerName = gisDetail.ownername;
          const technicalDescription = gisDetail.tecnicaldescription;
          const technicaldescremarks = gisDetail.technicaldescremarks;
          const lotArea = gisDetail.area;
          const boundary = gisDetail.boundary;
          const oct = gisDetail.oct;
          const octDate = gisDetail.octdate;
          const tct = gisDetail.prevtct;
          const tctDate = gisDetail.tctdate;
          const status = gisDetail.status;

          if (geojsonObject) {
          const latlngs = geojsonObject.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);

          let polygon = L.polygon(latlngs, { color: 'red' });
          if(status === 'APPROVED') {
            polygon = L.polygon(latlngs, { color: 'blue' });
          } 
            
          const polygonCoordinates = polygon.getLatLngs()[0].map(coord => [coord.lng, coord.lat]);
            
          var centerCoordinate = calculateCenterCoordinate(polygonCoordinates);
          var centroidPlusCode = centerCoordinate[2];
            

            var popupContent = `
              <p>Title: ${title}</p>
              <p>Survey Number: ${surveyNumber}</p>
              <p>Lot Number: ${lotNumber}</p>
              <p>Owner Name: ${ownerName}</p>
              <p>Lot Area (Sqm): ${lotArea}</p>
              <p>Plus Code: ${centroidPlusCode}</p>

            `;
            // <button style="background-color: #007bff;
            // color: #fff;
            // border: none;
            // padding: 10px 20px;
            // border-radius: 10px;
            // cursor: pointer;" class="edit-button">Edit</button>
            
            polygon.bindPopup(popupContent)
            

            const markerLatLng = polygon.getBounds().getCenter();
            const textMarker = L.marker(markerLatLng, {
              icon: L.divIcon({
              className: 'text-marker',
               html: title, 
               }),
                 });
                
                polygon.on('popupopen', () => { 
                  props.handleShapeClick(polygonCoordinates); 
                  props.handlePlusCode(centroidPlusCode);
                props.handleEditClick({
                  title,
                  titleDate,
                  surveyNumber,
                  lotNumber,
                  blkNumber,
                  lotArea,
                  ownerName,
                  oct,
                  octDate,
                  tct,
                  tctDate,
                  boundary,
                  technicalDescription,
                  technicaldescremarks,
                  status,

                });
              });

              
            textMarker.addTo(map);
          
            polygon.addTo(map);
            polygon.addTo(editableLayers);

            function updatePolygonInfo() {
              console.log("updatePolygonInfo function called");
              console.log("Props:", props);

              const updatedPolygonCoordinates = polygon.getLatLngs()[0].map(coord => [coord.lng, coord.lat]);
              const updatedCenterCoordinate = calculateCenterCoordinate(updatedPolygonCoordinates);
              const updatedCentroidPlusCode = updatedCenterCoordinate[2];
              

      

      
          // Update the parent component with the edited coordinates
          props.handlePlusCode(updatedCentroidPlusCode);
          props.handleShapeClick(updatedPolygonCoordinates);
          setSelectedCoordinates(updatedPolygonCoordinates);


          var updatedPopupContent = `
          <p>Title: ${title}</p>
          <p>Survey Number: ${surveyNumber}</p>
          <p>Lot Number: ${lotNumber}</p>
          <p>Owner Name: ${ownerName}</p>
          <p>Lot Area (Sqm): ${lotArea}</p>
          <p>Plus Code: ${updatedCentroidPlusCode}</p>
          `;

          polygon.getPopup(updatedPopupContent).setContent(updatedPopupContent);

          // props.handleEditClick({
          //   title,
          //   surveyNumber,
          //   lotNumber,
          //   blkNumber,
          //   ownerName,
          //   lotArea,
          //   updatedCentroidPlusCode,
          //   status,
          // });

         

            }
            
        polygon.on('pm:edit', updatePolygonInfo);
      
  

          

      editableLayers.addLayer(polygon);
    }
    drawnLayerRef.current.addTo(map);
    return () => {
      map.remove();
    

          }
        });
      });



    //draw Tie Line
    if (props.tieLineCoordinates.length > 0) {
      const formattedPolygonCoordinates = props.tieLineCoordinates.map(coord => [coord[1], coord[0]]);
      L.polygon(formattedPolygonCoordinates, { color: 'blue' }).addTo(drawnLayerRef.current);
    }

    // draw Polygon
    if (props.polygonCoordinates.length > 0) {
      const formattedPolygonCoordinates = props.polygonCoordinates.map(coord => [coord[1], coord[0]]);
      const polygon = L.polygon(formattedPolygonCoordinates, { color: 'red' }).addTo(drawnLayerRef.current);
      const polygonCoordinates = polygon.getLatLngs()[0].map(coord => [coord.lng, coord.lat]);

      var centerCoordinate = calculateCenterCoordinate(polygonCoordinates);

      var centerLng = centerCoordinate[0];
      var centerLat = centerCoordinate[1];
      var centroidPlusCode = centerCoordinate[2];
      var areaInSqMeters = calculatePolygonArea(polygonCoordinates);

      var popupContent = '<p>Centroid:</p>';
      popupContent += '<pre>Latitude: ' + centerLat.toFixed(6) + ', Longitude: ' + centerLng.toFixed(6) + '</pre>';
      popupContent += '<p>Plus Code:</p>';
      popupContent += '<pre>' + centroidPlusCode + '</pre>';
      popupContent += '<p>Area:</p>';
      popupContent += '<pre>' + areaInSqMeters + ' sq.m.</pre>';
            
      polygon.bindPopup(popupContent)

      props.handlePlusCode(centroidPlusCode);
      props.handleShapeClick(polygonCoordinates);
      map.fitBounds(polygon.getBounds()); 

      function updatePolygonInfo() {
        const updatedPolygonCoordinates = polygon.getLatLngs()[0].map(coord => [coord.lng, coord.lat]);
        const updatedCenterCoordinate = calculateCenterCoordinate(updatedPolygonCoordinates);
        const updatedCenterLng = updatedCenterCoordinate[0];
        const updatedCenterLat = updatedCenterCoordinate[1];
        const updatedCentroidPlusCode = updatedCenterCoordinate[2];
        var areaInSqMeters = calculatePolygonArea(updatedPolygonCoordinates);


        var updatedPopupContent = '<p>Centroid:</p>';
          updatedPopupContent += '<pre>Latitude: ' + updatedCenterLat.toFixed(6) + ', Longitude: ' + updatedCenterLng.toFixed(6) + '</pre>';
          updatedPopupContent += '<p>Plus Code:</p>';
          updatedPopupContent += '<pre>' + updatedCentroidPlusCode + '</pre>';
          updatedPopupContent += '<p>Area:</p>';
          updatedPopupContent += '<pre>' + areaInSqMeters + ' sq.m.</pre>'

          polygon.getPopup(updatedPopupContent).setContent(updatedPopupContent);

    // Update the parent component with the edited coordinates
    props.handlePlusCode(updatedCentroidPlusCode);
    props.handleShapeClick(updatedPolygonCoordinates);
    setSelectedCoordinates(updatedPolygonCoordinates);
  }

  polygon.on('pm:edit', updatePolygonInfo);
  


      editableLayers.addLayer(polygon);
    }
    drawnLayerRef.current.addTo(map);
    return () => {
      map.remove();
    };
  }, [props.polygonCoordinates]);

  return <div id="leaflet-map" style={{ width: '100%', height: '90vh', zIndex: '1'}}></div>;
};

export default LeafletMap;
