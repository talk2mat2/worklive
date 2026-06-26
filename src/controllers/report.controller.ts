import { Response } from "express";
import { Report } from "../models/report.model";
import { genericResponse } from "../utils";
import { responseCodes } from "../utils/responseCodes";
import { AuthRequest } from "../middleware/auth.middleware";

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportedId, reportedType, reason, details } = req.body;
    const reporterId = req.user!.id;

    if (!reportedId || !reportedType || !reason || !details) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "Missing required fields"));
    }

    if (reporterId === reportedId) {
      return res
        .status(400)
        .json(genericResponse(null, responseCodes["400"], "You cannot report yourself"));
    }

    const report = await Report.create({
      reporterId,
      reportedId,
      reportedType,
      reason,
      details,
      status: "pending",
    });

    return res
      .status(201)
      .json(genericResponse(report, responseCodes["200"], "Report submitted successfully"));
  } catch {
    return res
      .status(500)
      .json(genericResponse(null, responseCodes["500"], "Failed to submit report"));
  }
};
