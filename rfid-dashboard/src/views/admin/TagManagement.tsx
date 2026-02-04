import { React, useEffect, useRef, useState, useCallback } from "../../import";
import { axios, useTheme, Header, Sidebar, bgImage } from "../../import";
import { Stat, Tag, RegisteredTagStat, ResetBaselines } from "../../types";

// --- Component ---
const TagManagement: React.FC = () => {
  const { theme, getBackgroundVideoUrl } = useTheme();
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pagination states
  const [tagListPage, setTagListPage] = useState(1);
  const [tagStreamPage, setTagStreamPage] = useState(1);
  const [countPage, setCountPage] = useState(1);
  const itemsPerPage = 10;

  // --- Load tags and stats ---
  useEffect(() => {
    loadTags();
    loadStats();
    intervalRef.current = setInterval(loadStats, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
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

  // --- Update registeredTagStats ---
  useEffect(() => {
    const newStats = tagList.map((tag) => {
      const stat = stats.find((s) => s.epc === tag.epc);
      return {
        epc: tag.epc,
        tag_name: tag.tag_name,
        position: tag.position,
        purpose: tag.purpose,
        scan_count: stat?.scan_count || 0,
        last_seen: stat?.last_seen || null,
      };
    });
    console.log("🔄 Updated registeredTagStats:", newStats);
    setRegisteredTagStats(newStats);
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

  // Pagination helper
  const getPaginatedData = (data: any[], page: number, perPage: number) => {
    const startIndex = (page - 1) * perPage;
    return data.slice(startIndex, startIndex + perPage);
  };

  const getTotalPages = (dataLength: number, perPage: number) => {
    return Math.ceil(dataLength / perPage);
  };

  // Pagination component
  const handleRefreshTagStream = () => {
    // Clear and reload tag stream from sessionStorage
    sessionStorage.setItem("tagStreamScans", JSON.stringify([]));
    setTagStreamScans([]);
    // Optionally reload from storage after a brief delay if new data arrives
    setTimeout(() => {
      const saved = sessionStorage.getItem("tagStreamScans");
      if (saved) {
        setTagStreamScans(JSON.parse(saved));
      }
    }, 100);
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>

        <span className="text-xs text-gray-500 ml-4">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  // --- API calls --- List stats
  const loadStats = async () => {
    try {
      const res = await axios.get<Stat[]>("http://localhost:5001/api/stats");
      console.log("📊 Loaded stats from API:", res.data);
      setStats(res.data);
    } catch {
      setStats([]);
    }
  };

  // ---API calls --- List tags
  const loadTags = async () => {
    try {
      const res = await axios.get<Tag[]>("http://localhost:5001/api/tags");
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
      await axios.post("http://localhost:5001/api/tags", {
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
      await axios.delete(`http://localhost:5001/api/tags/${epc}`);
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
          className="flex-1 p-4 bg-gray-50 overflow-auto relative min-h-screen"
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
          
          <div className="max-w-7xl mx-auto space-y-6 relative z-10">
            {/* Header */}
            <div className="bg-white/80 rounded-lg p-6 mb-6 shadow-md">
              <h1 className="text-2xl font-bold text-gray-900">
                Tag Management Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your RFID tags and track counts
              </p>
            </div>

            {/* Tag Management & Registered Tags */}
            <div className="card bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-700"
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
            <div className="card bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h2 className="text-sm font-medium text-gray-900 mb-5">
                Tag List
              </h2>
              {registeredTagStats.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No tags available. Add tags above to see them here.
                </div>
              ) : (
                <>
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
                            -
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getPaginatedData(
                          registeredTagStats,
                          tagListPage,
                          itemsPerPage
                        ).map((tag) => (
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
                  <PaginationControls
                    currentPage={tagListPage}
                    totalPages={getTotalPages(
                      registeredTagStats.length,
                      itemsPerPage
                    )}
                    onPageChange={setTagListPage}
                  />
                </>
              )}
            </div>

            {/* Tag Stream Table */}
            <div className="card bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-medium text-gray-900">
                  Tag Stream
                </h2>
                <button
                  onClick={handleRefreshTagStream}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-2"
                >
                  🔄 Refresh
                </button>
              </div>
              {tagStreamScans.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No scan data available.
                </div>
              ) : (
                <>
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
                        
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            RSSI
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ant ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Device
                          </th>
                          
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getPaginatedData(
                          tagStreamScans,
                          tagStreamPage,
                          itemsPerPage
                        ).map((scan: any, idx: number) => (
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
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {scan.rssi || "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {scan.antId || "-"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {scan.device || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationControls
                    currentPage={tagStreamPage}
                    totalPages={getTotalPages(tagStreamScans.length, itemsPerPage)}
                    onPageChange={setTagStreamPage}
                  />
                </>
              )}
            </div>

            {/* Count with Reset Feature */}
            <div className="card bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h2 className="text-sm font-medium text-gray-900 mb-5">
                Count with Reset Feature
              </h2>
              {registeredTagStats.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No registered tags found. Add tags above to see their
                  statistics here.
                </div>
              ) : (
                <>
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
                        {getPaginatedData(
                          registeredTagStats,
                          countPage,
                          itemsPerPage
                        ).map((stat) => (
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
                  <PaginationControls
                    currentPage={countPage}
                    totalPages={getTotalPages(
                      registeredTagStats.length,
                      itemsPerPage
                    )}
                    onPageChange={setCountPage}
                  />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TagManagement;