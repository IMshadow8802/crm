import { BrowserRouter, Route, Routes} from "react-router-dom";
import { SnackbarProvider } from "notistack";
import Sidebar from "./components/Sidebar";
import { Dashboard, Login,Kanban } from "./pages";
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
        <div className="flex p-2 bg-gray-100">
          {userData && <Sidebar />}
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard/*"
                element={<ProtectedRoute element={<Dashboard />} />}
              />
              <Route
                path="/kanban/*"
                element={<ProtectedRoute element={<Kanban />} />}
              />
            </Routes>
          </main>
        </div>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;
