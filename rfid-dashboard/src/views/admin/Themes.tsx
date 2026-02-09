import { React, useState, useRef, useEffect } from "../../import";
import { useTheme, Header, Sidebar, bgImage, ElementStyle } from "../../import";

const Themes: React.FC = () => {
  const { theme, updateTheme, updateElementStyle, resetTheme, uploadBackgroundImage, uploadBackgroundVideo, getBackgroundVideoUrl, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<"background" | "elements">("background");
  const [selectedElement, setSelectedElement] = useState<string>("title");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle background media upload
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(false);
        
        if (uploadType === "image") {
          await uploadBackgroundImage(file);
        } else {
          await uploadBackgroundVideo(file);
        }
        
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to upload file";
        setUploadError(errorMessage);
        console.error("Failed to upload file:", error);
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Clear background media
  const clearBackgroundMedia = () => {
    if (uploadType === "image") {
      updateTheme({ backgroundImage: null });
    } else {
      updateTheme({ backgroundVideo: null });
    }
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  // Handle element style changes
  const handleElementStyleChange = (property: keyof ElementStyle, value: string) => {
    updateElementStyle(selectedElement, { [property]: value });
  };

  // Get current element style
  const currentElementStyle = theme.elements[selectedElement] || {
    backgroundColor: "#ffffff",
    color: "#000000",
    fontSize: "1rem",
  };

  const elementOptions = Object.keys(theme.elements);

  // Map element keys to display names
  const elementDisplayNames: Record<string, string> = {
    title: "Title",
    subtitle: "Subtitle",
    welcome: "Welcome",
    date: "Date",
  };

  // Use global toggleDarkMode to switch the whole app between light/dark
  // (toggleDarkMode may be undefined in some contexts)
  const handleGlobalToggle = () => {
    try {
      toggleDarkMode && toggleDarkMode();
    } catch (err) {
      console.error('toggleDarkMode error', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className="flex-1 p-6 overflow-y-auto relative min-h-screen"
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
          
          <div className="container mx-auto p-6 rounded-lg shadow-lg max-w-4xl relative z-10 bg-white/80 text-gray-900">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Theme Customization</h1>
              <button
                onClick={handleGlobalToggle}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                  theme.mode === "dark" ? "bg-gray-200 text-white" : "bg-gray-800 text-white"
                }`}
              >
                {theme.mode === "dark" ? "Disable Dark Mode" : "Enable Dark Mode"}
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b-2 border-gray-300">
              <button
                onClick={() => setActiveTab("background")}
                className={`px-6 py-3 font-semibold text-lg transition-all ${
                  activeTab === "background"
                    ? "border-b-4 border-blue-500 text-gray-200"
                    : "text-blue-600 hover:text-white"
                }`}
              >
                Background Settings
              </button>
              {/* <button
                onClick={() => setActiveTab("elements")}
                className={`px-6 py-3 font-semibold text-lg transition-all ${
                  activeTab === "elements"
                    ? "border-b-4 border-blue-500 text-blue-600"
                    : "text-blue-600 hover:text-white"
                }`}
              >
                Element Styles
              </button> */}
            </div>

            {/* Background Settings Tab */}
            {activeTab === "background" && (
              <div className="space-y-6">
                {/* Background Type Selection */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Background Type</h2>
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setUploadType("image")}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        uploadType === "image"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Image
                    </button>
                    <button
                      onClick={() => setUploadType("video")}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        uploadType === "video"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Video
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {uploadType === "image" ? (
                      <p>Maximum image size: 3.5MB</p>
                    ) : (
                      <p>Maximum video size: 20MB. Supported formats: MP4, WebM, OGG</p>
                    )}
                  </div>
                </div>

                {/* Upload Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {uploadType === "image" ? "Background Image" : "Background Video"}
                  </h2>
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={uploadType === "image" ? "image/*" : "video/*"}
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className={`w-full px-4 py-3 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isUploading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        `Upload ${uploadType === "image" ? "Image" : "Video"}`
                      )}
                    </button>
                    
                    {/* Clear button if media exists */}
                    {(uploadType === "image" && theme.backgroundImage) || 
                     (uploadType === "video" && theme.backgroundVideo) ? (
                      <button
                        onClick={clearBackgroundMedia}
                        disabled={isUploading}
                        className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove {uploadType === "image" ? "Image" : "Video"}
                      </button>
                    ) : null}
                    
                    {uploadError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 font-semibold">✗ {uploadError}</p>
                      </div>
                    )}
                    {uploadSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 font-semibold">
                          ✓ {uploadType === "image" ? "Image" : "Video"} uploaded successfully
                        </p>
                      </div>
                    )}
                    {uploadType === "image" && theme.backgroundImage && !uploadError && !uploadSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 font-semibold">✓ Background image active</p>
                      </div>
                    )}
                    {uploadType === "video" && theme.backgroundVideo && !uploadError && !uploadSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 font-semibold">✓ Background video active</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={resetTheme}
                  className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset to Default Theme
                </button>
              </div>
            )}

            {/* Element Styles Tab */}
            {activeTab === "elements" && (
              <div className="grid grid-cols-2 gap-6">
                {/* Element Selection */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Element</h2>
                  <div className="space-y-2">
                    {elementOptions.map((element) => (
                      <button
                        key={element}
                        onClick={() => setSelectedElement(element)}
                        className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                          selectedElement === element
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white text-blue-600 border-2 border-gray-300 hover:bg-blue-50"
                        }`}
                      >
                        {elementDisplayNames[element] || element.charAt(0).toUpperCase() + element.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Controls */}
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {elementDisplayNames[selectedElement] || (selectedElement.charAt(0).toUpperCase() + selectedElement.slice(1))} Styles
                  </h2>

                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={currentElementStyle.color}
                        onChange={(e) => handleElementStyleChange("color", e.target.value)}
                        className="w-16 h-10 cursor-pointer rounded-lg border-2 border-gray-300"
                      />
                      <input
                        type="text"
                        value={currentElementStyle.color}
                        onChange={(e) => handleElementStyleChange("color", e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg placeholder-gray-300 text-black"
                      />
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Font Size
                    </label>
                    <select
                      value={currentElementStyle.fontSize}
                      onChange={(e) => handleElementStyleChange("fontSize", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-black"
                    >
                      <option value="0.75rem">Small (0.75rem)</option>
                      <option value="0.875rem">Default (0.875rem)</option>
                      <option value="1rem">Medium (1rem)</option>
                      <option value="1.125rem">Large (1.125rem)</option>
                      <option value="1.25rem">Extra Large (1.25rem)</option>
                      <option value="1.5rem">2XL (1.5rem)</option>
                      <option value="1.875rem">3XL (1.875rem)</option>
                      <option value="2.25rem">4XL (2.25rem)</option>
                      <option value="3rem">5XL (3rem)</option>
                    </select>
                  </div>

                  {/* Preview */}
                  <div className="mt-6 p-4 rounded-lg border-2 border-gray-300" style={currentElementStyle}>
                    <p className="font-semibold">Preview Text</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Themes;