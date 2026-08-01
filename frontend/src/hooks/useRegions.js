import { useEffect, useState } from "react";
import { getRegions } from "../services/region.service";

const SAMPLE_REGIONS = [
  {
    _id: "sample-reg-001",
    regionId: "KNP-001",
    name: "Kanha National Park",
    state: "Madhya Pradesh",
    district: "Mandla",
    forestType: "Tropical Moist Deciduous",
    status: "Critical",
    latestNDVI: 0.21,
    latestRiskScore: 88,
    area: 940,
    coordinates: [{ latitude: 22.33, longitude: 80.61 }],
  },
  {
    _id: "sample-reg-002",
    regionId: "PTR-002",
    name: "Pench Tiger Reserve",
    state: "Madhya Pradesh",
    district: "Seoni",
    forestType: "Dry Deciduous",
    status: "Critical",
    latestNDVI: 0.31,
    latestRiskScore: 74,
    area: 758,
    coordinates: [{ latitude: 21.75, longitude: 79.42 }],
  },
  {
    _id: "sample-reg-003",
    regionId: "SBR-003",
    name: "Satpura Biosphere Reserve",
    state: "Madhya Pradesh",
    district: "Hoshangabad",
    forestType: "Sal & Teak Forest",
    status: "Warning",
    latestNDVI: 0.35,
    latestRiskScore: 68,
    area: 2133,
    coordinates: [{ latitude: 22.57, longitude: 78.10 }],
  },
  {
    _id: "sample-reg-004",
    regionId: "BWS-004",
    name: "Bori Wildlife Sanctuary",
    state: "Madhya Pradesh",
    district: "Narmadapuram",
    forestType: "Mixed Deciduous",
    status: "Warning",
    latestNDVI: 0.49,
    latestRiskScore: 51,
    area: 518,
    coordinates: [{ latitude: 22.49, longitude: 77.97 }],
  },
  {
    _id: "sample-reg-005",
    regionId: "MTR-005",
    name: "Melghat Tiger Reserve",
    state: "Maharashtra",
    district: "Amravati",
    forestType: "Teak Dominant",
    status: "Warning",
    latestNDVI: 0.52,
    latestRiskScore: 46,
    area: 1677,
    coordinates: [{ latitude: 21.45, longitude: 77.29 }],
  },
  {
    _id: "sample-reg-006",
    regionId: "TAR-006",
    name: "Tadoba-Andhari Reserve",
    state: "Maharashtra",
    district: "Chandrapur",
    forestType: "Southern Tropical Dry",
    status: "Safe",
    latestNDVI: 0.71,
    latestRiskScore: 18,
    area: 625,
    coordinates: [{ latitude: 20.23, longitude: 79.41 }],
  },
];

function useRegions(params = {}) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getRegions({ limit: 100, ...params });

        const regionList = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.regions)
            ? res.data.regions
            : Array.isArray(res)
              ? res
              : [];

        setRegions(regionList.length > 0 ? regionList : SAMPLE_REGIONS);
      } catch (err) {
        console.error("useRegions error:", err);
        setError(err);
        setRegions(SAMPLE_REGIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [JSON.stringify(params)]);

  return { regions, loading, error };
}

export default useRegions;
