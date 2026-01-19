<template>
  <div class="min-h-screen bg-gray-50 p-8">

    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Top 3 Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Most Active EPC -->
        <div class="card">
          <h2 class="text-xs font-medium text-gray-500 mb-4">Most Active EPC</h2>
          <div class="text-sm font-medium text-gray-900 mb-1">{{ topEPCName }}</div>
          <div class="text-xs text-gray-400 mb-3">
            {{ topEPC.length > 0 ? topEPC[0].epc : 'N/A' }}
          </div>
          <div class="text-lg font-semibold text-blue-600">
            {{ topEPC.length > 0 ? topEPC[0].scan_count : 0 }} scans
          </div>
        </div>

        <!-- Total Scans -->
        <div class="card">
          <h2 class="text-xs font-medium text-gray-500 mb-4">Total Scans</h2>
          <div class="text-3xl font-semibold text-gray-900">{{ totalScans }}</div>
        </div>

        <!-- Unique EPCs -->
        <div class="card">
          <h2 class="text-xs font-medium text-gray-500 mb-4">Unique EPCs</h2>
          <div class="text-3xl font-semibold text-gray-900">{{ stats.length }}</div>
        </div>
      </div>

      <!-- Top EPC by Scan Count Chart -->
      <div class="card">
        <h2 class="text-sm font-medium text-gray-900 mb-6">Top EPC by Scan Count</h2>
        <div class="chart-container">
          <ApexCharts
            type="bar"
            :height="300"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>
      </div>

      <!-- Recent Scans and Scan Statistics Side by Side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Scans -->
        <div class="card">
          <h2 class="text-sm font-medium text-gray-900 mb-5">Recent Scans</h2>

          <div style="max-height: 400px; overflow-y: auto; overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background-color: #f9fafb; z-index: 10;">
                <tr>
                  <th style="padding: 12px; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 2px solid #e5e7eb; border-right: 1px solid #e5e7eb;">Tag Name</th>
                  <th style="padding: 12px; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 2px solid #e5e7eb; border-right: 1px solid #e5e7eb;">EPC</th>
                  <th style="padding: 12px; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 2px solid #e5e7eb; border-right: 1px solid #e5e7eb;">Time</th>
                  <th style="padding: 12px; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-align: left; border-bottom: 2px solid #e5e7eb;">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in scans.slice(0, 10)" :key="row.id">
                  <td style="padding: 12px; font-size: 0.875rem; color: #374151; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; background-color: white;">{{ row.display_name || 'N/A' }}</td>
                  <td style="padding: 12px; font-size: 0.875rem; color: #374151; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; background-color: white;">{{ row.epc }}</td>
                  <td style="padding: 12px; font-size: 0.875rem; color: #374151; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; background-color: white;">{{ formatTime(row.read_time) }}</td>
                  <td style="padding: 12px; font-size: 0.875rem; color: #374151; border-bottom: 1px solid #e5e7eb; background-color: white;">{{ formatDate(row.read_time) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Scan Statistics -->
        <div class="card">
          <h2 class="text-sm font-medium text-gray-900 mb-5">Scan Statistics</h2>

          <div class="table-scroll-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th class="text-left">Tag Name</th>
                  <th class="text-left">EPC</th>
                  <th class="text-center">Scan Count</th>
                  <th class="text-right">Last Scanned</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in stats" :key="stat.epc">
                  <td class="text-sm font-medium text-gray-900">{{ stat.display_name || 'N/A' }}</td>
                  <td class="text-xs text-gray-500">{{ stat.epc }}</td>
                  <td class="text-center">
                    <span class="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                      {{ stat.scan_count }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="text-xs text-gray-700">{{ formatDate(stat.last_seen) }}</div>
                    <div class="text-xs text-gray-400 mt-0.5">{{ formatTime(stat.last_seen) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tag Management -->
      <div class="card">
        <h2 class="text-sm font-medium text-gray-900 mb-5">Tag Management</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Add Tag Form -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-2">Tag ID</label>
              <input
                v-model="newEpc"
                placeholder="e.g., TAG001"
                class="input-field"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-600 mb-2">Tag Name</label>
              <input
                v-model="newTagName"
                placeholder="e.g., Entrance Door"
                class="input-field"
              />
            </div>

            <button
              @click="saveTagName"
              class="w-full bg-blue-600 hover:bg-blue-700 text-black text-sm font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              Add Tag
            </button>
          </div>

          <!-- Registered Tags List -->
          <div>
            <h3 class="text-xs font-medium text-gray-600 mb-3">Registered Tags ({{ tagList.length }})</h3>
            <div class="table-scroll-wrapper" style="max-height: 300px;">
              <div class="space-y-2">
                <div
                  v-for="t in tagList"
                  :key="t.epc"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ t.tag_name }}</div>
                    <div class="text-xs text-gray-400 mt-0.5">ID: {{ t.epc }}</div>
                  </div>
                  <button 
                    @click="deleteTag(t.epc)"
                    class="text-gray-400 hover:text-red-500 transition-colors text-xs font-medium px-3 py-1 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Count Registered Tag -->
      <div class="card">
        <h2 class="text-sm font-medium text-gray-900 mb-5">Count Registered Tag</h2>
        
        <div v-if="registeredTagStats.length === 0" class="text-center py-8 text-gray-400 text-sm">
          No registered tags found. Add tags above to see their statistics here.
        </div>

        <div v-else class="table-scroll-wrapper">
          <table class="stats-table">
            <thead>
              <tr>
                <th class="text-left">Tag Name</th>
                <th class="text-left">EPC</th>
                <th class="text-center">Scan Count</th>
                <th class="text-right">Last Scanned</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in registeredTagStats" :key="stat.epc">
                <td class="text-sm font-medium text-gray-900">{{ stat.tag_name }}</td>
                <td class="text-xs text-gray-500">{{ stat.epc }}</td>
                <td class="text-center">
                  <span class="inline-flex items-center justify-center w-8 h-8 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                    {{ stat.scan_count || 0 }}
                  </span>
                </td>
                <td class="text-right">
                  <div v-if="stat.last_seen" class="text-xs text-gray-700">{{ formatDate(stat.last_seen) }}</div>
                  <div v-if="stat.last_seen" class="text-xs text-gray-400 mt-0.5">{{ formatTime(stat.last_seen) }}</div>
                  <div v-else class="text-xs text-gray-400">Not scanned yet</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Count with Reset Feature -->
      <div class="card">
        <h2 class="text-sm font-medium text-gray-900 mb-5">Count with Reset Feature</h2>
        
        <div v-if="registeredTagStats.length === 0" class="text-center py-8 text-gray-400 text-sm">
          No registered tags found. Add tags above to see their statistics here.
        </div>

        <div v-else class="table-scroll-wrapper">
          <table class="stats-table">
            <thead>
              <tr>
                <th class="text-left">Tag Name</th>
                <th class="text-left">EPC</th>
                <th class="text-center">Current Count</th>
                <th class="text-right">Last Scanned</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in registeredTagStats" :key="stat.epc">
                <td class="text-sm font-medium text-gray-900">{{ stat.tag_name }}</td>
                <td class="text-xs text-gray-500">{{ stat.epc }}</td>
                <td class="text-center">
                  <div class="flex flex-col items-center gap-1">
                    <span class="inline-flex items-center justify-center w-10 h-10 bg-purple-50 text-purple-600 rounded-full text-sm font-semibold">
                      {{ getAdjustedCount(stat.epc, stat.scan_count || 0) }}
                    </span>
                    <span v-if="resetBaselines[stat.epc]" class="text-xs text-gray-400">
                      (Total: {{ stat.scan_count || 0 }})
                    </span>
                  </div>
                </td>
                <td class="text-right">
                  <div v-if="stat.last_seen" class="text-xs text-gray-700">{{ formatDate(stat.last_seen) }}</div>
                  <div v-if="stat.last_seen" class="text-xs text-gray-400 mt-0.5">{{ formatTime(stat.last_seen) }}</div>
                  <div v-else class="text-xs text-gray-400">Not scanned yet</div>
                </td>
                <td class="text-center">
                  <button 
                    @click="resetCount(stat.epc, stat.scan_count || 0)"
                    class="text-xs font-medium px-3 py-1.5 rounded transition-colors"
                    :class="resetBaselines[stat.epc] 
                      ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'"
                  >
                    {{ resetBaselines[stat.epc] ? 'Reset Again' : 'Reset Count' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ApexCharts from "vue3-apexcharts";
import type { ApexOptions } from "apexcharts";
import { getScans, getStats, getTopEPC } from "../api";
import axios from "axios";
import type { Scan, Stat, Tag, RegisteredTagStat, ResetBaselines } from "../types/rfid";

// Data refs
const scans = ref<Scan[]>([]);
const stats = ref<Stat[]>([]);
const topEPC = ref<Stat[]>([]);
const totalScans = ref<number>(0);
const chartSeries = ref<Array<{ name: string; data: number[] }>>([]);

const chartOptions = ref<ApexOptions>({
  chart: { 
    toolbar: { show: false }, 
    height: 300,
    type: 'bar'
  },
  plotOptions: { 
    bar: { 
      columnWidth: "45%",
      horizontal: false,
      borderRadius: 4,
      distributed: true
    } 
  },
  colors: ['#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6'],
  xaxis: { 
    categories: [], 
    labels: { 
      rotate: -45, 
      rotateAlways: true,
      hideOverlappingLabels: false,
      trim: true,
      style: { 
        fontSize: "10px",
        colors: '#6b7280'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    tooltip: {
      enabled: false
    }
  },
  yaxis: { 
    labels: {
      formatter: (val: number) => Math.round(val).toString(),
      style: {
        fontSize: "10px",
        colors: '#6b7280'
      }
    },
    title: {
      text: 'Scan Count',
      style: {
        fontSize: '11px',
        fontWeight: 500,
        color: '#6b7280'
      }
    }
  },
  dataLabels: { 
    enabled: false
  },
  legend: {
    show: false
  },
  grid: { 
    borderColor: '#f3f4f6',
    strokeDashArray: 3,
    padding: { 
      top: 0, 
      right: 20, 
      bottom: 10, 
      left: 10 
    } 
  },
  tooltip: {
    enabled: true,
    y: {
      formatter: (val: number) => val + " scans"
    },
    x: {
      show: true
    }
  }
});

const topEPCName = ref<string>("N/A");

// Tag Management
const tagList = ref<Tag[]>([]);
const newEpc = ref<string>("");
const newTagName = ref<string>("");
const registeredTagStats = ref<RegisteredTagStat[]>([]);

// Reset baselines - stores the count at which reset was clicked
const resetBaselines = ref<ResetBaselines>({});

// Load from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem('rfid_reset_baselines');
  if (saved) {
    resetBaselines.value = JSON.parse(saved) as ResetBaselines;
  }
  loadData();
  loadTags();
  setInterval(loadData, 3000);
});

// Helper functions
function formatTime(datetime: string | null): string {
  if (!datetime) return '';
  const date = new Date(datetime);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(datetime: string | null): string {
  if (!datetime) return '';
  const date = new Date(datetime);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Get adjusted count (actual count minus baseline)
function getAdjustedCount(epc: string, actualCount: number): number {
  const baseline = resetBaselines.value[epc] || 0;
  return Math.max(0, actualCount - baseline);
}

// Reset count function
function resetCount(epc: string, currentCount: number): void {
  resetBaselines.value[epc] = currentCount;
  localStorage.setItem('rfid_reset_baselines', JSON.stringify(resetBaselines.value));
}

// Load dashboard data
async function loadData(): Promise<void> {
  const s1 = await getScans();
  scans.value = s1.data;
  totalScans.value = s1.data.length;

  const s2 = await getStats();
  stats.value = s2.data;

  const s3 = await getTopEPC();
  topEPC.value = s3.data;

  if (topEPC.value.length > 0) {
    topEPCName.value = topEPC.value[0].display_name || 'N/A';
  }

  // Update chart data
  const categories = topEPC.value.map((e, index) => {
    const name = e.display_name || e.epc || `Tag ${index + 1}`;
    return name.length > 20 ? name.substring(0, 17) + '...' : name;
  });
  
  const scanCounts = topEPC.value.map(e => e.scan_count);
  
  chartOptions.value = {
    ...chartOptions.value,
    xaxis: {
      ...chartOptions.value.xaxis,
      categories: categories
    }
  };
  
  chartSeries.value = [{ name: "Scan Count", data: scanCounts }];
  
  updateRegisteredTagStats();
}

// Load tags
async function loadTags(): Promise<void> {
  const res = await axios.get<Tag[]>("http://localhost:5001/api/tags");
  tagList.value = res.data;
  updateRegisteredTagStats();
}

// Update registered tag statistics
function updateRegisteredTagStats(): void {
  registeredTagStats.value = tagList.value.map(tag => {
    const stat = stats.value.find(s => s.epc === tag.epc);
    
    return {
      epc: tag.epc,
      tag_name: tag.tag_name,
      scan_count: stat ? stat.scan_count : 0,
      last_seen: stat ? stat.last_seen : null
    };
  });
}

// Save tag
async function saveTagName(): Promise<void> {
  if (!newEpc.value || !newTagName.value) return;

  await axios.post("http://localhost:5001/api/tags", {
    epc: newEpc.value,
    tag_name: newTagName.value,
  });

  newEpc.value = "";
  newTagName.value = "";
  loadTags();
  loadData();
}

// Delete tag
async function deleteTag(epc: string): Promise<void> {
  if (!confirm('Are you sure you want to delete this tag?')) {
    return;
  }
  
  try {
    await axios.delete(`http://localhost:5001/api/tags/${epc}`);
    
    // Also remove reset baseline for this tag
    delete resetBaselines.value[epc];
    localStorage.setItem('rfid_reset_baselines', JSON.stringify(resetBaselines.value));
    
    await loadTags();
    await loadData();
    
    alert('Tag deleted successfully!');
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    alert(`Failed to delete tag: ${error.response?.data?.error || error.message}`);
  }
}
</script>

<style scoped>
.card { 
  background: white; 
  padding: 20px; 
  border-radius: 6px; 
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

.chart-container { 
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.table-scroll-wrapper {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table thead {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.stats-table th {
  padding: 8px 12px;
  font-size: 0.65rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

.stats-table td {
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.stats-table tbody tr:hover {
  background-color: #fafafa;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.15s;
  background-color: white;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.input-field::placeholder {
  color: #9ca3af;
}

.table-scroll-wrapper::-webkit-scrollbar {
  width: 6px;
}

.table-scroll-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>