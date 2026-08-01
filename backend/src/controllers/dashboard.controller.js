import { getDashboardStats } from "../services/dashboard.service.js";

/**
 * Dashboard API
 */
export const dashboard = async (req, res) => {

    try {

        const data = await getDashboardStats();

        res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};