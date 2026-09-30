import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />
      <main
        className={`mt-16 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-72" : "lg:ml-0"
        }`}
      >
        <div className="max-w-7xl mx-auto animate-fadeIn">{children}</div>
      </main>
    </div>
  );
};
