import React, { useEffect, useState, useRef } from 'react';
import { Map, TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-geometryutil';
import 'leaflet.pm';
import 'leaflet.pm/dist/leaflet.pm.css';

const LeafletMap = (props) => {
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const mapRef = useRef(null);
  const drawnLayerRef = useRef(L.featureGroup());
  const drawControlRef = useRef(null);

  useEffect(() => {
    const map = new Map(document.getElementById('leaflet-map'), {
      center: [7.078987297874518, 125.5428209424999],
      zoom: 13,
    });

    // OSM
    const osm = new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    })

    // Hybrid View
    const googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(map);

    // Satellite View
    const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 22,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });

      // Satellite View
    const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 22,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    });
    

    // LayerControl starts here
    let baseMaps = {
      'OpenStreetMap': osm,
      'Hybrid': googleHybrid,
      'Satellite': googleSat,
      'esriSat':esriSat,
    };

    let overlayMaps = {
      // "Cities": cities
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

    const handleEditClick = (polygon) => {
      console.log('Edit button Clicked');
    };

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
  drawRectangle: true,
  drawPolyline: false,
  drawPolygon: true,
  editMode: true,
  cutPolygon: true,
  removalMode: true,
};

map.pm.addControls(options);
map.addLayer(pmDrawnItems);

//Draw control End Here

    // Fetch data from '/GisDetail' and add polygons to the map
    fetch('/GisDetail')
      .then(response => response.json())
      .then(gisDetails => {
        gisDetails.forEach(gisDetail => {
          const geojsonObject = gisDetail.geojson;

          if (geojsonObject) {
            const latlngs = geojsonObject.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);


            const title = geojsonObject.properties.title;
            const surveyNumber = geojsonObject.properties.surveyNumber;
            const lotNumber = geojsonObject.properties.lotNumber;
            const ownerName = geojsonObject.properties.ownerName;
           
            
      

            const popupContent = `
              <p>Title: ${title}</p>
              <p>Survey Number: ${surveyNumber}</p>
              <p>Lot Number: ${lotNumber}</p>
              <p>Owner Name: ${ownerName}</p>
              <button style="background-color: #007bff;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 10px;
                cursor: pointer;" class="edit-button">Edit</button>
            `;

           
            const polygon = L.polygon(latlngs, { color: 'blue' });
            const popup = polygon.bindPopup(popupContent).on('click', () => {});

            const markerLatLng = polygon.getBounds().getCenter();
            const textMarker = L.marker(markerLatLng, {
              icon: L.divIcon({
              className: 'text-marker',
               html: title, 
               }),
                 });

            textMarker.addTo(map);
          
            polygon.addTo(map);
            polygon.addTo(editableLayers);

            polygon.on('editable:editing', (e) => {
              const editedLayer = e.layer;
              const editedCoordinates = editedLayer.getLatLngs()[0].map(coord => [coord.lng, coord.lat]);
              const updatedPopupContent = '<p>Coordinates:</p><pre>' + JSON.stringify(editedCoordinates, null, 2) + '</pre>';
              popup.setContent(updatedPopupContent);

              
            });

            polygon.on('popupopen', () => {
              const editButton = document.querySelector('.edit-button');
              editButton.addEventListener('click', () => {
              props.handleEditClick();
              });
            });
          }
        });
      });


    map.on('pm:create', (e) => {
        let layer = e.layer;
        let type = e.shape;

      if (type === 'Rectangle' || type === 'Polygon') {
        var latlngs = layer.getLatLngs()[0];
        var coordinates = latlngs.map(coord => [coord.lng, coord.lat]);

        var popupContent = '<p>Coordinates:</p><pre>' + JSON.stringify(coordinates, null, 2) + '</pre>';
        layer.bindPopup(popupContent).on('click', () => {
          props.handleShapeClick(coordinates);

        });

        layer.on('pm:edit', (e) => {
          var editedLayer = e.target;
          var editedCoordinates = editedLayer.getLatLngs()[0].map(coord => [coord.lng, coord.lat]);
          var updatedPopupContent = '<p>Coordinates:</p><pre>' + JSON.stringify(editedCoordinates, null, 2) + '</pre>';
          console.log("pm:edit event triggered");
          console.log(editedCoordinates);
          editedLayer.getPopup().setContent(updatedPopupContent);

          props.handleShapeClick(editedCoordinates);
          setSelectedCoordinates(editedCoordinates);
        });
      }
      editableLayers.addLayer(layer);
    });
    if (props.polygonCoordinates.length > 0) {
      const formattedPolygonCoordinates = props.polygonCoordinates.map(coord => [coord[1], coord[0]]);
      const polygon = L.polygon(formattedPolygonCoordinates, { color: 'red' }).addTo(drawnLayerRef.current);
      props.handleShapeClick(formattedPolygonCoordinates);
      map.fitBounds(polygon.getBounds()); 

      

      polygon.on('pm:edit', (e) => {
        const editedLayer = e.target;
        const editedCoordinates = editedLayer.getLatLngs()[0].map(coord => [coord.lng, coord.lat]);

        
        props.handleShapeClick(editedCoordinates);
        setSelectedCoordinates(editedCoordinates);

      });
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
