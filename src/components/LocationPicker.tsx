import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Фикс иконки Leaflet при сборке через Vite
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  coords: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

function ClickHandler({ onChange }: { onChange: (c: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyTo({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 17, { duration: 1 });
  }, [coords, map]);
  return null;
}

export default function LocationPicker({ coords, onChange }: Props) {
  const center: [number, number] = coords
    ? [coords.lat, coords.lng]
    : [44.895, 37.316];

  return (
    <MapContainer
      center={center}
      zoom={coords ? 17 : 14}
      style={{ height: "220px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      <FlyTo coords={coords} />
      {coords && (
        <Marker position={[coords.lat, coords.lng]} icon={markerIcon} />
      )}
    </MapContainer>
  );
}
