const socket = io();

// Initialize the map with a default view
let map = L.map("map").setView([0, 0], 2); // Start with a global view

// Add a tile layer to the map (this is required for the map to display)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Marker for the current user's location
let userMarker;
let otherMarkers = {}; // To keep track of other users' markers

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            // Emit the user's location to the server
            socket.emit("send-location", { latitude, longitude });

            // Update map view to the user's current position
            map.setView([latitude, longitude], 13);

            // If the marker exists, update its position; otherwise, create a new marker
            if (userMarker) {
                userMarker.setLatLng([latitude, longitude]);
            } else {
                userMarker = L.marker([latitude, longitude]).addTo(map)
                    .bindPopup("You are here!")
                    .openPopup();
            }
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    alert("Geolocation is not supported by your browser.");
}

// Listen for other users' locations from the server
socket.on("receive-location", (data) => {
    const { latitude, longitude } = data;

    // Check if there's already a marker for this other user
    if (otherMarkers[socket.id]) {
        otherMarkers[socket.id].setLatLng([latitude, longitude]);
    } else {
        // Create a new marker for the other user
        const otherMarker = L.marker([latitude, longitude]).addTo(map)
            .bindPopup("Other user is here!")
            .openPopup();

        // Store this marker for future updates
        otherMarkers[socket.id] = otherMarker;
    }
});
