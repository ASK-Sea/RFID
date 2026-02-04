import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ThemeConfig, ThemeContextType, DEFAULT_THEME, ElementStyle } from "../types/theme";

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Open IndexedDB
const openIndexedDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('rfid_theme_videos', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos');
      }
    };
  });
};

// Save video to IndexedDB - FIXED VERSION
const saveVideoToIndexedDB = async (file: File): Promise<string> => {
  const db = await openIndexedDB();
  
  // Read file as ArrayBuffer first
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
  
  // Then create transaction and store
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('videos', 'readwrite');
    const store = transaction.objectStore('videos');
    
    // Store the ArrayBuffer
    const request = store.put(arrayBuffer, 'background_video');
    
    request.onsuccess = () => {
      // Create blob URL from the ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      resolve(url);
    };
    
    request.onerror = () => reject(request.error);
    
    // Keep transaction alive until complete
    transaction.oncomplete = () => {
      console.log('Video saved to IndexedDB successfully');
    };
    
    transaction.onerror = () => reject(transaction.error);
  });
};

// Get video from IndexedDB
const getVideoFromIndexedDB = async (): Promise<string | null> => {
  try {
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('videos', 'readonly');
      const store = transaction.objectStore('videos');
      const request = store.get('background_video');
      
      request.onsuccess = () => {
        if (request.result) {
          // Create blob URL from the stored ArrayBuffer
          const blob = new Blob([request.result], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get video from IndexedDB:', error);
    return null;
  }
};

// Clear video from IndexedDB
const clearVideoFromIndexedDB = async (): Promise<void> => {
  try {
    const db = await openIndexedDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('videos', 'readwrite');
      const store = transaction.objectStore('videos');
      const request = store.delete('background_video');
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to clear video from IndexedDB:', error);
  }
};

// Clear image URL from localStorage
const clearImageFromStorage = (): void => {
  try {
    const saved = localStorage.getItem("rfid_theme_config");
    if (saved) {
      const config = JSON.parse(saved);
      const { backgroundImage, ...rest } = config;
      localStorage.setItem("rfid_theme_config", JSON.stringify(rest));
    }
  } catch (error) {
    console.error('Failed to clear image from storage:', error);
  }
};

// Context Provider Component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    try {
      const saved = localStorage.getItem("rfid_theme_config");
      return saved ? JSON.parse(saved) : DEFAULT_THEME;
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
      return DEFAULT_THEME;
    }
  });

  // Update entire theme or partial theme
  const updateTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    setTheme((prev) => {
      const updated = { ...prev, ...newTheme };
      
      try {
        // Don't store video data in localStorage, only metadata
        const { backgroundVideo, ...themeWithoutVideo } = updated;
        localStorage.setItem("rfid_theme_config", JSON.stringify(themeWithoutVideo));
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
      
      return updated;
    });
  }, []);

  // Update a specific element's style
  const updateElementStyle = useCallback(
    (elementId: string, style: Partial<ElementStyle>) => {
      setTheme((prev) => {
        const updated = {
          ...prev,
          elements: {
            ...prev.elements,
            [elementId]: {
              ...prev.elements[elementId],
              ...style,
            },
          },
        };
        try {
          localStorage.setItem("rfid_theme_config", JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save element style:', error);
        }
        return updated;
      });
    },
    []
  );

  // Reset to default theme
  const resetTheme = useCallback(async () => {
    try {
      // Clear video from IndexedDB
      await clearVideoFromIndexedDB();
      
      // Clear image from localStorage
      clearImageFromStorage();
      
      // Reset theme state
      setTheme(DEFAULT_THEME);
      localStorage.removeItem("rfid_theme_config");
    } catch (error) {
      console.error('Failed to reset theme:', error);
    }
  }, []);

  // Upload background image and convert to base64
  const uploadBackgroundImage = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      // Validate file size (max 3.5MB)
      if (file.size > 3.5 * 1024 * 1024) {
        reject(new Error("Image file is too large. Please use an image smaller than 3.5MB."));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        reject(new Error("Please select a valid image file."));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          
          // Clear video when setting image
          clearVideoFromIndexedDB()
            .then(() => {
              updateTheme({ 
                backgroundImage: result,
                backgroundVideo: null 
              });
              resolve();
            })
            .catch((error) => {
              reject(new Error("Failed to clear video: " + error.message));
            });
        } catch (error) {
          reject(new Error("Failed to process image"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.onabort = () => {
        reject(new Error("File reading was cancelled"));
      };
      reader.readAsDataURL(file);
    });
  }, [updateTheme]);

  // Upload background video to IndexedDB
  const uploadBackgroundVideo = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      // Validate file size (max 20MB for video)
      if (file.size > 20 * 1024 * 1024) {
        reject(new Error("Video file is too large. Please use a video smaller than 20MB."));
        return;
      }

      // Validate file type
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validVideoTypes.includes(file.type)) {
        reject(new Error("Please select a valid video file (MP4, WebM, OGG)."));
        return;
      }

      // Save to IndexedDB
      saveVideoToIndexedDB(file)
        .then(() => {
          // Clear image when setting video
          clearImageFromStorage();
          updateTheme({ 
            backgroundVideo: 'video-stored', // Flag that we have a video
            backgroundImage: null 
          });
          resolve();
        })
        .catch((error) => {
          reject(new Error("Failed to save video: " + error.message));
        });
    });
  }, [updateTheme]);

  // Get video URL from IndexedDB
  const getBackgroundVideoUrl = useCallback(async (): Promise<string | null> => {
    try {
      const url = await getVideoFromIndexedDB();
      return url;
    } catch (error) {
      console.error('Failed to get video URL:', error);
      return null;
    }
  }, []);

  // Load video on initial render
  useState(() => {
    const checkForStoredVideo = async () => {
      try {
        const videoUrl = await getVideoFromIndexedDB();
        if (videoUrl) {
          // Check if theme doesn't already have video flag
          if (!theme.backgroundVideo) {
            updateTheme({ backgroundVideo: 'video-stored' });
          }
        }
      } catch (error) {
        console.error('Failed to check for stored video:', error);
      }
    };
    
    checkForStoredVideo();
  });

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        updateElementStyle,
        resetTheme,
        uploadBackgroundImage,
        uploadBackgroundVideo,
        getBackgroundVideoUrl,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};