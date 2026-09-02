import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

// O bundler do Vite não resolve os ícones default do Leaflet automaticamente
// (referências relativas quebram fora do contexto do pacote). Registrar
// manualmente é o fix padrão recomendado pela própria comunidade Leaflet+Vite.
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export interface MapPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
}

export function PlacesMap({ center, places }: { center: LatLngExpression; places: MapPlace[] }) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full rounded-xl"
      style={{ minHeight: 320 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{place.name}</p>
              <p className="text-xs text-gray-500">{place.category}</p>
              {place.address !== 'UNKNOWN' && <p className="mt-1">{place.address}</p>}
              {place.phone !== 'UNKNOWN' && <p>{place.phone}</p>}
              {place.website !== 'UNKNOWN' && (
                <a href={place.website} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {place.website}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
