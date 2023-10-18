import React, { useEffect, useRef } from 'react';
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
import MapLegendForm from './MapLegendForm';
import ReactDOM from 'react-dom';

const LeafletMap = (props) => {
  // const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const mapRef = useRef(null);
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

mapRef.current = map;


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
  
  var wmsBrgyOptions = {
    layers: 'Davao:Barangay',
    transparent: true,
    tiled: false,
    format: "image/png",
    opacity: 1,
    maxZoom: 20,
    maxNativeZoom: 20,
    crs: L.CRS.EPSG4326,
    Identify: false
    };

    var wmsdavBrgy = L.tileLayer.wms('http://map.davaocity.gov.ph:8080/geoserver/wms?', wmsBrgyOptions);

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
      maxZoom: 19.8,
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
      'wmsdavZoning2019' : wmsdavZoning2019,
      'wmsdavBrgy': wmsdavBrgy

    };

    L.control.layers(baseMaps, overlayMaps, { position: 'topleft' }).addTo(map);

    // // Add header to the basemap
    //   layerControl._container.querySelector('.leaflet-control-layers-base').innerHTML =
    //       '<h4>BASEMAPS</h4>'+
    //   layerControl._container.querySelector('.leaflet-control-layers-base').innerHTML;
    // // Add headers to the overlay
    //   layerControl._container.querySelector('.leaflet-control-layers-overlays').innerHTML =
    //   '<h4>OVERLAY MAPS</h4>' +
    //   layerControl._container.querySelector('.leaflet-control-layers-overlays').innerHTML;

//map legend
  const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'legend-control');
      ReactDOM.render(<MapLegendForm />, div);
      return div;
    };
    legend.addTo(map);


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
  
             const polygonColor = status === 'APPROVED' ? 'blue' : 'red';
             const polygon = L.polygon(latlngs, { color: polygonColor });

          if (props.isPolygonApproved && geojsonObject) {
             map.fitBounds(polygon.getBounds(), { maxZoom: 19});
            
          }

            
          polygon.addTo(map);
          polygon.addTo(editableLayers);

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
            // cursor: pointer;" class="approved-button">EDIT</button>
            
            polygon.bindPopup(popupContent).on('click')
            
            const polygonBounds = polygon.getBounds();
            const polygonCenter = polygonBounds.getCenter();

            const textMarker = L.marker(polygonCenter, {
              icon: L.divIcon({
                className: 'text-marker',
                html: `<span style="font-weight: 0.5px; font-size: 10px">${title}</span>`,
              }),
            });
            
                polygon.on('popupopen', () => { 
                  props.handleShapeClick(polygonCoordinates); 
                  props.handlePlusCode(centroidPlusCode);

                // // Add an event listener for the "Edit" button click
                // const editButton = document.querySelector('.edit-button');
                // editButton.addEventListener('click', () => {
                // // Call the handleEditClick function with the provided data

            props.parcelDetails({
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
            })
        });
    // });

    

            map.on('zoomend', () => {
           
              const currentZoom = map.getZoom();
              const minZoomToShowText = 19;
          
              if (currentZoom >= minZoomToShowText) {
                if (!map.hasLayer(textMarker)) {
                  map.addLayer(textMarker);
                }
              } else {
                if (map.hasLayer(textMarker)) {
                  map.removeLayer(textMarker);
                }
              }
            });
          
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
          // setSelectedCoordinates(updatedPolygonCoordinates);


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

    
//KML multiple Polygons when uploaded
const updateMapWithGeoJSON = (geojsonData) => {
  if (drawnLayerRef.current) {
    map.removeLayer(drawnLayerRef.current);
  }

  const multiplePlusCodes = [];

  const geojsonLayer = L.geoJSON(geojsonData, {
    onEachFeature: function(feature, layer) {
      const latlngs = layer.getLatLngs()[0];
      const multipleCoordinates = latlngs.map(coord => [coord.lng, coord.lat]);
      const multipleCenterCoordinate = calculateCenterCoordinate(multipleCoordinates);
      const multipleCenterLat = multipleCenterCoordinate[1];
      const multipleCenterLng = multipleCenterCoordinate[0];
      const multipleCentroidPlusCode = multipleCenterCoordinate[2];
      const multipleAreaInSqMeters = calculatePolygonArea(multipleCoordinates);


      if (props.onGeoJSONUpdate) {
        props.onGeoJSONUpdate({
          geojson: geojsonData,
          pluscode: multiplePlusCodes,
        });
      }
      multiplePlusCodes.push(multipleCentroidPlusCode);

      const popupContent = `
        <pre>Area: ${multipleAreaInSqMeters} sq.m. </pre>
        <br/>
        <p>Centroid:</p>
        <pre>Latitude: ${multipleCenterLat.toFixed(6)}, Longitude: ${multipleCenterLng.toFixed(6)}</pre>
        <br/>
        <pre>Plus Code: ${multipleCentroidPlusCode}</pre>
      `;
      layer.bindPopup(popupContent);

      layer.on('pm:edit', () => {
        const editedCoordinates = layer.getLatLngs()[0].map(coord => [coord.lng, coord.lat]);
        const updatedCenterCoordinate = calculateCenterCoordinate(editedCoordinates);
        const updatedCenterLat = updatedCenterCoordinate[1];
        const updatedCenterLng = updatedCenterCoordinate[0];
        const updatedCentroidPlusCode = updatedCenterCoordinate[2];
        const updatedAreaInSqMeters = calculatePolygonArea(editedCoordinates);

        const updatedPopupContent = `
          <pre>Area: ${updatedAreaInSqMeters} sq.m. </pre>
          <br/>
          <p>Centroid:</p>
          <pre>Latitude: ${updatedCenterLat.toFixed(6)}, Longitude: ${updatedCenterLng.toFixed(6)}</pre>
          <br/>
          <pre>Plus Code: ${updatedCentroidPlusCode}</pre>
        `;

        layer.setPopupContent(updatedPopupContent);
        props.handlePlusCode(updatedCentroidPlusCode);
      });
    }
  });

  drawnLayerRef.current = geojsonLayer;
  props.onPlusCodesUpdate(multiplePlusCodes);
  map.fitBounds(drawnLayerRef.current.getBounds());
  geojsonLayer.addTo(map);
};

if (props.kmlData) {
  updateMapWithGeoJSON(props.kmlData);
}

//End KML

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
      props.handleShapeClick(polygonCoordinates, centroidPlusCode);
      map.fitBounds(polygon.getBounds(), { maxZoom: 19});

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
    // setSelectedCoordinates(updatedPolygonCoordinates);
  }

  polygon.on('pm:edit', updatePolygonInfo);
  


      editableLayers.addLayer(polygon);
    }
    drawnLayerRef.current.addTo(map);
    return () => {
      map.remove();
    };

  
  }, [props.isPolygonApproved, props.polygonCoordinates, props.kmlData ]);

  console.log("props.isPolygonApproved", props.isPolygonApproved )

  return <div id="leaflet-map" style={{ width: '100%', height: '90vh', zIndex: '1', borderRadius: '.7%', border: '2px gray solid'}}></div>;
};

export default LeafletMap;
