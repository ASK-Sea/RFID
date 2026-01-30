import { React, useState, useEffect } from "../../import";
import { useTheme, Header, Sidebar, bgImage } from "../../import";
import { SelectedTag } from "../../types";
import styles from "./Dashboard.module.css";

const Dashboard: React.FC = () => {
  const { theme, getBackgroundVideoUrl } = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
  });
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [latestScans, setLatestScans] = useState<SelectedTag[]>(() => {
    const saved = sessionStorage.getItem("latestScans");
    return saved ? JSON.parse(saved) : [];
  });

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

  // ------------------ Listen for real-time updates ------------------
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

  const hasActiveClient = latestScans.length > 0 && latestScans[0].tag_name !== "N/A";
  const activeClient = hasActiveClient ? latestScans[0] : null;

  return (
    <div className={styles.dashboardContainer}>
      
      {/* HIDDEN NAVIGATION WRAPPERS */}
      <div className={styles.headerWrapper}>
        <Header />
      </div>

      <div className={styles.sidebarWrapper}>
        <Sidebar />
      </div>

      {/* BACKGROUND LAYER */}
      <div className={styles.backgroundLayer}>
        {videoUrl ? (
          // Video background
          <video
            key={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className={styles.backgroundVideo}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          // Image background
          <div 
            className={styles.backgroundImage}
            style={{
              backgroundImage: theme.backgroundImage
                ? `url(${theme.backgroundImage})`
                : `url(${bgImage})`,
            }}
          />
        )}
      </div>
      
      {/* DARK OVERLAY */}
      <div className={styles.overlay}></div>

      <main className={styles.contentWrapper}>
        
        {/* Main Glass Display Card */}
        <div className={styles.displayCard}>
          {hasActiveClient ? (
            // --- ACTIVE STATE (Client Detected) ---
            <div key={activeClient?.epc}>
              <h1 className={styles.welcomeTitle}>Welcome to our Experience Center</h1>
              
              {/* 1. Client Name */}
              <div className={styles.clientName}>
                {activeClient?.tag_name}
              </div>

              {/* 2. Client Position (New) */}
              {activeClient?.position && (
                 <div className={styles.clientPosition}>
                   {activeClient.position}
                 </div>
              )}

              {/* 3. Purpose Badge */}
              {activeClient?.purpose && (
                <div className={styles.tagBadge}>
                  {activeClient.purpose}
                </div>
              )}
            </div>
          ) : (
            // --- IDLE STATE (Waiting) ---
            <div className={styles.idleContainer}>
              <div className={styles.scannerLine}></div>
              <h1 className={styles.welcomeTitle}>Welcome</h1>
              <p style={{color: '#94a3b8', fontSize: '1.2rem', marginTop: '10px'}}>
                Please proceed to the entrance reader
              </p>
            </div>
          )}
        </div>

        {/* Company Label - Moved to left footer */}
        <div className={styles.companyLabel}>CLB Holdings Berhad</div>

        {/* Floating Clock */}
        <div className={styles.clockContainer}>
          <div className={styles.timeDisplay}>{currentDateTime.time}</div>
          <div className={styles.dateDisplay}>{currentDateTime.date}</div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;