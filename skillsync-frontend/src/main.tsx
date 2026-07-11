import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./index.css";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import FeedPage from "./pages/Feed";
import ProfilePage from "./pages/Profile";
import UserProfilePage from "./pages/UserProfile";
import CommunitiesPage from "./pages/Communities";
import CommunityDetailPage from "./pages/Community";
import ExplorePage from "./pages/Explore";
import NotificationsPage from "./pages/Notifications";
import SavedPostsPage from "./pages/SavedPosts";
import DashboardPage from "./pages/Dashboard";
import TrendingPostsPage from "./pages/TrendingPosts";
import ReportsPage from "./pages/Reports";
import ProtectedRoute from "./pages/ProtectedRoute";
import AppLayout from "./pages/AppLayout";
import PageErrorBoundary from "./components/PageErrorBoundary";
import { authStore } from "./store/authStore";
import { getMyProfile } from "./api/auth";
import { uiStore } from "./store/uiStore";

const queryClient = new QueryClient();

authStore.getState().bootstrap();
if (authStore.getState().isAuthenticated) {
  getMyProfile().then((profile) => authStore.getState().setUser(profile)).catch(() => authStore.getState().logout());
}

if (uiStore.getState().theme === "dark") document.documentElement.classList.add("dark");
else document.documentElement.classList.remove("dark");
uiStore.subscribe((state) => {
  if (state.theme === "dark") document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
});

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ element: <AppLayout />, children: [
      { path: "/dashboard", element: <PageErrorBoundary><DashboardPage /></PageErrorBoundary> },
      { path: "/", element: <PageErrorBoundary><FeedPage /></PageErrorBoundary> },
      { path: "/trending", element: <PageErrorBoundary><TrendingPostsPage /></PageErrorBoundary> },
      { path: "/profile", element: <PageErrorBoundary><ProfilePage /></PageErrorBoundary> },
      { path: "/profile/:id", element: <PageErrorBoundary><UserProfilePage /></PageErrorBoundary> },
      { path: "/communities", element: <PageErrorBoundary><CommunitiesPage /></PageErrorBoundary> },
      { path: "/communities/:id", element: <PageErrorBoundary><CommunityDetailPage /></PageErrorBoundary> },
      { path: "/explore", element: <PageErrorBoundary><ExplorePage /></PageErrorBoundary> },
      { path: "/saved-posts", element: <PageErrorBoundary><SavedPostsPage /></PageErrorBoundary> },
      { path: "/notifications", element: <PageErrorBoundary><NotificationsPage /></PageErrorBoundary> },
      { path: "/reports", element: <PageErrorBoundary><ReportsPage /></PageErrorBoundary> }
    ] }]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>
);
