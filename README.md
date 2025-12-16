# Eagle Eye Navigation App | V1.0.0.0

**"Eagle Eye: Precision Navigation at a Glance."**

A robust and user-friendly web application designed to provide reliable routing and location services. Built using a modern stack of Vanilla JavaScript and Tailwind CSS on the frontend, powered by a secure FastAPI backend proxy for geocoding.

## ✨ Features

- **Geocoding:** Input an address (e.g., "Accra, Ghana" or "9.4051992,-0.8423986") and find its precise location.
- **Interactive Mapping:** Select destinations directly on a Leaflet map.
- **Real-Time Tracking:** Use the Geolocation API to track the user's live position.
- **Route Snapping:** Utilizes Turf.js to "snap" the user's marker precisely onto the drawn road network, preventing GPS drift.
- **Responsive UI:** A clean, mobile-friendly interface designed with Tailwind CSS and the _Eagle Eye_ branding.
- **Secure Backend Proxy:** API keys are secured server-side using a Vercel-deployed FastAPI service with automatic fallback to Nominatim.

## 🚀 Technologies Used

### Frontend (Client-Side)

- **HTML5:** Application structure across four pages (Home, Map, Info, About).
- **Tailwind CSS:** Utility-first framework for a modern, responsive UI.
- **Vanilla JavaScript:** Handles all application logic, routing, and data management via `sessionStorage`.
- **[Leaflet.js](leafletjs.com):** The core interactive map library.
- **[Leaflet Routing Machine](www.liedman.net):** Draws routes and provides instructions.
- **[Turf.js](turfjs.org):** Advanced geospatial analysis library for accurate map-matching/snapping.
- **[Toastify-js](github.com):** Lightweight library for non-blocking UI notifications (toasts).
- **[Font Awesome](fontawesome.com):** Icons used throughout the interface.

### Backend & Infrastructure

- **[FastAPI](fastapi.tiangolo.com):** (Used for the separate proxy server) Secure API management.
- **[Vercel](https://vercel.com):** Free hosting for the backend proxy server (serverless functions).

## 📐 Architecture

The application uses a 4-page HTML structure managed by vanilla JavaScript. Data (coordinates, route info) is passed between pages using the browser's `sessionStorage`.

A separate [**Eagle Eye Proxy Server**](https://github.com/TheEagle-Benson/eagle-eye-proxy) handles all geocoding requests securely, ensuring no API keys are exposed on the client side.

## 🏁 Getting Started (Frontend Development)

To run this application locally:

### Prerequisites

1.  A modern web browser (Chrome, Firefox, Safari).
2.  Node.js and npm (for managing Tailwind CSS compilation).

### Installation

1.  **Clone this repository:**

    ```bash
    git clone https://github.com/TheEagle-Benson/eagle-eye
    cd Eagle-Eye
    ```

2.  **Install Tailwind CSS dependencies:**

    ```bash
    npm install
    ```

3.  **Run the Tailwind CLI in watch mode:**
    This command compiles your `input.css` file to `output.css` every time you make a change.

    ```bash
    npx tailwindcss -i ./css/input.css -o ./css/output.css --watch
    ```

4.  **Open the application:**
    Serve the `index.html` file using a simple local server (e.g., `live-server` or VS Code's Live Server extension).

## 🕹️ Usage

1.  **Home Page:** Input your destination address or select a point on the map modal.
2.  **Map Page:** View the generated route, track your position (if location access is granted), and witness the marker snapping to the road.
3.  **Info Page:** View route details, distance, time, and weather information for your locations.

## 🖼️ Branding & Logo

The **Eagle Eye** logo is a clean line-art design that reflects precision and vision, developed by The Eagle.

## 🤝 Contributing

Contributions are welcome! If you find a bug or want to suggest a feature, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
