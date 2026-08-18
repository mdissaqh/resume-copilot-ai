import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "../features/auth/pages/RegisterPage";
import LoginPage from "../features/auth/pages/LoginPage";
import LandingPage from "../features/landing/pages/LandingPage";
import RootLayout from "../components/layout/RootLayout";
import UploadPage from "../features/upload/pages/UploadPage";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ViewAnalysisPage from "../features/dashboard/pages/ViewAnalysisPage";
import BuilderPage from "../features/builder/pages/BuilderPage";
import CreateResumePage from "../features/builder/pages/CreateResumePage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <LandingPage />
            },
            {
                path: "/register",
                element: <RegisterPage />
            },
            {
                path: "/login",
                element: <LoginPage />
            },
            {
                path: "/upload",
                element: <UploadPage />
            },
            {
                path: "/build",
                element: <CreateResumePage />
            },
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard/analysis/:id",
                element: (
                    <ProtectedRoute>
                        <ViewAnalysisPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/build/:id",
                element: <BuilderPage />
            }
        ]
    }
]);