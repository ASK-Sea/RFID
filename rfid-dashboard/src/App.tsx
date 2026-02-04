import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./views/admin/Dashboard";
import TagManagement from "./views/admin/TagManagement";
import Setting from "./views/admin/Setting";
import Themes from "./views/admin/Themes";

const AppContent: React.FC = () => {
  // Global Socket.IO connection - receives MQTT data on all pages
  useEffect(() => {
    // Connect to the same host (works both in development and production)
    const socket = io(window.location.origin);

    socket.on("connect", () => {
      console.log("[App] Connected to Socket.IO server");
    });

    socket.on("mqtt-data", (data: any) => {
      console.log("[App] Received MQTT data:", data);
      
      // Update Dashboard data (latest scan)
      const latestScan = [{
        epc: data.epc,
        tag_name: data.tag_name,
        position: data.position || "",
        purpose: data.purpose || "",
      }];
      sessionStorage.setItem("latestScans", JSON.stringify(latestScan));
      
      // Update Tag Stream data with all new fields
      const savedStream = sessionStorage.getItem("tagStreamScans");
      const currentStream = savedStream ? JSON.parse(savedStream) : [];
      
      const newScan = {
        epc: data.epc,
        tag_name: data.tag_name,
        position: data.position || "",
        read_time: data.read_time,
        timestamp: data.timestamp,
        // New fields from enhanced MQTT payload
        tid: data.tid || "",
        rssi: data.rssi || "",
        antId: data.antId || "",
        mac: data.mac || "",
        device: data.device || "",
        readType: data.readType || "",
        ip: data.ip || "",
        netMsg: data.netMsg || "",
      };
      
      const updatedStream = [newScan, ...currentStream].slice(0, 50);
      sessionStorage.setItem("tagStreamScans", JSON.stringify(updatedStream));
      
      // Trigger storage event for components to update
      window.dispatchEvent(new Event("storage"));
    });

    socket.on("disconnect", () => {
      console.log("[App] Disconnected from Socket.IO server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tagmanagement" element={<TagManagement />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/Themes" element={<Themes />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
