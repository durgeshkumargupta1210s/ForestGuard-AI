import * as regionService from "../services/region.service.js";

/**
 * Create Region
 */
export const createRegion = async (req, res) => {
    try {
        const region = await regionService.createRegion({
            ...req.body,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Region created successfully",
            data: region,
        });

    } catch (error) {

        const status =
            error.message.includes("already exists") ? 409 : 400;

        res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Get All Regions
 */
export const getAllRegions = async (req, res) => {
    try {

        const {
            search,
            state,
            status,
            forestType,
            page,
            limit,
            sortBy,
            order,
        } = req.query;

        const result = await regionService.getAllRegions({
            search,
            state,
            status,
            forestType,
            page,
            limit,
            sortBy,
            order,
        });

        res.status(200).json({
            success: true,
            data: result.regions,
            pagination: result.pagination,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Get Region By ID
 */
export const getRegionById = async (req, res) => {
    try {

        const region = await regionService.getRegionById(req.params.id);

        if (!region) {
            return res.status(404).json({
                success: false,
                message: "Region not found",
            });
        }

        res.status(200).json({
            success: true,
            data: region,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Update Region
 */
export const updateRegion = async (req, res) => {
    try {

        const region = await regionService.updateRegion(
            req.params.id,
            req.body
        );

        if (!region) {
            return res.status(404).json({
                success: false,
                message: "Region not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Region updated successfully",
            data: region,
        });

    } catch (error) {

        const status =
            error.message.includes("already exists") ? 409 : 400;

        res.status(status).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Archive Region (Soft Delete)
 */
export const deleteRegion = async (req, res) => {
    try {

        const region = await regionService.deleteRegion(req.params.id);

        if (!region) {
            return res.status(404).json({
                success: false,
                message: "Region not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Region archived successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Get Region Statistics
 */
export const getRegionStatistics = async (req, res) => {
    try {

        const statistics = await regionService.getRegionStatistics();

        res.status(200).json({
            success: true,
            data: statistics,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Get Critical Regions
 */
export const getCriticalRegions = async (req, res) => {
    try {

        const regions = await regionService.getCriticalRegions();

        res.status(200).json({
            success: true,
            data: regions,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Toggle Email Alerts
 */
export const toggleEmailAlerts = async (req, res) => {
    try {

        const region = await regionService.toggleEmailAlerts(req.params.id);

        res.status(200).json({
            success: true,
            message: "Email alert setting updated successfully",
            data: region,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Archive Region
 */
export const archiveRegion = async (req, res) => {
    try {

        const region = await regionService.archiveRegion(req.params.id);

        if (!region) {
            return res.status(404).json({
                success: false,
                message: "Region not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Region archived successfully",
            data: region,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};