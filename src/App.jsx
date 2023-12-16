import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SnackbarProvider } from "notistack";
import { Dashboard, Login, Kanban } from "./pages";
import { Leads, LeadStatus, Contacts, Complaint } from "./pages/Masters";
import ProtectedRoute from "./components/ProtectedRoute";
import RootLayout from "./components/RootLayout";
import Workspace from "./pages/Workspace";
import Board from "./pages/Board";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  return (
    <HelmetProvider>
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter basename="/eStockCRM">
          <SnackbarProvider
            maxSnack={1}
            style={{ maxWidth: "400px" }}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <RootLayout>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard/*"
                  element={<ProtectedRoute element={<Dashboard />} />}
                />
                <Route
                  path="/leads/*"
                  element={<ProtectedRoute element={<Leads />} />}
                />
                <Route
                  path="/leads_status/*"
                  element={<ProtectedRoute element={<LeadStatus />} />}
                />
                <Route
                  path="/contacts/*"
                  element={<ProtectedRoute element={<Contacts />} />}
                />
                <Route
                  path="/complaint/*"
                  element={<ProtectedRoute element={<Complaint />} />}
                />
                <Route
                  path="/task/*"
                  element={<ProtectedRoute element={<Workspace />} />}
                />
                <Route
                  path="/kanban/*"
                  element={<ProtectedRoute element={<Kanban />} />}
                />
                <Route
                  path="/board/*"
                  element={<ProtectedRoute element={<Board />} />}
                />
                <Route
                  path="*"
                  element={<ProtectedRoute element={<Dashboard />} />}
                />
              </Routes>
            </RootLayout>
          </SnackbarProvider>
        </BrowserRouter>
      </DndProvider>
    </HelmetProvider>
  );
}

export default App;
