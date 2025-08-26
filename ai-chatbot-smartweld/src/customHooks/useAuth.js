import { useContext } from "react";
import AuthContext from "../contexts/AuthProvider";

//Defining custom hook (starts with use) for using the useAuth context every time in all component
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
