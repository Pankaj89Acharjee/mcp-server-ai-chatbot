import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ContextProvider } from "./contexts/ContextProvider";
import { AuthProvider } from "./contexts/AuthProvider";
import { UserLocationProvider } from "./contexts/UserLocationProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key of Clerk Authentication");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserLocationProvider>
          <ContextProvider>
            <App />
          </ContextProvider>
        </UserLocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
