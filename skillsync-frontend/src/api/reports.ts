import client from "./client";
import { Report } from "../types";

export interface ReportPayload {
  reason: string;
  description: string;
}

export const reportPost = async (id: number, payload: ReportPayload): Promise<{ message: string; data: Report }> => (await client.post(`reports/post/${id}/`, payload)).data;

export const reportComment = async (id: number, payload: ReportPayload): Promise<{ message: string; data: Report }> => (await client.post(`reports/comment/${id}/`, payload)).data;

export const getMyReports = async (): Promise<Report[]> => (await client.get("reports/my/")).data;

export const getAllReports = async (): Promise<Report[]> => (await client.get("reports/all/")).data;

export const getPendingReports = async (): Promise<Report[]> => (await client.get("reports/pending/")).data;

export const updateReportStatus = async (id: number, statusValue: Report["status"]): Promise<{ message: string; data: Report }> => (
  await client.patch(`reports/status/${id}/`, { status: statusValue })
).data;
