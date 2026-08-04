import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../features/auth/pages/RegisterPage";
import LoginPage from "../features/auth/pages/LoginPage";
import LandingPage from "../features/landing/pages/LandingPage";

export const router = createBrowserRouter([
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/",
        element: <LandingPage />
    }
])