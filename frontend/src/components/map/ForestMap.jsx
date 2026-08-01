import { useEffect } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* =========================================================
   Leaflet Marker Fix
========================================================= */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* =========================================================
   Constants
========================================================= */

const DEFAULT_CENTER = [22.5937, 78.9629];

const RISK_CONFIG = {
  critical: {
    color: "#ef4444",
    label: "CRITICAL RISK",
    background: "rgba(239,68,68,0.15)",
  },

  warning: {
    color: "#f59e0b",
    label: "WARNING",
    background: "rgba(245,158,11,0.15)",
  },

  safe: {
    color: "#22c55e",
    label: "SAFE",
    background: "rgba(34,197,94,0.15)",
  },

  unknown: {
    color: "#60a5fa",
    label: "NOT ANALYZED",
    background: "rgba(59,130,246,0.15)",
  },
};

/* =========================================================
   Helpers
========================================================= */

function getRiskConfig(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (value.includes("critical") || value.includes("high")) {
    return RISK_CONFIG.critical;
  }

  if (
    value.includes("warning") ||
    value.includes("medium") ||
    value.includes("med")
  ) {
    return RISK_CONFIG.warning;
  }

  if (value.includes("safe") || value.includes("low")) {
    return RISK_CONFIG.safe;
  }

  return RISK_CONFIG.unknown;
}

function getValidCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }

  return {
    latitude: lat,
    longitude: lon,
  };
}

/* =========================================================
   Map Fly-To Controller
========================================================= */

function MapFlyTo({ center, zoom = 8 }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(center)) {
      return;
    }

    const coordinates = getValidCoordinates(center[0], center[1]);

    if (!coordinates) {
      return;
    }

    map.flyTo([coordinates.latitude, coordinates.longitude], zoom, {
      duration: 1.2,
    });
  }, [center, zoom, map]);

  return null;
}

/* =========================================================
   Forest Map
========================================================= */

function ForestMap({ regions = [], selectedRegionId, selectedCoords }) {
  /* =======================================================
     Selected Location
  ======================================================= */

  const activeCoordinates = getValidCoordinates(
    selectedCoords?.latitude,
    selectedCoords?.longitude,
  );

  const hasValidActiveCoords = Boolean(activeCoordinates);

  const activeLat = activeCoordinates?.latitude;

  const activeLon = activeCoordinates?.longitude;

  /* =======================================================
     Selected Risk
  ======================================================= */

  const selectedStatus =
    selectedCoords?.status || selectedCoords?.riskLevel || null;

  const selectedRisk = getRiskConfig(selectedStatus);

  return (
    <div
      className="
        relative
        w-full
        h-full
        overflow-hidden
      "
      style={{
        background: "#0f172a",
      }}
    >
      {/* ===================================================
          Map
      =================================================== */}

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={4}
        scrollWheelZoom
        className="w-full h-full"
        style={{
          minHeight: "500px",
          width: "100%",
        }}
      >
        {/* =================================================
            Map Tiles
        ================================================= */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* =================================================
            Selected / Custom Location
        ================================================= */}

        {hasValidActiveCoords && (
          <>
            <MapFlyTo center={[activeLat, activeLon]} zoom={8} />

            {/* Risk / Location Radius */}

            <Circle
              center={[activeLat, activeLon]}
              radius={45000}
              pathOptions={{
                color: selectedRisk.color,

                weight: 2,

                dashArray: "6, 6",

                fillColor: selectedRisk.color,

                fillOpacity: selectedStatus ? 0.14 : 0.07,
              }}
            />

            {/* Selected Location Marker */}

            <Marker position={[activeLat, activeLon]}>
              <Popup>
                <div
                  style={{
                    minWidth: "190px",
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                >
                  {/* Location Name */}

                  <p
                    style={{
                      margin: 0,

                      fontSize: "13px",
                      fontWeight: 700,

                      color: "#0f172a",
                    }}
                  >
                    {selectedCoords?.name || "Selected Location"}
                  </p>

                  {/* Status */}

                  <div
                    style={{
                      display: "inline-flex",

                      alignItems: "center",

                      gap: "5px",

                      marginTop: "8px",

                      padding: "4px 8px",

                      borderRadius: "7px",

                      background: selectedRisk.background,

                      border: `1px solid ${selectedRisk.color}35`,

                      color: selectedRisk.color,

                      fontSize: "9px",

                      fontWeight: 700,

                      letterSpacing: "0.04em",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",

                        borderRadius: "50%",

                        background: selectedRisk.color,
                      }}
                    />

                    {selectedRisk.label}
                  </div>

                  {/* Coordinates */}

                  <p
                    style={{
                      margin: "9px 0 0",

                      fontSize: "10px",

                      color: "#64748b",

                      fontFamily: "monospace",
                    }}
                  >
                    {activeLat.toFixed(4)}, {activeLon.toFixed(4)}
                  </p>

                  {/* Unknown notice */}

                  {!selectedStatus && (
                    <p
                      style={{
                        margin: "7px 0 0",

                        fontSize: "9px",

                        lineHeight: "1.5",

                        color: "#64748b",
                      }}
                    >
                      Run an analysis to determine the risk level for this
                      location.
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* =================================================
            Existing Forest Regions
        ================================================= */}

        {regions.map((region) => {
          const location = region?.coordinates?.[0];

          if (!location) {
            return null;
          }

          const validLocation = getValidCoordinates(
            location.latitude,
            location.longitude,
          );

          if (!validLocation) {
            return null;
          }

          /*
           * Don't draw the selected registered region
           * twice because it is already represented by
           * the active marker above.
           */

          const isSelected = region._id === selectedRegionId;

          if (isSelected && hasValidActiveCoords) {
            return null;
          }

          const regionRisk = getRiskConfig(region.status);

          return (
            <Marker
              key={region._id || region.regionId}
              position={[validLocation.latitude, validLocation.longitude]}
            >
              <Popup>
                <div
                  style={{
                    minWidth: "190px",

                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                >
                  {/* Region Name */}

                  <p
                    style={{
                      margin: 0,

                      fontSize: "13px",

                      fontWeight: 700,

                      color: "#0f172a",
                    }}
                  >
                    {region.name || "Forest Region"}
                  </p>

                  {/* Region ID */}

                  {region.regionId && (
                    <p
                      style={{
                        margin: "2px 0 0",

                        fontSize: "9px",

                        color: "#94a3b8",
                      }}
                    >
                      {region.regionId}
                    </p>
                  )}

                  {/* Divider */}

                  <div
                    style={{
                      height: "1px",

                      background: "#e2e8f0",

                      margin: "9px 0",
                    }}
                  />

                  {/* State */}

                  <div
                    style={{
                      display: "flex",

                      justifyContent: "space-between",

                      gap: "12px",

                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",

                        color: "#64748b",
                      }}
                    >
                      State
                    </span>

                    <span
                      style={{
                        fontSize: "9px",

                        fontWeight: 600,

                        color: "#334155",
                      }}
                    >
                      {region.state || "—"}
                    </span>
                  </div>

                  {/* District */}

                  {region.district && (
                    <div
                      style={{
                        display: "flex",

                        justifyContent: "space-between",

                        gap: "12px",

                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",

                          color: "#64748b",
                        }}
                      >
                        District
                      </span>

                      <span
                        style={{
                          fontSize: "9px",

                          fontWeight: 600,

                          color: "#334155",
                        }}
                      >
                        {region.district}
                      </span>
                    </div>
                  )}

                  {/* Status */}

                  <div
                    style={{
                      display: "flex",

                      justifyContent: "space-between",

                      alignItems: "center",

                      gap: "12px",

                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",

                        color: "#64748b",
                      }}
                    >
                      Status
                    </span>

                    <span
                      style={{
                        padding: "3px 7px",

                        borderRadius: "6px",

                        fontSize: "8px",

                        fontWeight: 700,

                        color: regionRisk.color,

                        background: regionRisk.background,
                      }}
                    >
                      {region.status || "Unknown"}
                    </span>
                  </div>

                  {/* Risk Score */}

                  <div
                    style={{
                      display: "flex",

                      justifyContent: "space-between",

                      gap: "12px",

                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",

                        color: "#64748b",
                      }}
                    >
                      Risk Score
                    </span>

                    <span
                      style={{
                        fontSize: "9px",

                        fontWeight: 600,

                        color: "#334155",
                      }}
                    >
                      {region.latestRiskScore ?? 0}
                      /100
                    </span>
                  </div>

                  {/* NDVI */}

                  <div
                    style={{
                      display: "flex",

                      justifyContent: "space-between",

                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",

                        color: "#64748b",
                      }}
                    >
                      NDVI
                    </span>

                    <span
                      style={{
                        fontSize: "9px",

                        fontWeight: 600,

                        color: "#334155",
                      }}
                    >
                      {Number(region.latestNDVI ?? 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Coordinates */}

                  <p
                    style={{
                      margin: "9px 0 0",

                      paddingTop: "7px",

                      borderTop: "1px solid #e2e8f0",

                      fontSize: "9px",

                      color: "#94a3b8",

                      fontFamily: "monospace",
                    }}
                  >
                    {validLocation.latitude.toFixed(4)},{" "}
                    {validLocation.longitude.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ===================================================
          Top Left Map Label
      =================================================== */}

      <div
        className="
          absolute
          top-3
          left-3
          z-[500]

          flex
          items-center
          gap-2

          px-3
          py-2

          rounded-xl

          pointer-events-none
        "
        style={{
          background: "rgba(15,23,42,0.88)",

          border: "1px solid rgba(148,163,184,0.14)",

          backdropFilter: "blur(10px)",

          boxShadow: "0 6px 20px rgba(0,0,0,0.20)",
        }}
      >
        <span
          style={{
            fontSize: "12px",
          }}
        >
          🌲
        </span>

        <div>
          <p
            className="
              text-[9px]
              font-semibold
              leading-none
            "
            style={{
              color: "#e2e8f0",
            }}
          >
            ForestGuard Map
          </p>

          <p
            className="
              text-[8px]
              mt-1
              leading-none
            "
            style={{
              color: "#64748b",
            }}
          >
            {regions.length} monitored{" "}
            {regions.length === 1 ? "region" : "regions"}
          </p>
        </div>
      </div>

      {/* ===================================================
          Risk Legend
      =================================================== */}

      <div
        className="
          absolute
          bottom-6
          left-3
          z-[500]

          hidden
          sm:block

          px-3
          py-2.5

          rounded-xl

          pointer-events-none
        "
        style={{
          background: "rgba(15,23,42,0.88)",

          border: "1px solid rgba(148,163,184,0.14)",

          backdropFilter: "blur(10px)",

          boxShadow: "0 6px 20px rgba(0,0,0,0.20)",
        }}
      >
        <p
          className="
            text-[8px]
            font-semibold
            uppercase
            tracking-wider
            mb-2
          "
          style={{
            color: "#94a3b8",
          }}
        >
          Risk Level
        </p>

        <div className="space-y-1.5">
          <LegendItem color="#22c55e" label="Safe" />

          <LegendItem color="#f59e0b" label="Warning" />

          <LegendItem color="#ef4444" label="Critical" />

          <LegendItem color="#60a5fa" label="Not analyzed" />
        </div>
      </div>

      {/* ===================================================
          Leaflet Styling
      =================================================== */}

      <style>
        {`
          .leaflet-container {
            font-family: Inter, system-ui, sans-serif;
            background: #0f172a;
          }

          .leaflet-popup-content-wrapper {
            border-radius: 12px;
            box-shadow:
              0 12px 35px
              rgba(0,0,0,0.25);
          }

          .leaflet-popup-content {
            margin: 13px;
          }

          .leaflet-popup-tip {
            box-shadow: none;
          }

          .leaflet-control-attribution {
            font-size: 8px !important;
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   Legend Item
========================================================= */

function LegendItem({ color, label }) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <span
        className="
          w-2
          h-2
          rounded-full
        "
        style={{
          background: color,
        }}
      />

      <span
        className="text-[8px]"
        style={{
          color: "#cbd5e1",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default ForestMap;
