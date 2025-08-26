import React from "react";
import Layout from "./layout/Layout";
import { DateSelectionProvider } from "./contexts/DateSelectionContext";

function App() {
  return (
    <DateSelectionProvider>
      <Layout />
    </DateSelectionProvider>
  );
}

export default App;
