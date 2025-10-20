import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import DomusPage from "./pages/domus/DomusPage.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";
import LoginPage from "./pages/login/LoginPage.jsx";
import RegisterPage from "./pages/register/RegisterPage.jsx";
import Layout from "./components/Layout.jsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <DomusPage /> },
      { path: "/admin", element: <AdminPanel /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/objetos", element: <Navigate to="/" replace /> }
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
