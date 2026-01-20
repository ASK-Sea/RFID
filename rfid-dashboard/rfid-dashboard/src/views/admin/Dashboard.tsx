import { React, useState, useEffect } from "./import";
import { useTheme, Header, Sidebar, bgImage } from "./import";

// --- Types ---
type SelectedTag = { epc: string; tag_name: string };

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
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

  // Get element styles with fallback
  const getTitleStyle = () =>
    theme.elements.title || {
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      color: "#111827",
      fontSize: "1.875rem",
    };

  const getSubtitleStyle = () =>
    theme.elements.subtitle || {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      color: "#1f2937",
      fontSize: "1.25rem",
    };

  const getWelcomeStyle = () =>
    theme.elements.welcome || {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      color: "#1f2937",
      fontSize: "1.25rem",
    };

  const getDateStyle = () =>
    theme.elements.date || {
      backgroundColor: "transparent",
      color: "#1f2937",
      fontSize: "1rsem",
    };

  // Get date element styles with safe access
  const dateElementStyle = getDateStyle();

  // ------------------ Render ------------------
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className="flex-1 p-6 bg-cover bg-center"
          style={{
            backgroundImage: theme.backgroundImage
              ? `url(${theme.backgroundImage})`
              : `url(${bgImage})`,
            backgroundColor: theme.backgroundColor,
          }}
        >
          <div className="container mx-auto p-6 flex flex-col items-center space-y-6">
            <div
              className="p-3 rounded-md"
              style={{
                backgroundColor: getTitleStyle().backgroundColor,
                color: getTitleStyle().color,
                fontSize: getTitleStyle().fontSize,
              }}
            >
              Welcome to CLB Holdings Berhard
            </div>

            <div
              className="p-2 rounded-md text-center"
              style={{
                backgroundColor: getSubtitleStyle().backgroundColor,
                color: getSubtitleStyle().color,
                fontSize: getSubtitleStyle().fontSize,
              }}
            >
              Get Started on your dashboard and manage your RFID Tags
            </div>

            <div className="grid grid-cols-12 gap-4 w-full">
              <div
                className="p-5 rounded-md text-center col-span-6"
                style={{
                  backgroundColor: getWelcomeStyle().backgroundColor,
                  color: getWelcomeStyle().color,
                  fontSize: getWelcomeStyle().fontSize,
                }}
              >
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

              <div
                className="col-span-6 p-4 rounded-md text-center"
                style={{
                  backgroundColor: getWelcomeStyle().backgroundColor,
                  color: getWelcomeStyle().color,
                  fontSize: getWelcomeStyle().fontSize,
                }}
              >
                <div
                  style={{
                    color: getSubtitleStyle().color,
                    fontSize: getSubtitleStyle().fontSize,
                  }}
                  className="font-semibold"
                ></div>
                <div className="font-semibold"
                  style={{
                    color: dateElementStyle.color,
                    fontSize: dateElementStyle.fontSize,
                  }}
                >
                  {currentDateTime.date}
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
