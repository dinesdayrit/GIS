import React, { Component } from 'react';
import { Map, TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'; // Import leaflet-draw's CSS
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-geometryutil';
// import PopupForm from './PopupForm';
// import ReactDOMServer from 'react-dom/server'; 


class LeafletMap extends Component {
  
  
  handleShapeClick = (coordinates) => {
    // Call the function passed as a prop from the parent component
    this.props.handleShapeClick(coordinates);
  };


  componentDidMount() {
    const map = new Map('leaflet-map', {
      center: [7.078987297874518,125.5428209424999],
      zoom: 13,
    });

    new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

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
        var coordinates = latlngs.map(coord => [coord.lat, coord.lng]);

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
