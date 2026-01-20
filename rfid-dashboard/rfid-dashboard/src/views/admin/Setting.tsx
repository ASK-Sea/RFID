import { React, useState, useEffect } from "./import";
import { axios, io, Socket, useTheme, Header, Sidebar, bgImage } from "./import";

const Setting: React.FC = () => {
  const { theme } = useTheme();
  const [name, setName] = useState("Dummy");
  const [protocol, setProtocol] = useState("mqtt://");
  const [host, setHost] = useState("broker.emqx.io");
  const [port, setPort] = useState("1883");
  const [clientId, setClientId] = useState("rfid_client_001");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [mqttStatus, setMqttStatus] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);

  // Load saved config and check MQTT status on mount
  useEffect(() => {
    loadSavedConfig();
    checkMqttStatus();
    
    // Connect to Socket.IO for real-time updates
    const newSocket = io("http://localhost:5001", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("mqtt-status", (data: any) => {
      console.log("Real-time MQTT status update:", data);
      setMqttStatus(data.connected);
    });

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    setSocket(newSocket);

    // Check status every 10 seconds as fallback
    const statusInterval = setInterval(checkMqttStatus, 10000);
    
    return () => {
      clearInterval(statusInterval);
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const checkMqttStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await axios.get("http://localhost:5001/api/mqtt/status");
      console.log("MQTT status response:", response.data);
      setMqttStatus(response.data.connected);
    } catch (error) {
      console.error("Failed to check MQTT status:", error);
      setMqttStatus(false);
    } finally {
      setStatusLoading(false);
    }
  };

  const loadSavedConfig = async () => {
    try {
      const saved = localStorage.getItem("mqttConfig");
      if (saved) {
        const config = JSON.parse(saved);
        setName(config.name || "Dummy");
        setProtocol(config.protocol || "mqtt://");
        setHost(config.host || "broker.emqx.io");
        setPort(config.port || "1883");
        setClientId(config.clientId || "rfid_client_001");
        setUsername(config.username || "");
        setPassword(config.password || "");
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    }
  };

  const handleSave = async () => {
    const settings = {
      name,
      protocol,
      host,
      port,
      clientId,
      username,
      password,
    };
    
    console.log("Attempting to save settings:", settings);
    
    try {
      setSaveMessage("Saving configuration...");
      
      // Save to backend
      const response = await axios.post("http://localhost:5001/api/mqtt/save", settings);
      console.log("Save response:", response.data);
      
      // Save to localStorage
      localStorage.setItem("mqttConfig", JSON.stringify(settings));
      
      setSaveMessage("Configuration saved successfully!");
      
      // Check MQTT status after saving
      setTimeout(() => checkMqttStatus(), 500);
      
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      setSaveMessage(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleConnect = async () => {
    try {
      setConnectionLoading(true);
      setSaveMessage("Connecting to MQTT...");
      
      const response = await axios.post("http://localhost:5001/api/mqtt/connect");
      
      setSaveMessage("MQTT connected successfully!");
      await checkMqttStatus();
      
      setTimeout(() => setSaveMessage(""), 3000);
      console.log("MQTT connected:", response.data);
    } catch (error: any) {
      setSaveMessage(`Error connecting: ${error.response?.data?.error || error.message}`);
      console.error("Failed to connect MQTT:", error);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setConnectionLoading(true);
      setSaveMessage("Disconnecting from MQTT...");
      
      const response = await axios.post("http://localhost:5001/api/mqtt/disconnect");
      
      setSaveMessage("MQTT disconnected successfully!");
      await checkMqttStatus();
      
      setTimeout(() => setSaveMessage(""), 3000);
      console.log("MQTT disconnected:", response.data);
    } catch (error: any) {
      setSaveMessage(`Error disconnecting: ${error.response?.data?.error || error.message}`);
      console.error("Failed to disconnect MQTT:", error);
    } finally {
      setConnectionLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className="flex-1 p-6 bg-cover bg-center"
          style={{
            backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : `url(${bgImage})`,
            backgroundColor: theme.backgroundColor,
          }}
        >
          <div className="container mx-auto p-6">
            <div className="bg-white/80 rounded-lg p-6 mb-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900">MQTT Settings</h2>
            </div>

            {saveMessage && (
              <div className={`mb-6 px-4 py-3 rounded-lg font-medium ${
                saveMessage.includes("Error")
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : "bg-green-100 text-green-800 border border-green-300"
              }`}>
                {saveMessage}
              </div>
            )}

            <div className={`mb-6 px-4 py-3 rounded-lg font-medium border ${
              mqttStatus
                ? "bg-blue-100 text-blue-800 border-blue-300"
                : "bg-gray-100 text-gray-600 border-gray-300"
            }`}>
              MQTT Status: {statusLoading ? "Loading..." : mqttStatus ? "✓ Connected" : "✗ Not Connected"}
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="min-w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 w-1/4">
                      Name
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                        placeholder="e.g., MQTT Connection"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      Host
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <select
                          value={protocol}
                          onChange={(e) => setProtocol(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        >
                          <option value="mqtt://">mqtt://</option>
                          <option value="mqtts://">mqtts://</option>
                          <option value="ws://">ws://</option>
                          <option value="wss://">wss://</option>
                        </select>
                        <input
                          type="text"
                          value={host}
                          onChange={(e) => setHost(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                          placeholder="e.g., broker.emqx.io"
                        />
                      </div>
                    </td>
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      Port
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                        placeholder="e.g., 1883"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      Client ID
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                        placeholder="e.g., rfid_client_001"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      Username
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                        placeholder="e.g., admin"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      Password
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                        placeholder="e.g., ••••••••"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={handleDisconnect}
                  disabled={connectionLoading || !mqttStatus}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connectionLoading ? "Processing..." : "Disconnect"}
                </button>
                <button
                  onClick={handleConnect}
                  disabled={connectionLoading || mqttStatus}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connectionLoading ? "Processing..." : "Connect"}
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Setting;
