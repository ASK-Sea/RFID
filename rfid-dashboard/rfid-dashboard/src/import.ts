// src/import.ts - Centralized imports for all pages

// React
export { default as React } from "react";
export { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Third-party libraries
export { default as axios } from "axios";
export { io } from "socket.io-client";
export type { Socket } from "socket.io-client";

// Custom hooks & context
export { useTheme } from "./contexts/ThemeContext";

// Types
export type { ElementStyle } from "./types/theme";
export * from "./types";

// Components
export { default as Header } from "./views/partials/header";
export { default as Sidebar } from "./views/partials/sidebar";

// Global Functions
export * from "./functions";

// Assets
export { default as bgImage } from "./assets/WhatsApp Image 2025-10-22 at 11.04.55 AM.jpeg";
