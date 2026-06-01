import { toast } from "sonner";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import Button from "../components/Button";
import { useNotifications } from "../hooks/useNotifications";
import { timeAgo } from "../utils/date";

export default function NotificationsPage() {
  const { notificationsQuery, unreadNotificationsQuery, markOneAsReadMutation, markAllAsReadMutation, deleteNotificationMutation } = useNotifications();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = unreadNotificationsQuery.data?.length ?? 0;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <Button
          disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
          onClick={async () => {
            try {
              await markAllAsReadMutation.mutateAsync();
              toast.success("All notifications marked as read");
            } catch {
              toast.error("Could not mark all notifications as read");
            }
          }}
        >
          Mark all read
        </Button>
      </div>

      {notificationsQuery.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : notificationsQuery.isError ? (
        <p className="text-sm text-rose-500">Could not load notifications right now.</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-slate-500">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-xl border p-3 ${notification.is_read ? "bg-transparent" : "bg-teal-50/60 dark:bg-teal-900/20"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{timeAgo(notification.created_at)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!notification.is_read ? (
                    <button
                      className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={async () => {
                        try {
                          await markOneAsReadMutation.mutateAsync(notification.id);
                          toast.success("Notification marked as read");
                        } catch {
                          toast.error("Could not update notification");
                        }
                      }}
                    >
                      Mark read
                    </button>
                  ) : null}
                  <button
                    className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    onClick={async () => {
                      try {
                        await deleteNotificationMutation.mutateAsync(notification.id);
                        toast.success("Notification deleted");
                      } catch {
                        toast.error("Could not delete notification");
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
