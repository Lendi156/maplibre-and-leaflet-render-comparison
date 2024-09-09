import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Map, NavigationControl, useControl } from "react-map-gl/maplibre"
import maplibregl, { LngLat } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback, useRef } from 'react';

const OSM_MAP = {
  version: 8,
  name: "MapLibre Demo Tiles",
  sources: {
    "osm": {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
      maxzoom: 19
    }
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm" // This must match the source key above
    }
  ]
};

const inBounds = (map, newPos) => {
  const bounds = map?.getBounds(); // Get the current map bounds
  const newPosTransformed = new LngLat(newPos?.[0] ? newPos?.[0] : 0, newPos?.[1] ? newPos?.[1] : 0)

    return bounds?.contains(newPosTransformed);
}

function getRandomLatLng(map) {
  const bounds = map.getBounds();
  const bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
  if (bbox.length !== 4) {
      throw new Error('Bounding box must be an array of four numbers: [west, south, east, north]');
  }

  const [west, south, east, north] = bbox;

  // Generate random longitude within the bounding box
  const randomLongitude = west + Math.random() * (east - west);

  // Generate random latitude within the bounding box
  const randomLatitude = south + Math.random() * (north - south);

  return [randomLongitude, randomLatitude];
}

const thetas = [1];

const refData = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          107.01248981683705,
          -6.1570886140342225
          ],
        "type": "Point"
      }
    }
  ]
}


function App() {
  const mapRef = useRef();

  const startRender = useCallback(() => {
    const map = mapRef?.current?.getMap();
    map?.addSource('circlesSet', { type: 'geojson', data: refData });

    map?.addLayer({
        "id": "circlesSet",
        "type": "circle",
        "source": 'circlesSet',
      "paint": {
        "circle-color": "#f03",
        "circle-opacity": 0.5,
        "circle-stroke-color": "red",
        "circle-stroke-width": 2
        }
    });

    // Let's add or update all circles on map every N seconds
    const circlesUpdater = setInterval(() => {
      for (let i=0; i < thetas.length; i++) {
        let ll = refData.features[i].geometry.coordinates;
        let theta = thetas[i];

        const radEarth = 6378;  // km
        const dy = 0.01 * theta;
        const dx = 0.01 * theta;
        const degFactor = theta * 180;
        const newLng = ll[0]  + (dy / radEarth) * (degFactor / Math.PI);
        const newLat = ll[1] + (dx / radEarth) * (degFactor / Math.PI) / Math.cos(ll[0] * Math.PI/degFactor);

        const newPos = [newLng, newLat];

        if (inBounds(map, newPos)) {
          refData.features[i].geometry.coordinates = newPos;
        } else {
          refData.features[i].geometry.coordinates = getRandomLatLng(map);
        }
      }

      // // document.getElementById('count').textContent = `${thetas.length} dots`;
      if (thetas.length > 2000) {
        clearInterval(circlesUpdater);
      }


      // Add another circle with random direction
      thetas.push(Math.random());
    
      refData.features.push({
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": getRandomLatLng(map),
          "type": "Point"
        }
      })
      // refData.features[0].geometry.coordinates.push(getRandomLatLng(map));

      // Update the map
      map?.getSource('circlesSet')?.setData(refData);

    }, 2);
  }, [mapRef])

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <main>
        <Map
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={{
            longitude: 106.82016488320335,
            latitude: -6.203719445771469,
            zoom: 14
          }}
          mapStyle={OSM_MAP}
        >
          <NavigationControl position="top-left" />
          <ButtonControl startRender={startRender}/>
        </Map>
      </main>
    </>
  )
}


class ButtonCheckControl {
  constructor(text, callback) {
    this._text = text;
    this._callback = callback;
  }
  onAdd(map) {
      this._map = map;
      this._container = document.createElement('button');
      this._container.className = 'maplibregl-ctrl';
      this._container.addEventListener("contextmenu", (e) => e.preventDefault());
      this._container.addEventListener("click", () => this._callback());
      this._container.textContent = this._text;
      return this._container;
  }

  onRemove() {
      this._container.parentNode.removeChild(this._container);
      this._map = undefined;
  }
}

// eslint-disable-next-line react/prop-types
function ButtonControl({ startRender }) {
  const onClick = () => {
    startRender()
  };
  useControl(() => new ButtonCheckControl('Start Render', () => onClick()), {position: 'bottom-right',});
  return null;
}

export default App
