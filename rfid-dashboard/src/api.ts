// src/api.ts
import axios from 'axios';
import type { Scan, Stat } from './types/rfid';

const API_BASE = `${window.location.origin}/api`;

export interface ApiResponse<T> {
  data: T;
}

export async function getScans(): Promise<ApiResponse<Scan[]>> {
  const response = await axios.get(`${API_BASE}/scans`);
  return response;
}

export async function getStats(): Promise<ApiResponse<Stat[]>> {
  const response = await axios.get(`${API_BASE}/stats`);
  return response;
}

export async function getTopEPC(): Promise<ApiResponse<Stat[]>> {
  const response = await axios.get(`${API_BASE}/top-epc`);
  return response;
}