import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"

interface UserMapProps {
  users: { id: number; name: string; lat: number; lng: number }[]
}

export function UserMap({ users }: UserMapProps) {
  return (
    <MapContainer
      style={{ width: "100%", height: "90vh" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {users.map((user) => (
        <Marker key={user.id} position={[user.lat, user.lng]}>
          <Popup>{user.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
