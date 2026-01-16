import React, { useState, useEffect } from "react";
import { Header, Sidebar, bgImage } from "./import";

const Setting: React.FC = () => {
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState("mqtt://");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [clientId, setClientId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSave = () => {
    const settings = {
      name,
      protocol,
      host,
      port,
      clientId,
      username,
      password,
    };
    console.log("Settings saved:", settings);
    // TODO: Save to backend or localStorage
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className="flex-1 p-6 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">MQTT Settings</h2>

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

              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
