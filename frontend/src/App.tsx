import { Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import "./App.css";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import StoreContextProvider, { StoreContext } from "./context/StoreContext";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const storeContext = useContext(StoreContext);

  if (!storeContext) {
    throw new Error("StoreContext is not available.");
  }

  const { isAuthenticated } = storeContext;

  return isAuthenticated ? children : <Navigate to="/signup" replace />;
}

function App() {
  return (
    <StoreContextProvider>
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
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </StoreContextProvider>
  );
}

export default App;
