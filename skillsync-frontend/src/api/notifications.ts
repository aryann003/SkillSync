import client from "./client";
import { Notification } from "../types";

export interface NotificationCountResponse {
  unread_count: number;
  total_count: number;
}

/** Gets all notifications for the logged-in user. */
export const getNotifications = async (): Promise<Notification[]> => (await client.get("notifications/")).data;

/** Gets unread notifications for the logged-in user. */
export const getUnreadNotifications = async (): Promise<Notification[]> => (await client.get("notifications/unread/")).data;

/** Marks one notification as read. */
export const markNotificationAsRead = async (id: number): Promise<{ message: string }> => (await client.patch(`notifications/read/${id}/`)).data;

/** Marks all notifications as read. */
export const markAllNotificationsAsRead = async (): Promise<{ message: string }> => (await client.patch("notifications/read/all/")).data;

/** Gets unread and total notification counts. */
export const getNotificationCount = async (): Promise<NotificationCountResponse> => (await client.get("notifications/count/")).data;

/** Deletes one notification by id. */
export const deleteNotification = async (id: number): Promise<{ message: string }> => (await client.delete(`notifications/delete/${id}/`)).data;
