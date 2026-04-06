export type DashboardType = 'traffic' | 'air' | 'water' | 'electricity';

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface LocationData {
  state: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  value: number;
  type: 'good' | 'moderate' | 'critical';
  label: string;
  details?: string;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  predicted?: number;
  label?: string; // For bar charts
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'danger';
  message: string;
  location: string;
  timestamp: string;
  value: string;
  category?: DashboardType;
}

export interface StatCardData {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  status: 'good' | 'neutral' | 'bad';
  icon: any;
}

export interface TableRow {
  id: string;
  location: string;
  city: string;
  param1: string | number; // e.g. Congestion, AQI
  param2: string | number; // e.g. Speed, PM2.5
  param3: string | number; // e.g. Vehicles, Status
  status: 'Safe' | 'Moderate' | 'High' | 'Severe' | 'Critical';
}

export interface DashboardData {
  stats: StatCardData[];
  chartTrend: ChartDataPoint[];
  chartDistribution: ChartDataPoint[];
  alerts: Alert[];
  tableData: TableRow[];
  markers: MapMarker[];
}

export interface StateCityMap {
  [state: string]: string[];
}