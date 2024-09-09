import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import L from 'leaflet'
import './App.css'
import { Circle, MapContainer, TileLayer, useMap } from 'react-leaflet'
import StartRender from "./StartRender";

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

  return [randomLatitude, randomLongitude];
}

function App() {
  const [start, setStart] = useState(false)
  const position = [
    -6.1570886140342225,
    107.01248981683705
  ]
  const handleClick = () => {
    setStart(true);
  }
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
      <MapContainer center={position} zoom={14} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }} >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {start && <RenderCirles />}
        <StartRender
          title="Start Render"
          handleClick={handleClick}
        />
      </MapContainer>
    </>
  )
}

const RenderCirles = () => {
  const map = useMap();

  const [allCircles, setAllCircles] = useState([]);
  const circlesUpdater = useRef(null);


  // Let's add or update all circles on map every N seconds

  useEffect(() => {
    circlesUpdater.current = setInterval(() => {
      setAllCircles((prev) => {
        const newPrev = [...prev];
        prev.forEach(circleMeta => {
          const ll = circleMeta.circle.center;
    
          const radEarth = 6378;  // km
          const dy = 0.01 * circleMeta.theta;
          const dx = 0.01 * circleMeta.theta;
          const degFactor = circleMeta.theta * 180;
          const newLat = ll?.[0]  + (dy / radEarth) * (degFactor / Math.PI);
          const newLng = ll?.[1] + (dx / radEarth) * (degFactor / Math.PI) / Math.cos(ll?.[0] * Math.PI/degFactor);
    
          const newPos = new L.LatLng(newLat, newLng);
          if (map.getBounds().contains(newPos)) {
            circleMeta.circle.center = [newLat, newLng];
          } else {
            circleMeta.circle.center = getRandomLatLng(map);
          }
          
        });
        return newPrev;
      })  
      
      const newCircle = {
        center: getRandomLatLng(map)
      };
  
      setAllCircles((prev) => ([
        ...prev,
        {
          circle: newCircle,
          theta: (Math.random() * 2) - 1,
        }
      ]))
    }, 2);
  
    return () => {
  
      clearInterval(circlesUpdater.current);
    }
  }, [map])  
  
  useEffect(() => {
        
    if (allCircles.length > 2000) {
      clearInterval(circlesUpdater.current);
    }

  }, [allCircles.length])

  return (
    <>
      {allCircles?.map((circle, index) => <Circle key={index} {...circle.circle} pathOptions={{ color: 'red',  fillColor: '#f03', fillOpacity: 0.5 }} radius={50} />)}
    </>
  )
}

export default App
