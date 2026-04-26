import Navbar from "../../components/dashboard/Navbar";
import Sidebar from "../../components/dashboard/Sidebar";


export default function DashboardPage() {

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* 2. Navbar */}
      <Navbar />

      <div className="bg-[#f9f9ff] min-h-screen flex w-full">
        {/* 1. Sidebar */}
        <Sidebar />


        {/* 3. Main Content Wrapper */}
        <main className="flex-1">
        </main>
      </div>
    </div>
  );
}
