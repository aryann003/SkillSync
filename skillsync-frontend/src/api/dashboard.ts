import client from "./client";
import { DashboardStats } from "../types";

export const getDashboardStats = async (): Promise<DashboardStats> => (await client.get("dashboard/")).data;
