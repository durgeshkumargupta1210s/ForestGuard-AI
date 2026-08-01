import mongoose from "mongoose";
import Region from "../models/Region.js";

export const SEED_REGIONS = [
  {
    regionId: "KNP-001",
    name: "Kanha National Park",
    description: "Core tiger habitat with critical canopy loss along eastern boundary.",
    state: "Madhya Pradesh",
    district: "Mandla",
    forestType: "Tropical",
    status: "Critical",
    latestNDVI: 0.21,
    latestRiskScore: 88,
    area: 940,
    coordinates: [{ latitude: 22.33, longitude: 80.61 }],
    isActive: true,
  },
  {
    regionId: "PTR-002",
    name: "Pench Tiger Reserve",
    description: "Selective logging and encroachment along western buffer zone.",
    state: "Madhya Pradesh",
    district: "Seoni",
    forestType: "Tropical",
    status: "Critical",
    latestNDVI: 0.31,
    latestRiskScore: 74,
    area: 758,
    coordinates: [{ latitude: 21.75, longitude: 79.42 }],
    isActive: true,
  },
  {
    regionId: "SBR-003",
    name: "Satpura Biosphere Reserve",
    description: "High risk from combined drought stress and linear road clearing.",
    state: "Madhya Pradesh",
    district: "Hoshangabad",
    forestType: "Tropical",
    status: "Warning",
    latestNDVI: 0.35,
    latestRiskScore: 68,
    area: 2133,
    coordinates: [{ latitude: 22.57, longitude: 78.10 }],
    isActive: true,
  },
  {
    regionId: "BWS-004",
    name: "Bori Wildlife Sanctuary",
    description: "Moderate canopy thinning with 11% estimated vegetation loss.",
    state: "Madhya Pradesh",
    district: "Narmadapuram",
    forestType: "Mixed",
    status: "Warning",
    latestNDVI: 0.49,
    latestRiskScore: 51,
    area: 518,
    coordinates: [{ latitude: 22.49, longitude: 77.97 }],
    isActive: true,
  },
  {
    regionId: "MTR-005",
    name: "Melghat Tiger Reserve",
    description: "Localised 9% canopy stress in northern corridor patch.",
    state: "Maharashtra",
    district: "Amravati",
    forestType: "Tropical",
    status: "Warning",
    latestNDVI: 0.52,
    latestRiskScore: 46,
    area: 1677,
    coordinates: [{ latitude: 21.45, longitude: 77.29 }],
    isActive: true,
  },
  {
    regionId: "TAR-006",
    name: "Tadoba-Andhari Reserve",
    description: "Dense, healthy canopy with 92% pixel stability.",
    state: "Maharashtra",
    district: "Chandrapur",
    forestType: "Tropical",
    status: "Safe",
    latestNDVI: 0.71,
    latestRiskScore: 18,
    area: 625,
    coordinates: [{ latitude: 20.23, longitude: 79.41 }],
    isActive: true,
  },
  {
    regionId: "GFR-007",
    name: "Gir Forest National Park",
    description: "Thriving teak and acacia forest with strong natural regeneration.",
    state: "Gujarat",
    district: "Junagadh",
    forestType: "Tropical",
    status: "Safe",
    latestNDVI: 0.76,
    latestRiskScore: 12,
    area: 1412,
    coordinates: [{ latitude: 21.12, longitude: 70.82 }],
    isActive: true,
  },
];

export const seedInitialRegions = async () => {
  try {
    await Region.deleteMany({
      name: { $in: ["Kanha Test Block", "Bug Test Region", "Test Region", "Custom Location"] }
    });

    for (const r of SEED_REGIONS) {
      await Region.findOneAndUpdate(
        { regionId: r.regionId },
        { $set: r },
        { upsert: true, new: true }
      );
    }
    console.log("🌲 Cleaned test duplicates & seeded 7 distinct forest reserves into MongoDB!");
  } catch (err) {
    console.error("Seeding error:", err.message);
  }
};
export const createRegion = async (regionData) => {
    const existingRegion = await Region.findOne({
        regionId: regionData.regionId,
        isActive: true,
    });

    if (existingRegion) {
        throw new Error("Region with this Region ID already exists.");
    }

    return await Region.create(regionData);
};

/**
 * Get All Regions
 */
export const getAllRegions = async ({
    search = "",
    state,
    status,
    forestType,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
}) => {
    const query = {
        isActive: true,
    };

    if (search) {
        query.$or = [
            { regionId: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
            { state: { $regex: search, $options: "i" } },
            { district: { $regex: search, $options: "i" } },
            { forestType: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    if (state) query.state = state;

    if (status) query.status = status;

    if (forestType) query.forestType = forestType;

    const skip = (Number(page) - 1) * Number(limit);

    const regions = await Region.find(query)
        .populate("createdBy", "name email")
        .sort({
            [sortBy]: order === "asc" ? 1 : -1,
        })
        .skip(skip)
        .limit(Number(limit));

    const total = await Region.countDocuments(query);

    return {
        regions,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get Region By ID
 */
export const getRegionById = async (id) => {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id, isActive: true } : { regionId: id, isActive: true };
    return await Region.findOne(query).populate("createdBy", "name email");
};

/**
 * Update Region
 */
export const updateRegion = async (id, data) => {
    if (data.regionId) {
        const existing = await Region.findOne({
            regionId: data.regionId,
            _id: { $ne: id },
            isActive: true,
        });

        if (existing) {
            throw new Error("Region ID already exists.");
        }
    }

    return await Region.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true,
        }
    );
};

/**
 * Archive Region (Soft Delete)
 */
export const deleteRegion = async (id) => {
    return await Region.findByIdAndUpdate(
        id,
        {
            isActive: false,
        },
        {
            new: true,
        }
    );
};

/**
 * Region Statistics
 */
export const getRegionStatistics = async () => {
    const total = await Region.countDocuments({
        isActive: true,
    });

    const safe = await Region.countDocuments({
        status: "Safe",
        isActive: true,
    });

    const warning = await Region.countDocuments({
        status: "Warning",
        isActive: true,
    });

    const critical = await Region.countDocuments({
        status: "Critical",
        isActive: true,
    });

    return {
        total,
        safe,
        warning,
        critical,
    };
};

/**
 * Get Critical Regions
 */
export const getCriticalRegions = async () => {
    return await Region.find({
        status: "Critical",
        isActive: true,
    }).sort({
        latestRiskScore: -1,
    });
};

/**
 * Toggle Email Alerts
 */
export const toggleEmailAlerts = async (id) => {
    const region = await Region.findById(id);

    if (!region) {
        throw new Error("Region not found");
    }

    region.emailAlertEnabled = !region.emailAlertEnabled;

    await region.save();

    return region;
};

/**
 * Archive Region
 */
export const archiveRegion = async (id) => {
    return await Region.findByIdAndUpdate(
        id,
        {
            isActive: false,
        },
        {
            new: true,
        }
    );
};