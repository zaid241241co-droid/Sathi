import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function MapController({ location, route }) {
  const map = useMap();

  useEffect(() => {
    if (route.length > 1) {
      map.fitBounds(L.latLngBounds(route), {
        padding: [40, 40],
        maxZoom: 15,
      });
    } else if (location) {
      map.setView(location, 15);
    }
  }, [location, route, map]);

  return null;
}

function MapStyleButton({ satellite, setSatellite }) {
  return (
    <button
      className="map-style-button"
      onClick={() => setSatellite(!satellite)}
      type="button"
    >
      {satellite ? "🗺️ Map" : "🛰️ Satellite"}
    </button>
  );
}

export default function RealMap({
  destination = "",
  time = "Now",
  destinationPoint: externalDestination = null,
  onJourneyComplete = null,
}) {
  const [location, setLocation] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [route, setRoute] = useState([]);
  const [satellite, setSatellite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState("");

  const finalDestination = externalDestination || destinationPoint;

const [journeyCompleted, setJourneyCompleted] = useState(false);

  const defaultPosition = [19.076, 72.8777];

  useEffect(() => {
  const savedLocation = sessionStorage.getItem("sathiLocation");

  if (savedLocation) {
    try {
      const parsed = JSON.parse(savedLocation);
      setLocation(parsed);
      setLoading(false);
    } catch {
      sessionStorage.removeItem("sathiLocation");
    }
  }

  const watchId = navigator.geolocation.watchPosition(
  (position) => {
    const newLocation = [
      position.coords.latitude,
      position.coords.longitude,
    ];

    sessionStorage.setItem(
      "sathiLocation",
      JSON.stringify(newLocation)
    );

    setLocation(newLocation);
    setLoading(false);
  },
  () => {
    if (!savedLocation) {
      setLocation(defaultPosition);
    }

    setLoading(false);
  },
  {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 5000,
  }
);

return () => {
  navigator.geolocation.clearWatch(watchId);
};
}, []);

 useEffect(() => {
  if (!location) return;

  // Safe Haven route
  if (externalDestination) {
    const findSafeHavenRoute = async () => {
      setRouteLoading(true);
      setError("");

      try {
        const routeResponse = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${location[1]},${location[0]};${externalDestination[1]},${externalDestination[0]}?overview=full&geometries=geojson`
        );

        const routeData = await routeResponse.json();

        if (
          routeData.code !== "Ok" ||
          !routeData.routes?.length
        ) {
          setError("Could not find a road route.");
          setRouteLoading(false);
          return;
        }

        const coordinates =
          routeData.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );

        setRoute(coordinates);
      } catch (err) {
        console.error(err);
        setError("Unable to load route.");
      }

      setRouteLoading(false);
    };

    findSafeHavenRoute();
    return;
  }

  // Normal destination route
  if (!destination) return;

  if (destination.trim().toLowerCase() === "college") {
    setDestinationPoint(null);
    setRoute([]);
    setError("");
    return;
  }

  const findRoute = async () => {
    setRouteLoading(true);
    setError("");

    try {
      const reverseResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location[0]}&lon=${location[1]}&zoom=10`
      );

      const reverseData = await reverseResponse.json();

      const city =
        reverseData.address?.city ||
        reverseData.address?.town ||
        reverseData.address?.municipality ||
        reverseData.address?.village ||
        "";

      const searchText = city
        ? `${destination}, ${city}, India`
        : `${destination}, India`;

      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(
          searchText
        )}`
      );

      const places = await geoResponse.json();

      if (!places.length) {
        setError("Destination not found. Try a more specific place name.");
        setRouteLoading(false);
        return;
      }

      const dest = [
        Number(places[0].lat),
        Number(places[0].lon),
      ];

      setDestinationPoint(dest);

      const routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${location[1]},${location[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`
      );

      const routeData = await routeResponse.json();

      if (
        routeData.code !== "Ok" ||
        !routeData.routes?.length
      ) {
        setError("Could not find a road route.");
        setRouteLoading(false);
        return;
      }

      const coordinates =
        routeData.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

      setRoute(coordinates);
    } catch (err) {
      console.error(err);
      setError("Unable to load route.");
    }

    setRouteLoading(false);
  };

  findRoute();
}, [destination, location, externalDestination]);

useEffect(() => {
  if (!location || !finalDestination || journeyCompleted) return;

  const R = 6371000;

  const lat1 = (location[0] * Math.PI) / 180;
  const lat2 = (finalDestination[0] * Math.PI) / 180;
  const dLat = ((finalDestination[0] - location[0]) * Math.PI) / 180;
  const dLon = ((finalDestination[1] - location[1]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (distance <= 75) {
    setJourneyCompleted(true);

    if (onJourneyComplete) {
      onJourneyComplete();
    }
  }
}, [location, finalDestination, journeyCompleted, onJourneyComplete]);

  return (
    <div className="real-map-wrapper">
      {error && <div className="map-error">{error}</div>}

      {routeLoading && (
        <div className="map-loading">
          Finding your route...
        </div>
      )}

      <MapContainer
  center={location || defaultPosition}
  zoom={15}
  scrollWheelZoom={true}
  className="real-map"
  preferCanvas={true}
>
        {satellite ? (
          <TileLayer
            attribution="Tiles © Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {location && (
          <Marker position={location}>
            <Popup>
              <strong>You are here</strong>
              <br />
              SATHI starting point
            </Popup>
          </Marker>
        )}

       {finalDestination && (
  <Marker position={finalDestination}>
    <Popup>
      <strong>{destination || "Safe Haven"}</strong>
      <br />
      Destination
    </Popup>
  </Marker>
)}

       {route.length > 1 && (
  <>
    <Polyline
      positions={route.slice(
        0,
        time === "11 PM" ? Math.floor(route.length * 0.25) :
        time === "9 PM" ? Math.floor(route.length * 0.35) :
        Math.floor(route.length * 0.55)
      )}
      pathOptions={{
        color: "#2f8f68",
        weight: 7,
        opacity: 0.95,
      }}
    />

    <Polyline
      positions={route.slice(
        time === "11 PM" ? Math.floor(route.length * 0.23) :
        time === "9 PM" ? Math.floor(route.length * 0.33) :
        Math.floor(route.length * 0.53),

        time === "11 PM" ? Math.floor(route.length * 0.55) :
        time === "9 PM" ? Math.floor(route.length * 0.62) :
        Math.floor(route.length * 0.78)
      )}
      pathOptions={{
        color: "#e4a23a",
        weight: 7,
        opacity: 0.95,
      }}
    />

    <Polyline
      positions={route.slice(
        time === "11 PM" ? Math.floor(route.length * 0.53) :
        time === "9 PM" ? Math.floor(route.length * 0.60) :
        Math.floor(route.length * 0.76)
      )}
      pathOptions={{
        color: "#d65a52",
        weight: 7,
        opacity: 0.95,
      }}
    />
  </>
)}

        <MapController
          location={location}
          route={route}
        />

        <MapStyleButton
          satellite={satellite}
          setSatellite={setSatellite}
        />
      </MapContainer>

      {loading && (
        <div className="map-loading">
          Getting your location...
        </div>
      )}
    </div>
  );
}