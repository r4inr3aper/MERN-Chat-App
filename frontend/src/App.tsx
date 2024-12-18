import { Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import "./App.css";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import { StoreContext } from "./context/StoreContext";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const storeContext = useContext(StoreContext);

  if (!storeContext) {
    throw new Error("StoreContext is not available.");
  }

  const { isAuthenticated, token } = storeContext;

  if (token === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/signup" replace />;
}

function App() {
  const storeContext = useContext(StoreContext);

  return (
    <div className="p-4 h-screen items-center flex justify-center">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            storeContext?.isAuthenticated ? <Navigate to="/" replace /> : <Signup />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
