import {
    addCustomReason,
    getReasonsByAnalysis
} from "../services/customReason.service.js";


export const createReason = async (req, res) => {

    try {

        const reason = await addCustomReason({
            ...req.body,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Custom reason added successfully",
            data: reason
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};


export const getReasons = async (req, res) => {

    try {

        const reasons = await getReasonsByAnalysis(
            req.params.analysisId
        );

        res.status(200).json({
            success: true,
            data: reasons
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};