import React, { useState, useEffect } from "react";
import { Header, Sidebar, bgImage } from "./import";

// --- Types ---
type SelectedTag = { epc: string; tag_name: string };

const Dashboard: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
  });

  const [latestScans, setLatestScans] = useState<SelectedTag[]>(() => {
    const saved = sessionStorage.getItem("latestScans");
    return saved ? JSON.parse(saved) : [];
  });

  // ------------------ Time ------------------
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDateTime({
        date: now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ------------------ Listen for storage updates from App.tsx ------------------
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = sessionStorage.getItem("latestScans");
      if (saved) {
        setLatestScans(JSON.parse(saved));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ------------------ Render ------------------
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className="flex-1 p-6 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="container mx-auto p-6 flex flex-col items-center space-y-6">
            <div className="text-3xl font-semibold text-gray-900 p-3 bg-white/40 rounded-md">
              Welcome to CLB Groups Sdn Bhd
            </div>

            <div className="text-xl text-gray-800 p-2 bg-white/30 rounded-md text-center">
              Get Started on your dashboard and manage your RFID Tags
            </div>

            <div className="grid grid-cols-12 gap-4 w-full">
              <div className="text-xl text-gray-800 p-5 bg-white/30 rounded-md text-center col-span-6">
                {latestScans.length > 0 ? (
                  <>
                    Welcome{" "}
                    {latestScans.map((tag, idx) => (
                      <span key={tag.epc} className="font-semibold">
                        {tag.tag_name}
                        {idx < latestScans.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </>
                ) : (
                  "Welcome"
                )}
              </div>

              <div className="col-span-6 p-4 bg-white/30 rounded-md text-center">
                <div className="text-xl font-semibold text-gray-900">
                  {currentDateTime.date}
                </div>
                <div className="text-lg text-gray-900">
                  {currentDateTime.time}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
