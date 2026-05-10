import { useNavigate } from "@tanstack/react-router";
import { HardDrive, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export function NavBar() {
  const { userInfo } = useAuth();
  const { signOut } = useGoogleAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/" });
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 font-semibold text-gray-800">
        <HardDrive className="w-5 h-5 text-blue-600" />
        <span>Drive Duplicate Finder</span>
      </div>

      {userInfo && (
        <div className="flex items-center gap-3">
          {userInfo.picture ? (
            <img
              src={userInfo.picture}
              alt={userInfo.name}
              className="w-8 h-8 rounded-full border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {userInfo.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <span className="text-sm text-gray-600 hidden sm:block">
            {userInfo.email}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
