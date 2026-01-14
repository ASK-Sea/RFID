import React, { useState, useEffect } from "react";
import { Header, Sidebar, bgImage } from "./import";
import axios from "axios";

// --- Types ---
type SelectedTag = { epc: string; tag_name: string };

const Dashboard: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
  });

  const [selectedEpcs, setSelectedEpcs] = useState<string[]>([]);
  const [validatedTags, setValidatedTags] = useState<SelectedTag[]>([]);

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

  // ------------------ Load selected EPCs from localStorage ------------------
  useEffect(() => {
    const loadSelectedEpcs = () => {
      const stored = localStorage.getItem("selectedTags");
      setSelectedEpcs(stored ? JSON.parse(stored) : []);
    };

    loadSelectedEpcs();
    window.addEventListener("storage", loadSelectedEpcs);
    return () => window.removeEventListener("storage", loadSelectedEpcs);
  }, []);

  // ------------------ Build validatedTags ------------------
  useEffect(() => {
    if (!selectedEpcs.length) {
      setValidatedTags([]);
      return;
    }

    validateEpcs(selectedEpcs);
  }, [selectedEpcs]);

  //---APC call from eps_stats left join tags_info
const validateEpcs = async (epcs: string[]) => {
  try {
    const results = await Promise.all(
      epcs.map(async (epc) => {
        const res = await axios.get(
          "http://localhost:5000/api/validate-epc",
          { params: { epc } }
        );

        return {
          epc,
          tag_name: res.data?.tag_name || epc, // fallback
        };
      })
    );

    setValidatedTags(results);
  } catch (err) {
    console.error("EPC validation failed", err);

    // fallback: show EPC only
    setValidatedTags(epcs.map(epc => ({ epc, tag_name: epc })));
  }
};
  

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
                {validatedTags.length > 0 ? (
                  <>
                    Welcome{" "}
                    {validatedTags.map((tag, idx) => (
                      <span key={tag.epc} className="font-semibold">
                        {tag.tag_name}
                        {idx < validatedTags.length - 1 ? ", " : ""}
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
