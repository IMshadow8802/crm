import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { Dashboard, Login, Kanban } from "./pages";
import { Leads, LeadStatus, Contacts, Complaint } from "./pages/Masters";
import ProtectedRoute from "./components/ProtectedRoute";
import RootLayout from "./components/RootLayout";
import ExampleWithProviders from "./pages/Masters/Example";

function App() {
  return (
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
              path="/kanban/*"
              element={<ProtectedRoute element={<Kanban />} />}
            />
            <Route
              path="*"
              element={<ProtectedRoute element={<Dashboard />} />}
            />
          </Routes>
        </RootLayout>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default App;
