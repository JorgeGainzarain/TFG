const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
    // Serve static files from the React app (build folder)
    app.use(express.static(path.join(__dirname, "../frontend/build")));

    // Serve the React app for any unknown routes
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
    });
} else {
    // In development, redirect API requests to the backend
    app.get("/", (req, res) => {
        res.send("Backend is running. Use the React development server for the frontend.");
    });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});