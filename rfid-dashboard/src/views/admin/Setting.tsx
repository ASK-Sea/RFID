import { React, useState, useEffect } from "../../import";
import { axios, io, Socket, useTheme, Header, Sidebar, bgImage } from "../../import";

const Setting: React.FC = () => {
  const { theme, getBackgroundVideoUrl } = useTheme();
  const [name, setName] = useState("Dummy");
  const [protocol, setProtocol] = useState("mqtt://");
  const [host, setHost] = useState("broker.emqx.io");
  const [port, setPort] = useState("1883");
  const [clientId, setClientId] = useState("rfid_client_001");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [topic, setTopic] = useState("Dummy");
  const [saveMessage, setSaveMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [mqttStatus, setMqttStatus] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Load saved config and check MQTT status on mount
  useEffect(() => {
    loadSavedConfig();
    checkMqttStatus();
    
    // Connect to Socket.IO for real-time updates
    const newSocket = io(window.location.origin, {
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

  // Load video from IndexedDB
  useEffect(() => {
    const loadVideo = async () => {
      if (theme.backgroundVideo) {
        const url = await getBackgroundVideoUrl();
        setVideoUrl(url);
      } else {
        setVideoUrl(null);
      }
    };
    
    loadVideo();
  }, [theme.backgroundVideo, getBackgroundVideoUrl]);

  const checkMqttStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await axios.get("/api/mqtt/status");
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
        setTopic(config.topic || "Dummy");
      }
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to load config:", error);
    }
  };

  const validateConfig = () => {
    const errors = [];
    if (!host.trim()) errors.push("Host is required");
    if (!port.trim()) errors.push("Port is required");
    if (isNaN(Number(port)) || Number(port) < 1 || Number(port) > 65535) {
      errors.push("Port must be between 1 and 65535");
    }
    if (!clientId.trim()) errors.push("Client ID is required");
    if (!protocol) errors.push("Protocol is required");
    return errors;
  };

  const showMessage = (msg: string, type: "success" | "error" = "success") => {
    setMessageType(type);
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 4000);
  };

  const handleSave = async () => {
    const errors = validateConfig();
    if (errors.length > 0) {
      showMessage(`Validation errors: ${errors.join(", ")}`, "error");
      return;
    }

    const settings = {
      name,
      protocol,
      host,
      port,
      clientId,
      username,
      password,
      topic,
    };
    
    console.log("Attempting to save settings:", settings);
    
    try {
      showMessage("Saving configuration...", "success");
      
      // Save to backend
      const response = await axios.post("/api/mqtt/save", settings);
      console.log("Save response:", response.data);
      
      // Save to localStorage
      localStorage.setItem("mqttConfig", JSON.stringify(settings));
      
      setHasChanges(false);
      showMessage("Configuration saved successfully!", "success");
      
      // Check MQTT status after saving
      setTimeout(() => checkMqttStatus(), 500);
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      showMessage(`Error: ${error.response?.data?.error || error.message}`, "error");
    }
  };

  const handleConnect = async () => {
    const errors = validateConfig();
    if (errors.length > 0) {
      showMessage(`Cannot connect. Fix these errors first: ${errors.join(", ")}`, "error");
      return;
    }

    try {
      setConnectionLoading(true);
      showMessage("Connecting to MQTT broker...", "success");
      
      // First save the config if not already saved
      const settings = {
        name,
        protocol,
        host,
        port,
        clientId,
        username,
        password,
        topic,
      };
      
      await axios.post("/api/mqtt/save", settings);
      localStorage.setItem("mqttConfig", JSON.stringify(settings));
      
      // Then connect
      const response = await axios.post("/api/mqtt/connect");
      
      showMessage("✓ MQTT connected successfully!", "success");
      await checkMqttStatus();
      
      console.log("MQTT connected:", response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      showMessage(`Connection failed: ${errorMsg}`, "error");
      console.error("Failed to connect MQTT:", error);
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setConnectionLoading(true);
      showMessage("Disconnecting from MQTT broker...", "success");
      
      const response = await axios.post("/api/mqtt/disconnect");
      
      showMessage("✓ MQTT disconnected successfully!", "success");
      await checkMqttStatus();
      
      console.log("MQTT disconnected:", response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message;
      showMessage(`Disconnection failed: ${errorMsg}`, "error");
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
          className="flex-1 p-6 bg-cover bg-center relative min-h-screen"
          style={{
            backgroundColor: theme.backgroundColor,
          }}
        >
          {/* Video Background */}
          {videoUrl ? (
            <video
              key={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : (
            <>
              {/* Image Background */}
              {theme.backgroundImage && (
                <div 
                  className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
                  style={{
                    backgroundImage: `url(${theme.backgroundImage})`,
                  }}
                />
              )}
              
              {/* Default Background */}
              {!theme.backgroundImage && (
                <div 
                  className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
                  style={{
                    backgroundImage: `url(${bgImage})`,
                  }}
                />
              )}
            </>
          )}
          
          <div className="container mx-auto p-6 relative z-10">
            <div className="bg-white/80 rounded-lg p-6 mb-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900">MQTT Settings</h2>
            </div>

            {saveMessage && (
              <div className={`mb-6 px-4 py-3 rounded-lg font-medium ${
                messageType === "error"
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
                        onChange={(e) => {
                          setName(e.target.value);
                          setHasChanges(true);
                        }}
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
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setHasChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                        placeholder="e.g., admin"
                      />
                    </td>
                  </tr>

                  <tr className="border-b border-gray-200">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      Password
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setHasChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                        placeholder="e.g., ••••••••"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      Topic
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => {
                          setTopic(e.target.value);
                          setHasChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
                        placeholder="e.g., Dummy or #"
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