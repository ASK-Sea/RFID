// admin/import.ts - Centralized imports for all admin pages

// React
export { default as React } from "react";
export { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Third-party libraries
export { default as axios } from "axios";
export { io } from "socket.io-client";
export type { Socket } from "socket.io-client";

// Custom hooks & context
export { useTheme } from "../../contexts/ThemeContext";

// Types
export type { ElementStyle } from "../../types/theme";

// Components
export { default as Header } from "../partials/header";
export { default as Sidebar } from "../partials/sidebar";

// Assets
export { default as bgImage } from "../../assets/WhatsApp Image 2025-10-22 at 11.04.55 AM.jpeg";
// export * from "./utils";
