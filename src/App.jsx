import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import DomusPage from "./pages/domus/DomusPage.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";
import LoginPage from "./pages/login/LoginPage.jsx";
import RegisterPage from "./pages/register/RegisterPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import Layout from "./components/Layout.jsx";
import { SensorProvider } from "./context/SensorContext";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <DomusPage /> },
      { path: "/admin", element: <AdminPanel /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/objetos", element: <Navigate to="/" replace /> }
    ],
  },
]);

export default function App() {
  return (
    <SensorProvider>
      <RouterProvider router={router} />
    </SensorProvider>
  );
}
