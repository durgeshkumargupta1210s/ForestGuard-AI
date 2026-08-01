import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App";

import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: "#0f172a",
                        color: "#f1f5f9",
                        border: "1px solid rgba(255,255,255,0.1)",
                    },
                }}
            />
        </AuthProvider>
    </React.StrictMode>
);