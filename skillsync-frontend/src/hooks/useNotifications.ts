import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteNotification, getNotificationCount, getNotifications, getUnreadNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../api/notifications";

/** Manages notification fetching and read status updates. */
export const useNotifications = () => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 30_000
  });

  const unreadNotificationsQuery = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: getUnreadNotifications,
    staleTime: 30_000
  });
  const countQuery = useQuery({
    queryKey: ["notifications", "count"],
    queryFn: getNotificationCount,
    staleTime: 30_000
  });

  const markOneAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "count"] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "count"] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "count"] });
    }
  });

  return { notificationsQuery, unreadNotificationsQuery, countQuery, markOneAsReadMutation, markAllAsReadMutation, deleteNotificationMutation };
};
