import { router } from "./router/router";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
