import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

interface UserMapProps {
  users: { id: number; name: string; lat: number; lng: number }[]
}

export function UserMap({ users }: UserMapProps) {
  return (
    <MapContainer
      center={[48.8566, 2.3522]}
      zoom={12}
      style={{ width: "100%", height: "90vh" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {users.map((user) => (
        <Marker key={user.id} position={[user.lat, user.lng]}>
          <Popup>{user.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
