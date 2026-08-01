import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import Analysis from "../pages/Analysis/Analysis";
import Report from "../pages/Report/Report";
import Alerts from "../pages/Alerts/Alerts";
import Settings from "../pages/Settings/Settings";
import Region from "../pages/Region/Region";
import Timelapse from "../pages/Timelapse/Timelapse";
import Compare from "../pages/Compare/Compare";
import Explainability from "../pages/Explainability/Explainability";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/analysis"
                    element={
                        <ProtectedRoute>
                            <Analysis />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/timelapse"
                    element={
                        <ProtectedRoute>
                            <Timelapse />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/compare"
                    element={
                        <ProtectedRoute>
                            <Compare />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/explainability"
                    element={
                        <ProtectedRoute>
                            <Explainability />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <Report />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/alerts"
                    element={
                        <ProtectedRoute>
                            <Alerts />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/regions"
                    element={
                        <ProtectedRoute>
                            <Region />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>

    );

}

export default AppRoutes;