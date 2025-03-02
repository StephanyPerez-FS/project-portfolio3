import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Search from "./Search";

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("jwt");
  console.log("🔍 Checking token:", token);

  return token ? element : <Navigate to="/" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/search" element={<PrivateRoute element={<Search />} />} />
      </Routes>
    </Router>
  );
};

export default App;
