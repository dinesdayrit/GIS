import React, { Component } from 'react';
import { Map, TileLayer, MapContainer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'; // Import leaflet-draw's CSS
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-geometryutil';


class LeafletMap extends Component {
  
  
  handleShapeClick = (coordinates) => {
    
    this.props.handleShapeClick(coordinates);
  };


  componentDidMount() {
    const map = new Map('leaflet-map', {
      center: [7.078987297874518,125.5428209424999],
      zoom: 13,

    });


    //OSM
    const osm = new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    });

    //Hybrid View

    const googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
        maxZoom: 22,
        subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);

    //Satellite View

    const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 22,
        subdomains:['mt0','mt1','mt2','mt3']
});

// LayerControl starts here

let baseMaps = {
    "OpenStreetMap": osm,
    "Hybrid": googleHybrid,
    "Satellite": googleSat,
};

let overlayMaps = {
    // "Cities": cities
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);


var editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);
    
    var MyCustomMarker = L.Icon.extend({
        options: {
            shadowUrl: null,
            iconAnchor: new L.Point(12, 12),
            iconSize: new L.Point(24, 24),
            iconUrl: 'link/to/image.png'
        }
    });


    fetch('/GisDetail')
    .then(response => response.json())
    .then(gisDetails => {
      gisDetails.forEach(gisDetail => {
        const latlngs = gisDetail.coordinates.map(coord => [coord[1], coord[0]]);
        L.polygon(latlngs, { color: 'blue' }).addTo(map);
      });
      
    });


    var options = {
        position: 'topright',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#f357a1',
                    weight: 10
                }
            },
            polygon: {
                allowIntersection: false, // Restricts shapes to simple polygons
                drawError: {
                    color: '#e1e100', // Color the shape will turn when intersects
                    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                },
                shapeOptions: {
                    color: '#bada55'
                }
            },
            circle: false, // Turns off this drawing tool
            rectangle: {
                shapeOptions: {
                    clickable: false
                }
            },
            marker: {
                icon: new MyCustomMarker()
            }
        },
        edit: {
            featureGroup: editableLayers, //REQUIRED!!
            remove: false
        }
    };
    
    var drawControl = new L.Control.Draw(options);
    map.addControl(drawControl);
    

    

    map.on(L.Draw.Event.CREATED, (e) => {
      var type = e.layerType,
        layer = e.layer;

      if (type === 'rectangle' || type === 'polygon') {
        var latlngs = layer.getLatLngs()[0];
        var coordinates = latlngs.map(coord => [coord.lng, coord.lat]);

        var popupContent = '<p>Coordinates:</p><pre>' + JSON.stringify(coordinates, null, 2) + '</pre>';
        layer.bindPopup(popupContent).on('click', () => {
          this.handleShapeClick(coordinates);
          this.setState({selectedCoordinates: coordinates});
        });
      }

      editableLayers.addLayer(layer);
    });


  }


  

    render() {
      return (
  
        <div id="leaflet-map" style={{ width: '100%', height: '90vh' }}>
        
          
        </div>
       
      );
    }
  }

export default LeafletMap;
