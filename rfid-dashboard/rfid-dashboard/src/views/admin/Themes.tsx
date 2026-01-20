import { React, useState, useRef } from "../../import";
import { useTheme, Header, Sidebar, bgImage, ElementStyle } from "../../import";

const Themes: React.FC = () => {
  const { theme, updateTheme, updateElementStyle, resetTheme, uploadBackgroundImage } = useTheme();
  const [activeTab, setActiveTab] = useState<"background" | "elements">("background");
  const [selectedElement, setSelectedElement] = useState<string>("title");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle background image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploadError(null);
        setUploadSuccess(false);
        await uploadBackgroundImage(file);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
        setUploadError(errorMessage);
        console.error("Failed to upload image:", error);
      }
    }
  };

  // Handle background color change
  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTheme({ backgroundColor: e.target.value });
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className="flex-1 p-6 bg-cover bg-center overflow-y-auto"
          style={{
            backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : `url(${bgImage})`,
            backgroundColor: theme.backgroundColor,
          }}
        >
          <div className="container mx-auto p-6 bg-white/80 rounded-lg shadow-lg max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Theme Customization</h1>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b-2 border-gray-300">
              <button
                onClick={() => setActiveTab("background")}
                className={`px-6 py-3 font-semibold text-lg transition-all ${
                  activeTab === "background"
                    ? "border-b-4 border-blue-500 text-blue-600 hover:text-white"
                    : "text-blue-600 hover:text-white"
                }`}
              >
                Background Settings
              </button>
              <button
                onClick={() => setActiveTab("elements")}
                className={`px-6 py-3 font-semibold text-lg transition-all ${
                  activeTab === "elements"
                    ? "border-b-4 border-blue-500 text-blue-600 hover:text-white"
                    : "text-blue-600 hover:text-white"
                }`}
              >
                Element Styles
              </button>
            </div>

            {/* Background Settings Tab */}
            {activeTab === "background" && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Background Image</h2>
                  <div className="space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 bg-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-700 hover:text-white transition-colors"
                    >
                      Upload Background Image
                    </button>
                    {uploadError && (
                      <p className="text-red-600 font-semibold">✗ {uploadError}</p>
                    )}
                    {uploadSuccess && (
                      <p className="text-green-600 font-semibold">✓ Background image uploaded successfully</p>
                    )}
                    {theme.backgroundImage && !uploadError && !uploadSuccess && (
                      <p className="text-green-600 font-semibold">✓ Background image active</p>
                    )}
                  </div>
                </div>

                {/* <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Background Color</h2>
                  <div className="space-y-3">
                    <input
                      type="color"
                      value={theme.backgroundColor}
                      onChange={handleBackgroundColorChange}
                      className="w-full h-12 cursor-pointer rounded-lg border-2 border-gray-300"
                    />
                    <p className="text-black">Current Color: {theme.backgroundColor}</p>
                  </div>
                </div> */}

                <button
                  onClick={resetTheme}
                  className="w-full px-4 py-3 bg-red-600 text-blue-600 font-semibold rounded-lg hover:bg-red-700 hover:text-white transition-colors"
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

                  {/* Background Color */}
                  {/* <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={currentElementStyle.backgroundColor}
                        onChange={(e) => handleElementStyleChange("backgroundColor", e.target.value)}
                        className="w-16 h-10 cursor-pointer rounded-lg border-2 border-gray-300"
                      />
                      <input
                        type="text"
                        value={currentElementStyle.backgroundColor}
                        onChange={(e) => handleElementStyleChange("backgroundColor", e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg placeholder-gray-300 text-black"
                      />
                    </div>
                  </div> */}

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
