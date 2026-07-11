import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";

export default function AppLayout() {
  const { profileQuery } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen max-w-[88rem] gap-6 px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-8">
      <Sidebar profile={profileQuery.data} />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
