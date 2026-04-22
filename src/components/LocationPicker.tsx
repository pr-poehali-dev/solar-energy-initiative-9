import { useEffect, useRef } from "react";
import L from "leaflet";

interface Props {
  coords: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
}

export default function LocationPicker({ coords, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: coords ? [coords.lat, coords.lng] : [44.895, 37.316],
      zoom: coords ? 17 : 14,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !coords) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    } else {
      markerRef.current = L.marker([coords.lat, coords.lng]).addTo(map);
    }

    map.flyTo([coords.lat, coords.lng], 17, { duration: 1 });
  }, [coords]);

  return (
    <div
      ref={containerRef}
      style={{ height: "220px", width: "100%" }}
    />
  );
}
