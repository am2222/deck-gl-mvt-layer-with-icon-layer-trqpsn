import './style.css';
import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer, IconLayer } from '@deck.gl/layers';
import { MVTLayer } from '@deck.gl/geo-layers';
import axios from 'axios';
import mapsApiClient from './mapsApiClient';

const INITIAL_VIEW_STATE = {
  zoom: 8,
  longitude: -0.2416787,
  latitude: 51.5287718,
  bearing: 0,
  pitch: 0
};

const deck = new Deck({
  canvas: document.getElementById('deck'),
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  useDevicePixels: true
});

function loadLayers() {
  Promise.all([
    mapsApiClient.fetchMVTTemplate('select * from ne_50m_admin_0_countries'),
    mapsApiClient.fetchMVTTemplate(
      'select cartodb_id, ST_Transform(ST_SetSRID(ST_Centroid(the_geom), 4326), 3857) as the_geom_webmercator from london_neighbourhoods'
    )
  ]).then(values => {
    const layer1 = new MVTLayer({
      id: 'layer1',
      getLineColor: [192, 192, 192],
      getFillColor: [140, 170, 180],
      data: values[0].urls
    });

    const layer2 = new MVTLayer({
      id: 'layer2',
      data: values[1].urls,
      getPosition: f => f.geometry.coordinates,
      renderSubLayers: props => {
        return new IconLayer(props, {
          iconAtlas:
            'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
          iconMapping: {
            marker: { x: 0, y: 0, width: 128, height: 128 }
          },
          getIcon: () => 'marker',
          sizeScale: 1.5,
          getSize: 25
        });
      }
    });

    deck.setProps({ layers: [layer1, layer2] });

    window.deckMap = deck;
  });
}

loadLayers();
