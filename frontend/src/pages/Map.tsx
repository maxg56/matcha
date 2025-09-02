import { UserMap } from "@/components/map/UserMap";

const mockUsers = [
  { id: 1, name: "Alice", lat: 48.8566, lng: 2.3522 }, // Paris
  { id: 2, name: "Bob", lat: 45.7640, lng: 4.8357 },  // Lyon
  { id: 3, name: "Charlie", lat: 43.6047, lng: 1.4442 } // Toulouse
];

export default function MapPage() {
  return (
    <div className="min-h-screen text-foreground bg-white dark:bg-gray-800">
      <h1 className="text-xl font-bold mb-4">Carte des utilisateurs</h1>
      <UserMap users={mockUsers} />
    </div>
  );
}
