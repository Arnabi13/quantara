import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Markets from "../pages/Markets";
import Watchlist from "../pages/Watchlist";
import Portfolio from "../pages/Portfolio";
import Settings from "../pages/Settings";
import StockDetail from "../pages/StockDetail";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import { useAuthStore } from "../store/authStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: <Dashboard />,
      },

      {
        path: "markets",
        element: <Markets />,
      },
      {
        path: "markets/:symbol",
        element: <StockDetail />,
      },

      {
        path: "watchlist",
        element: <Watchlist />,
      },

      {
        path: "portfolio",
        element: <Portfolio />,
      },

      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);
