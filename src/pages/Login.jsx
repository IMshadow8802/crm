import { Helmet } from "react-helmet";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import Navbar from "../components/Navbar";
import { Box } from "@mui/material";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://103.30.72.63/eCRM/api/User/fetchUser_Validate",
        {
          username,
          password,
        }
      );

      // Save the entire response data to local storage
      localStorage.setItem("userData", JSON.stringify(response.data));

      enqueueSnackbar("Login successful", { variant: "success" });
      navigate("/dashboard");
    } catch (error) {
      enqueueSnackbar("Invalid credentials. Please try again.", {
        variant: "error",
      });
    }
  };

  return (
    <Box display="flex" flexDirection="column" flexGrow={1}>
    <Navbar title="LOGIN" />
    <Helmet>
      <title> Login</title>
    </Helmet>
    <div className="flex items-center justify-center h-screen overflow-x-hidden" style={{ maxHeight: "calc(100vh - 110px)" }}>
      <div className="bg-white p-8 rounded-md shadow-lg w-96">
        {/* Increased width to w-96 */}
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-600"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            className="mt-1 p-3 w-full border rounded-md"
            onChange={(e) => setUsername(e.target.value)}
          />
          {/* Increased padding to p-3 */}
        </div>
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-600"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="mt-1 p-3 w-full border rounded-md"
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* Increased padding to p-3 */}
        </div>
        <button
          className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600"
          onClick={handleLogin}
        >
          {/* Increased padding to py-3 and px-6 */}
          Login
        </button>
      </div>
    </div>
    </Box>
  );
};

export default Login;
