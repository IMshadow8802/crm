import Sidebar from "./Sidebar";
// import useAuthStore from "../zustand/authStore";

function RootLayout({ children }) {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const userData = localStorage.getItem("userData"); 
  return (
    <div className="flex h-screen p-2">
      {userData && <Sidebar />}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
        {children}
      </main>
    </div>
  );
}

export default RootLayout;