import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Markets from "../pages/Markets";
import Watchlist from "../pages/Watchlist";
import Portfolio from "../pages/Portfolio";
import Settings from "../pages/Settings";

import Login from "../pages/Login";
import Signup from "../pages/Signup";

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
    element: <MainLayout />,

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
