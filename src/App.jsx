import { BrowserRouter, Route, Routes} from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Sidebar from "./components/Sidebar";
import { Dashboard, Login } from "./pages";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  const userData = localStorage.getItem("userData"); 
  
  return (
    <BrowserRouter>
      <SnackbarProvider
        maxSnack={1}
        style={{ maxWidth: "400px" }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <div className="App flex">
          {userData && <Sidebar />}
          <main className="flex-1 p-7">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard/*"
                element={<ProtectedRoute element={<Dashboard />} />}
              />
            </Routes>
          </main>
        </div>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;
