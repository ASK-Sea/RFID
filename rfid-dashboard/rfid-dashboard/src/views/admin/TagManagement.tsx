import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Header, Sidebar, bgImage } from "./import";

// --- Types ---
type Stat = {
  epc: string;
  scan_count: number;
  last_seen: string | null;
};
type Tag = {
  epc: string;
  tag_name: string;
  position: string;
  purpose: string;
};
type RegisteredTagStat = {
  epc: string;
  tag_name: string;
  position: string;
  purpose: string;
  scan_count: number;
  last_seen: string | null;
};

type ResetBaselines = Record<string, number>;

// --- Component ---
const TagManagement: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [newEpc, setNewEpc] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [newPurpose, setNewPurpose] = useState("");
  const [registeredTagStats, setRegisteredTagStats] = useState<
    RegisteredTagStat[]
  >([]);
  const [tagStreamScans, setTagStreamScans] = useState<any[]>(() => {
    const saved = sessionStorage.getItem("tagStreamScans");
    return saved ? JSON.parse(saved) : [];
  });
  const [resetBaselines, setResetBaselines] = useState<ResetBaselines>(() => {
    const saved = localStorage.getItem("rfid_reset_baselines");
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Load tags and stats ---
  useEffect(() => {
    loadTags();
    loadStats();
    intervalRef.current = setInterval(loadStats, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- Update registeredTagStats ---
  useEffect(() => {
    setRegisteredTagStats(
      tagList.map((tag) => {
        const stat = stats.find((s) => s.epc === tag.epc);
        return {
          epc: tag.epc,
          tag_name: tag.tag_name,
          position: tag.position,
          purpose: tag.purpose,
          scan_count: stat?.scan_count || 0,
          last_seen: stat?.last_seen || null,
        };
      })
    );
  }, [stats, tagList]);

  // --- Send only Tag Stream data to Dashboard ---
  useEffect(() => {
    const selectedEpcs = Object.keys(selectedTags).filter(
      (epc) => selectedTags[epc]
    );
    localStorage.setItem("selectedTags", JSON.stringify(selectedEpcs));
  }, [selectedTags]);

  // --- Listen for storage updates from App.tsx ---
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = sessionStorage.getItem("tagStreamScans");
      if (saved) {
        setTagStreamScans(JSON.parse(saved));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // --- Helpers ---
  const formatTime = (datetime: string | null) => {
    if (!datetime) return "";
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // --- Tag Stream Load stream scan data ---

  const formatDate = (datetime: string | null) => {
    if (!datetime) return "";
    return new Date(datetime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAdjustedCount = (epc: string, actualCount: number) => {
    const baseline = resetBaselines[epc] || 0;
    return Math.max(0, actualCount - baseline);
  };

  const resetCount = (epc: string, currentCount: number) => {
    const newBaselines = { ...resetBaselines, [epc]: currentCount };
    setResetBaselines(newBaselines);
    localStorage.setItem("rfid_reset_baselines", JSON.stringify(newBaselines));
  };

  // --- API calls --- List stats
  const loadStats = async () => {
    try {
      const res = await axios.get<Stat[]>("http://localhost:5000/api/stats");
      setStats(res.data);
    } catch {
      setStats([]);
    }
  };

  // ---API calls --- List tags
  const loadTags = async () => {
    try {
      const res = await axios.get<Tag[]>("http://localhost:5000/api/tags");
      setTagList(res.data);
    } catch {
      setTagList([]);
    }
  };

  // --- API calls --- Stream tags Removed*

  // --- Tag Save ---
  const saveTag = async () => {
    if (!newEpc || !newTagName) return;
    try {
      await axios.post("http://localhost:5000/api/tags", {
        epc: newEpc,
        tag_name: newTagName,
        position: newPosition,
        purpose: newPurpose,
      });
      setNewEpc("");
      setNewTagName("");
      setNewPosition("");
      setNewPurpose("");
      loadTags();
      loadStats();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message);
    }
  };
  // --- Tag Delete ---
  const deleteTag = async (epc: string) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tags/${epc}`);
      const newBaselines = { ...resetBaselines };
      delete newBaselines[epc];
      setResetBaselines(newBaselines);
      localStorage.setItem(
        "rfid_reset_baselines",
        JSON.stringify(newBaselines)
      );
      loadTags();
      loadStats();
      alert("Tag deleted successfully!");
    } catch (error: any) {
      alert(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className="flex-1 p-4 bg-gray-50 overflow-auto"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Tag Management Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your RFID tags and track counts
              </p>
            </div>

            {/* Tag Management & Registered Tags */}
            <div className="card">
              <h2 className="text-sm font-medium text-gray-900 mb-5">
                Tag Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Tag Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      EPC
                    </label>
                    <input
                      value={newEpc}
                      onChange={(e) => setNewEpc(e.target.value)}
                      placeholder="e.g., TAG001"
                      className="input-field placeholder-gray-400 border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Tag Name
                    </label>
                    <input
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="e.g., Entrance Door"
                      className="input-field placeholder-gray-400 border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Position
                    </label>
                    <input
                      value={newPosition}
                      onChange={(e) => setNewPosition(e.target.value)}
                      placeholder="e.g., Technician"
                      className="input-field placeholder-gray-400 border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Purpose of Visit
                    </label>
                    <input
                      value={newPurpose}
                      onChange={(e) => setNewPurpose(e.target.value)}
                      placeholder="e.g., Meeting"
                      className="input-field placeholder-gray-400 border-gray-300"
                    />
                  </div>
                  <button
                    onClick={saveTag}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>

            {/* Tag List */}
            <div className="card">
              <h2 className="text-sm font-medium text-gray-900 mb-5">
                Tag List
              </h2>
              {registeredTagStats.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tags available. Add tags above to see them here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tag Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EPC
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purpose of Visit
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {" "}
                          -{" "}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registeredTagStats.map((tag) => (
                        <tr key={tag.epc}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {tag.tag_name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {tag.epc}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {tag.position || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {tag.purpose || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {tag.last_seen
                              ? new Date(tag.last_seen).toLocaleString()
                              : "Not scanned yet"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => deleteTag(tag.epc)}
                              className="text-gray-400 hover:text-red-500 transition-colors text-xs font-medium px-3 py-1 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tag Stream Table */}
            <div className="card">
              <h2 className="text-sm font-medium text-gray-900 mb-5">
                Tag Stream
              </h2>
              {tagStreamScans.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No scan data available.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tag Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EPC
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Read Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tagStreamScans.map((scan: any, idx: number) => (
                        <tr key={`${scan.epc}-${idx}`}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {scan.tag_name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {scan.epc}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {scan.read_time
                              ? new Date(scan.read_time).toLocaleString()
                              : "Not scanned yet"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Count with Reset Feature */}
            <div className="card">
              <h2 className="text-sm font-medium text-gray-900 mb-5">
                Count with Reset Feature
              </h2>
              {registeredTagStats.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No registered tags found. Add tags above to see their
                  statistics here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tag Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          EPC
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Count
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Scanned
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registeredTagStats.map((stat) => (
                        <tr
                          key={stat.epc}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {stat.tag_name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {stat.epc}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-50 text-purple-600 rounded-full text-sm font-semibold">
                                {getAdjustedCount(
                                  stat.epc,
                                  stat.scan_count || 0
                                )}
                              </span>
                              {resetBaselines[stat.epc] && (
                                <span className="text-xs text-gray-400">
                                  (Total: {stat.scan_count || 0})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-500">
                            {stat.last_seen ? (
                              <>
                                <div className="text-xs text-gray-700">
                                  {formatDate(stat.last_seen)}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {formatTime(stat.last_seen)}
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-gray-400">
                                Not scanned yet
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() =>
                                resetCount(stat.epc, stat.scan_count || 0)
                              }
                              className={`text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                                resetBaselines[stat.epc]
                                  ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              }`}
                            >
                              {resetBaselines[stat.epc]
                                ? "Reset Again"
                                : "Reset Count"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TagManagement;
