import React, { Component } from 'react';
import { Map, TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css'; // Import leaflet-draw's CSS
import L from 'leaflet';
import 'leaflet-draw';

class LeafletMap extends Component {
  componentDidMount() {
    const map = new Map('leaflet-map', {
      center: [7.1907, 125.4553],
      zoom: 13,
    });

    new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    marker: false,
    circle: false,
    circlemarker: false,
    polyline: false,
    rectangle: false,
  },
  edit: {
    featureGroup: drawnItems,
    edit: false, // Disable editing for this example
    remove: false, // Disable removal for this example
  },
  
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (e) {
  var layer = e.layer;
  drawnItems.addLayer(layer);
  
});
  }

  render() {
    return <div id="leaflet-map" style={{ width: '100%', height: '80vh' }} />;
  }
}

export default LeafletMap;
