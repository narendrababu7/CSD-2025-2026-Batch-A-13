
import { DashboardType, DashboardData, TableRow, MapMarker, Alert, ChartDataPoint, StatCardData } from '../types';
import { CloudRain, Zap, Car, Droplets, AlertTriangle, Activity, Wind, Navigation } from 'lucide-react';
import { CITY_AREAS, ANANTAPUR_SUBSTATIONS, AREA_COORDINATES } from '../constants';

// --- API HELPER FUNCTIONS ---

// 1. Real Air Quality API (Open-Meteo)
const fetchRealAirData = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide&hourly=pm10,pm2_5&timezone=auto`
    );
    return await response.json();
  } catch (error) {
    console.error("Air API Error:", error);
    return null;
  }
};

// 2. Real Route Calculation (OSRM API)
// Returns an array of [lat, lng] points for drawing a polyline
export const fetchRoutePolyline = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
  try {
    // OSRM expects: longitude,latitude
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // GeoJSON returns [lng, lat], Leaflet needs [lat, lng]
      const coordinates = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      return { 
        path: coordinates, 
        distance: (data.routes[0].distance / 1000).toFixed(2) + ' km',
        duration: (data.routes[0].duration / 60).toFixed(0) + ' min'
      };
    }
    return null;
  } catch (error) {
    console.error("Routing API Error:", error);
    return null;
  }
};

// 3. Simulated IoT Call
const mockApiCall = async () => {
  await new Promise(resolve => setTimeout(resolve, 300)); 
};

// --- DATA GENERATORS ---

const generateTrendData = (base: number, variance: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const time = new Date(now.getTime() - (11 - i) * 3600000); 
    const hour = time.getHours();
    let timeFactor = 1;
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) timeFactor = 1.3;
    
    data.push({
      time: time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      value: Math.max(0, Math.floor(base * timeFactor + (Math.random() - 0.5) * variance)),
    });
  }
  return data;
};

const generateDistributionData = (labels: string[], base: number): ChartDataPoint[] => {
  return labels.map(label => ({
    time: label,
    label: label,
    value: Math.floor(base + (Math.random() - 0.5) * (base * 0.5))
  }));
};

const getStatus = (val: number, type: DashboardType): 'Safe' | 'Moderate' | 'High' | 'Severe' | 'Critical' => {
  if (type === 'traffic') return val > 80 ? 'Severe' : val > 60 ? 'High' : val > 30 ? 'Moderate' : 'Safe';
  if (type === 'air') return val > 150 ? 'Critical' : val > 100 ? 'High' : val > 50 ? 'Moderate' : 'Safe';
  if (type === 'water') return val < 6 || val > 8.5 ? 'Critical' : 'Safe'; 
  return val > 90 ? 'Critical' : val > 75 ? 'High' : 'Safe'; 
};

// --- MAIN SERVICE CONTROLLER ---

export const fetchDashboardData = async (
  type: DashboardType, 
  city: string, 
  lat: number, 
  lng: number,
  selectedArea?: string
): Promise<DashboardData> => {
  
  const tableData: TableRow[] = [];
  const markers: MapMarker[] = [];
  const alerts: Alert[] = [];
  
  let stats: StatCardData[] = [];
  let areas: string[] = [];
  let apiData: any = null;

  // --- SPECIAL HANDLING FOR ELECTRICITY (Cascading Load Calculation) ---
  if (type === 'electricity') {
    // If we are in Anantapur, use the real substation data
    if (city === 'Anantapur') {
      areas = ANANTAPUR_SUBSTATIONS.map(s => s.name);
      
      // Map to store calculated loads to support hierarchy
      const loadMap: Record<string, number> = {};

      // 1. Calculate loads for LEAF NODES (Tier 1) first
      ANANTAPUR_SUBSTATIONS.filter(s => s.tier === 1).forEach(sub => {
        // Random realistic usage for leaf nodes
        const usage = Math.floor(Math.random() * (sub.capacity * 0.9)); // 0-90% load
        loadMap[sub.id] = usage;
      });

      // 2. Calculate loads for INTERMEDIATE NODES (Tier 2)
      ANANTAPUR_SUBSTATIONS.filter(s => s.tier === 2).forEach(sub => {
        // Find children
        const childrenLoad = ANANTAPUR_SUBSTATIONS
          .filter(child => child.parent === sub.id)
          .reduce((sum, child) => sum + (loadMap[child.id] || 0), 0);
        
        // Add transmission loss + local direct consumption (approx 10%)
        loadMap[sub.id] = Math.floor(childrenLoad * 1.1);
      });

      // 3. Calculate loads for MAIN GRID (Tier 3)
      ANANTAPUR_SUBSTATIONS.filter(s => s.tier === 3).forEach(sub => {
         // Find direct children (Tier 2 or Tier 1 connected directly)
         const childrenLoad = ANANTAPUR_SUBSTATIONS
          .filter(child => child.parent === sub.id)
          .reduce((sum, child) => sum + (loadMap[child.id] || 0), 0);
         
         // Add incoming grid transmission overhead
         loadMap[sub.id] = Math.floor(childrenLoad * 1.05); 
      });

      // Generate Display Data
      ANANTAPUR_SUBSTATIONS.forEach((sub, index) => {
        const currentLoad = loadMap[sub.id];
        const loadPercentage = Math.min(100, Math.floor((currentLoad / sub.capacity) * 100));
        
        let status: any = 'Safe';
        if (loadPercentage > 95) status = 'Critical';
        else if (loadPercentage > 85) status = 'High';
        else status = 'Safe';

        // Coverage logic: Use the specific coverage field from constants
        const coverageInfo = (sub as any).coverage || 'Local Area';

        tableData.push({
          id: sub.id,
          city: 'Anantapur',
          location: sub.name,
          param1: `${currentLoad} MW`, // Load
          param2: `${sub.capacity} MW`, // Capacity
          param3: `${loadPercentage}%`, // Utilization
          status: status
        });

        markers.push({
          id: sub.id,
          lat: sub.lat,
          lng: sub.lng,
          value: loadPercentage,
          type: status === 'Safe' ? 'good' : status === 'High' ? 'moderate' : 'critical',
          label: sub.name,
          // Shows "Serves: Area A, Area B" in the map popup
          details: `${coverageInfo} | Load: ${currentLoad} MW`
        });

        if (status === 'Critical') {
          alerts.push({
            id: `alert-elec-${index}`,
            type: 'danger',
            message: `Grid Alert: Critical Overload (${loadPercentage}%) at ${sub.name}.`,
            location: sub.name,
            timestamp: new Date().toLocaleTimeString(),
            value: `${loadPercentage}%`,
            category: 'electricity'
          });
        }
      });

      // Calculate total grid load (Source Node Load)
      const sourceNode = ANANTAPUR_SUBSTATIONS.find(s => s.tier === 3);
      const mainLoad = sourceNode ? loadMap[sourceNode.id] : 0;

      stats = [
        { title: 'Total Grid Load', value: `${mainLoad}`, unit: 'MW', status: 'neutral', icon: Zap },
        { title: 'Active Substations', value: `${ANANTAPUR_SUBSTATIONS.length}`, status: 'good', icon: Activity },
        { title: 'System Efficiency', value: '94%', status: 'good', icon: Zap },
        { title: 'Grid Failures', value: alerts.length, status: alerts.length > 0 ? 'bad' : 'good', icon: AlertTriangle },
      ];

    } else {
      // GENERIC ELECTRICITY LOGIC FOR OTHER CITIES
      // Use the city's areas to generate mock substations
      areas = CITY_AREAS[city] || CITY_AREAS['Default'];
      
      let totalLoad = 0;
      
      areas.forEach((area, index) => {
        const id = `sub-${index}`;
        
        // Get precise coordinates for the area
        let subLat = lat;
        let subLng = lng;
        if (AREA_COORDINATES[area]) {
          subLat = AREA_COORDINATES[area].lat;
          subLng = AREA_COORDINATES[area].lng;
        }

        const capacity = Math.floor(50 + Math.random() * 100); // 50-150 MW
        const currentLoad = Math.floor(Math.random() * (capacity * 0.95));
        const loadPercentage = Math.floor((currentLoad / capacity) * 100);
        totalLoad += currentLoad;

        let status: any = 'Safe';
        if (loadPercentage > 95) status = 'Critical';
        else if (loadPercentage > 85) status = 'High';
        else status = 'Safe';

        tableData.push({
          id,
          city,
          location: `${area} Substation`,
          param1: `${currentLoad} MW`,
          param2: `${capacity} MW`,
          param3: `${loadPercentage}%`,
          status
        });

        markers.push({
          id,
          lat: subLat,
          lng: subLng,
          value: loadPercentage,
          type: status === 'Safe' ? 'good' : status === 'High' ? 'moderate' : 'critical',
          label: `${area} SS`,
          details: `Serves: ${area} | Load: ${currentLoad} MW`
        });

        if (status === 'Critical') {
          alerts.push({
            id: `alert-elec-${index}`,
            type: 'danger',
            message: `Grid Alert: Critical Overload (${loadPercentage}%) at ${area} Substation.`,
            location: `${area} SS`,
            timestamp: new Date().toLocaleTimeString(),
            value: `${loadPercentage}%`,
            category: 'electricity'
          });
        }
      });

      stats = [
        { title: 'Total Grid Load', value: `${totalLoad}`, unit: 'MW', status: 'neutral', icon: Zap },
        { title: 'Active Substations', value: `${areas.length}`, status: 'good', icon: Activity },
        { title: 'System Efficiency', value: '92%', status: 'good', icon: Zap },
        { title: 'Grid Failures', value: alerts.length, status: alerts.length > 0 ? 'bad' : 'good', icon: AlertTriangle },
      ];
    }

    return {
      stats,
      chartTrend: generateTrendData(80, 15),
      chartDistribution: areas.map(a => ({ time: a.split(' ')[0], label: a.split(' ')[0], value: Math.floor(Math.random()*100) })),
      alerts,
      tableData,
      markers
    };
  }

  // --- STANDARD LOGIC FOR TRAFFIC, AIR, WATER ---
  
  areas = CITY_AREAS[city] || CITY_AREAS['Default'];

  if (type === 'air') {
    apiData = await fetchRealAirData(lat, lng);
  } else {
    await mockApiCall();
  }

  for (let i = 0; i < areas.length; i++) {
    const area = areas[i];
    const id = `node-${i}`;
    let val1 = 0, val2 = 0, val3: any = 0;
    let status: any = 'Safe';

    let itemLat = lat;
    let itemLng = lng;

    // Use PRECISE coordinates if available for the specific area
    if (AREA_COORDINATES[area]) {
      itemLat = AREA_COORDINATES[area].lat;
      itemLng = AREA_COORDINATES[area].lng;
    } else {
      // Fallback: Use exact city center if coordinate is missing
      // This prevents random/incorrect placement
      console.warn(`Missing coordinates for area: ${area}`);
      itemLat = lat; 
      itemLng = lng;
    }

    if (type === 'traffic') {
      // DENSITY CALCULATION
      // Density = (Vehicle Count / Road Capacity) * 100
      const roadCapacity = 2000; // cars per hour per lane
      let vehicleCount = Math.floor(500 + Math.random() * 1800);

      // --- REALISTIC TRAFFIC SIMULATION ---
      // Check for busy areas using string matching to handle specific keys
      if (area.includes('Bus Stand') || area.includes('Railway Station') || area === 'Clock Tower') {
        vehicleCount = Math.floor(1500 + Math.random() * 800); // 1500-2300 vehicles (High Density)
      } 
      // JNTUA University is moderately busy (Student movement)
      else if (area === 'JNTUA University') {
        vehicleCount = Math.floor(800 + Math.random() * 600); // 800-1400 vehicles (Moderate-High)
      }

      const density = Math.min(100, Math.floor((vehicleCount / roadCapacity) * 100));
      const speed = Math.floor(60 - (density * 0.5)); // Speed drops as density increases

      val1 = density; // Density %
      val2 = speed; // Speed km/h
      val3 = vehicleCount; // Count

      status = getStatus(density, 'traffic');

    } else if (type === 'air') {
      // OPEN-METEO DATA
      if (apiData && apiData.current) {
        const baseAQI = apiData.current.us_aqi;
        val1 = Math.floor(baseAQI + (Math.random() - 0.5) * 20); // AQI
        val2 = Math.floor(apiData.current.pm2_5 + (Math.random() - 0.5) * 5); // PM2.5
        val3 = Math.floor(apiData.current.pm10 + (Math.random() - 0.5) * 10); // PM10
      } else {
        val1 = Math.floor(40 + Math.random() * 100);
        val2 = Math.floor(val1 * 0.6);
        val3 = Math.floor(val1 * 0.8);
      }
      status = getStatus(val1, 'air');

    } else if (type === 'water') {
      val1 = parseFloat((6.5 + Math.random() * 1.5).toFixed(2)); // pH
      val2 = Math.floor(100 + Math.random() * 400); // TDS
      val3 = Math.floor(Math.random() * 5); // Turbidity
      if (Math.random() > 0.9) { val1 = 5.5; status = 'Critical'; } else { status = 'Safe'; }
    }

    tableData.push({
      id,
      location: area,
      city,
      param1: type === 'traffic' ? val1 : val1, // Density or AQI
      param2: val2,
      param3: val3,
      status: status as any
    });

    markers.push({
      id,
      lat: itemLat,
      lng: itemLng,
      value: Number(val1),
      type: status === 'Safe' || status === 'Good' ? 'good' : (status === 'Moderate' ? 'moderate' : 'critical'),
      label: area,
      details: type === 'traffic' 
        ? `Density: ${val1}% | Speed: ${val2}km/h` 
        : `Value: ${val1}`
    });

    if (status === 'Severe' || status === 'Critical') {
      let message = '';
      if (type === 'traffic') {
        message = `Traffic Alert: Heavy congestion (Density: ${val1}%) at ${area}.`;
      } else if (type === 'air') {
        message = `Air Quality Alert: Hazardous AQI (${val1}) at ${area}.`;
      } else {
        message = `Water Quality Alert: Contamination risk detected at ${area}.`;
      }

      alerts.push({
        id: `alert-${i}`,
        type: 'danger',
        message: message,
        location: area,
        timestamp: new Date().toLocaleTimeString(),
        value: `${val1}`,
        category: type
      });
    }
  }

  // Stats Logic
  // If a specific area is selected, calculate stats ONLY for that area
  const statsData = selectedArea 
    ? tableData.filter(row => row.location === selectedArea)
    : tableData;

  // Fallback to full data if filter returns empty (e.g. area name mismatch)
  const finalData = statsData.length > 0 ? statsData : tableData;

  // Filter markers if a specific area is selected to focus map
  // MODIFIED: Always show ALL markers for the city to provide context and verify relative positions
  // The map will center/zoom to fit them, or fly to the specific one if handled by MapComponent
  const displayMarkers = markers; 
  
  const finalMarkers = displayMarkers.length > 0 ? displayMarkers : markers;

  if (type === 'traffic') {
    const avgDensity = Math.floor(finalData.reduce((acc, row) => acc + Number(row.param1), 0) / finalData.length);
    const avgSpeed = Math.floor(finalData.reduce((acc, row) => acc + Number(row.param2), 0) / finalData.length);
    const totalVehicles = finalData.reduce((acc, row) => acc + Number(row.param3), 0);

    stats = [
      { title: selectedArea ? 'Area Road Density' : 'Avg Road Density', value: `${avgDensity}%`, status: avgDensity > 70 ? 'bad' : 'neutral', icon: Car },
      { title: selectedArea ? 'Area Speed' : 'Avg City Speed', value: `${avgSpeed}`, unit: 'km/h', status: avgSpeed < 30 ? 'bad' : 'neutral', icon: Activity },
      { title: selectedArea ? 'Area Vehicles' : 'Total Vehicles', value: totalVehicles.toLocaleString(), status: 'good', icon: Navigation },
      { title: 'Congestion pts', value: alerts.length, status: alerts.length > 2 ? 'bad' : 'good', icon: AlertTriangle },
    ];
  } else if (type === 'air') {
    const avgAQI = Math.floor(finalData.reduce((acc, row) => acc + Number(row.param1), 0) / finalData.length);
    const avgPM25 = Math.floor(finalData.reduce((acc, row) => acc + Number(row.param2), 0) / finalData.length);

    stats = [
      { title: selectedArea ? 'Area AQI' : 'City Avg AQI', value: `${avgAQI}`, status: avgAQI > 100 ? 'bad' : 'neutral', icon: Wind },
      { title: 'PM2.5 Level', value: `${avgPM25}`, unit: 'µg/m³', status: avgPM25 > 50 ? 'bad' : 'good', icon: CloudRain },
      { title: 'Sensor Status', value: 'Online', status: 'good', icon: Activity },
      { title: 'Hazard Zones', value: alerts.length, status: 'bad', icon: AlertTriangle },
    ];
  } else {
    const avgPH = (finalData.reduce((acc, row) => acc + Number(row.param1), 0) / finalData.length).toFixed(1);
    const avgTDS = Math.floor(finalData.reduce((acc, row) => acc + Number(row.param2), 0) / finalData.length);

    stats = [
      { title: 'Avg pH Level', value: `${avgPH}`, status: Number(avgPH) < 6.5 || Number(avgPH) > 8.5 ? 'bad' : 'good', icon: Droplets },
      { title: 'Avg TDS', value: `${avgTDS}`, unit: 'mg/L', status: avgTDS > 500 ? 'bad' : 'neutral', icon: Activity },
      { title: 'Quality Index', value: '92%', status: 'good', icon: Droplets },
      { title: 'Active Alerts', value: alerts.length, status: 'bad', icon: AlertTriangle },
    ];
  }

  return {
    stats,
    chartTrend: generateTrendData(type === 'air' ? 80 : 50, 20),
    chartDistribution: generateDistributionData(areas.slice(0, 5), 60),
    alerts,
    tableData,
    markers: finalMarkers
  };
};
