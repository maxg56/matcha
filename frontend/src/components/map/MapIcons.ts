import L from "leaflet";

// Créer des icônes personnalisées pour la carte
export const currentUserIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path fill="#e74c3c" stroke="#c0392b" stroke-width="2" d="M12.5,0C5.6,0,0,5.6,0,12.5c0,6.9,12.5,28.5,12.5,28.5s12.5-21.6,12.5-28.5C25,5.6,19.4,0,12.5,0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#e74c3c" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41" width="41" height="41">
      <ellipse fill="#000" opacity="0.3" cx="20.5" cy="37" rx="18" ry="4"/>
    </svg>
  `),
  shadowSize: [41, 41],
  shadowAnchor: [12, 40]
});

export const otherUserIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path fill="#3498db" stroke="#2980b9" stroke-width="2" d="M12.5,0C5.6,0,0,5.6,0,12.5c0,6.9,12.5,28.5,12.5,28.5s12.5-21.6,12.5-28.5C25,5.6,19.4,0,12.5,0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#3498db" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41" width="41" height="41">
      <ellipse fill="#000" opacity="0.3" cx="20.5" cy="37" rx="18" ry="4"/>
    </svg>
  `),
  shadowSize: [41, 41],
  shadowAnchor: [12, 40]
});

export const highlightedUserIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path fill="#f39c12" stroke="#e67e22" stroke-width="2" d="M12.5,0C5.6,0,0,5.6,0,12.5c0,6.9,12.5,28.5,12.5,28.5s12.5-21.6,12.5-28.5C25,5.6,19.4,0,12.5,0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
      <circle fill="#f39c12" cx="12.5" cy="12.5" r="3"/>
    </svg>
  `),
  iconSize: [30, 50],
  iconAnchor: [15, 50],
  popupAnchor: [1, -40],
  shadowUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41 41" width="41" height="41">
      <ellipse fill="#000" opacity="0.4" cx="20.5" cy="37" rx="20" ry="5"/>
    </svg>
  `),
  shadowSize: [45, 45],
  shadowAnchor: [15, 45]
});