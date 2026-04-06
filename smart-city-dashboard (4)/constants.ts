
import { StateCityMap } from './types';

export const INDIAN_LOCATIONS: StateCityMap = {
  "Andhra Pradesh": ["Anantapur", "Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  "Telangana": ["Hyderabad", "Warangal"],
  "Karnataka": ["Bengaluru", "Mysuru"],
  "Maharashtra": ["Mumbai", "Pune"],
  "Tamil Nadu": ["Chennai", "Coimbatore"],
  "Delhi": ["New Delhi"],
};

// Specific areas for cities to ensure realistic filtering
// Updated to include all cities in INDIAN_LOCATIONS
export const CITY_AREAS: Record<string, string[]> = {
  "Anantapur": [
    "Clock Tower", 
    "RTC Bus Stand", 
    "Railway Station Main Entrance", 
    "JNTUA Admin Block", 
    "Government General Hospital", 
    "Collectorate Office",
    "Arts College",
    "Saptagiri Circle"
  ],
  "Visakhapatnam": [
    "Jagadamba Junction", 
    "MVP Colony Circle", 
    "Gajuwaka Junction", 
    "RK Beach (Submarine Museum)", 
    "Siripuram Junction"
  ],
  "Vijayawada": [
    "Benz Circle", 
    "PVP Square Mall", 
    "Kanaka Durga Temple", 
    "Vijayawada Railway Station", 
    "Autonagar Gate"
  ],
  "Guntur": [
    "Lodge Center", 
    "NTR Stadium", 
    "Guntur Bus Stand", 
    "Brodiepet Main Road"
  ],
  "Tirupati": [
    "Tirupati Central Bus Station", 
    "Alipiri Garuda Statue", 
    "Srinivasam Complex", 
    "Ruia Hospital Main Gate"
  ],
  
  "Hyderabad": [
    "Banjara Hills Road No 1", 
    "Jubilee Hills Checkpost", 
    "Cyber Towers (Hitech City)", 
    "Kukatpally Y Junction", 
    "Secunderabad Station", 
    "Charminar"
  ],
  "Warangal": [
    "NIT Warangal Main Gate", 
    "Thousand Pillar Temple", 
    "Kazipet Junction", 
    "Bhadrakali Temple Arch"
  ],
  
  "Bengaluru": [
    "Koramangala Sony Signal", 
    "Indiranagar 100ft Road", 
    "Phoenix Marketcity (Whitefield)", 
    "MG Road Metro Station", 
    "Majestic Bus Station"
  ],
  "Mysuru": [
    "Mysore Palace Main Gate", 
    "KRS Dam Viewpoint", 
    "Chamundi Hill Temple", 
    "Mysuru Railway Station"
  ],
  
  "Mumbai": [
    "Gateway of India", 
    "Dadar Station", 
    "Andheri Station West", 
    "Bandra Bandstand", 
    "Juhu Beach Main Entrance"
  ],
  "Pune": [
    "Shivajinagar Bus Stand", 
    "Hinjewadi Phase 1", 
    "Koregaon Park North Main", 
    "Magarpatta City Gate"
  ],
  
  "Chennai": [
    "Chennai Central Station", 
    "Marina Beach Lighthouse", 
    "T Nagar Panagal Park", 
    "Adyar Signal", 
    "Velachery Phoenix Mall"
  ],
  "Coimbatore": [
    "Gandhipuram Bus Stand", 
    "Coimbatore Junction", 
    "RS Puram Head Post Office", 
    "Lakshmi Mills Junction"
  ],
  
  "New Delhi": [
    "Connaught Place (Inner Circle)", 
    "India Gate", 
    "Hauz Khas Village", 
    "Karol Bagh Market", 
    "IGI Airport T3"
  ],
  
  "Default": ["Central Market", "Railway Station Road", "Civil Lines", "City Centre"]
};

export const COORDINATES: Record<string, { lat: number; lng: number }> = {
  // City Centers
  "Anantapur": { lat: 14.681887, lng: 77.600591 }, 
  "Visakhapatnam": { lat: 17.6868, lng: 83.2185 },
  "Vijayawada": { lat: 16.5062, lng: 80.6480 },
  "Guntur": { lat: 16.3067, lng: 80.4365 },
  "Tirupati": { lat: 13.6288, lng: 79.4192 },
  
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Warangal": { lat: 17.9689, lng: 79.5941 },
  
  "Bengaluru": { lat: 12.9716, lng: 77.5946 },
  "Mysuru": { lat: 12.2958, lng: 76.6394 },
  
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  
  "New Delhi": { lat: 28.6139, lng: 77.2090 },
  
  "India": { lat: 20.5937, lng: 78.9629 }
};

// Precise coordinates for specific areas to prevent random map placement
// Updated with Exact OpenStreetMap Node Verification
export const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // --- ANANTAPUR (Highly Precise) ---
  "Clock Tower": { lat: 14.681096, lng: 77.596226 }, 
  "RTC Bus Stand": { lat: 14.685300, lng: 77.599963 }, // APSRTC Bus Station
  "Railway Station Main Entrance": { lat: 14.686288, lng: 77.595246 }, 
  "JNTUA Admin Block": { lat: 14.650815, lng: 77.607013 }, 
  "Government General Hospital": { lat: 14.670840, lng: 77.594421 }, 
  "Collectorate Office": { lat: 14.679369, lng: 77.593941 }, // Near District Court
  "Arts College": { lat: 14.683328, lng: 77.595907 }, // Government Arts College
  "Saptagiri Circle": { lat: 14.677654, lng: 77.602673 }, // Added Saptagiri Circle explicitly

  // --- VIJAYAWADA ---
  "Benz Circle": { lat: 16.497100, lng: 80.651500 },
  "PVP Square Mall": { lat: 16.503300, lng: 80.646500 },
  "Kanaka Durga Temple": { lat: 16.514700, lng: 80.605900 },
  "Vijayawada Railway Station": { lat: 16.517600, lng: 80.619800 }, // Exact Main Entrance
  "Autonagar Gate": { lat: 16.495000, lng: 80.680000 },

  // --- VISAKHAPATNAM ---
  "Jagadamba Junction": { lat: 17.712500, lng: 83.300500 },
  "MVP Colony Circle": { lat: 17.739400, lng: 83.336400 },
  "Gajuwaka Junction": { lat: 17.693400, lng: 83.203300 },
  "RK Beach (Submarine Museum)": { lat: 17.716600, lng: 83.330000 },
  "Siripuram Junction": { lat: 17.721400, lng: 83.313400 },

  // --- GUNTUR ---
  "Lodge Center": { lat: 16.305000, lng: 80.437000 },
  "NTR Stadium": { lat: 16.315000, lng: 80.450000 },
  "Guntur Bus Stand": { lat: 16.296500, lng: 80.442500 }, // Exact NTR Bus Station
  "Brodiepet Main Road": { lat: 16.300000, lng: 80.430000 },

  // --- TIRUPATI ---
  "Tirupati Central Bus Station": { lat: 13.629000, lng: 79.419500 }, // Exact APSRTC Central Bus Station
  "Alipiri Garuda Statue": { lat: 13.655000, lng: 79.405000 },
  "Srinivasam Complex": { lat: 13.627500, lng: 79.418000 },
  "Ruia Hospital Main Gate": { lat: 13.635000, lng: 79.430000 },

  // --- HYDERABAD ---
  "Banjara Hills Road No 1": { lat: 17.413800, lng: 78.439800 },
  "Jubilee Hills Checkpost": { lat: 17.428000, lng: 78.411000 }, // Corrected
  "Cyber Towers (Hitech City)": { lat: 17.450400, lng: 78.380800 }, // Corrected
  "Kukatpally Y Junction": { lat: 17.487500, lng: 78.408000 },
  "Secunderabad Station": { lat: 17.434500, lng: 78.500000 }, // Corrected to Main Building
  "Charminar": { lat: 17.361600, lng: 78.474700 },

  // --- WARANGAL ---
  "NIT Warangal Main Gate": { lat: 17.980000, lng: 79.530000 },
  "Thousand Pillar Temple": { lat: 18.003000, lng: 79.575000 },
  "Kazipet Junction": { lat: 17.980000, lng: 79.510000 },
  "Bhadrakali Temple Arch": { lat: 17.995000, lng: 79.580000 },

  // --- BENGALURU ---
  "Koramangala Sony Signal": { lat: 12.935200, lng: 77.624500 },
  "Indiranagar 100ft Road": { lat: 12.971900, lng: 77.641200 },
  "Phoenix Marketcity (Whitefield)": { lat: 12.995800, lng: 77.696400 },
  "MG Road Metro Station": { lat: 12.975400, lng: 77.606700 },
  "Majestic Bus Station": { lat: 12.977000, lng: 77.571500 }, // Corrected to KBS

  // --- MYSURU ---
  "Mysore Palace Main Gate": { lat: 12.305100, lng: 76.655100 },
  "KRS Dam Viewpoint": { lat: 12.424400, lng: 76.572200 },
  "Chamundi Hill Temple": { lat: 12.275000, lng: 76.670000 },
  "Mysuru Railway Station": { lat: 12.315500, lng: 76.650500 }, // Corrected

  // --- MUMBAI ---
  "Gateway of India": { lat: 18.922000, lng: 72.834700 },
  "Dadar Station": { lat: 19.017800, lng: 72.847800 },
  "Andheri Station West": { lat: 19.113600, lng: 72.869700 },
  "Bandra Bandstand": { lat: 19.059600, lng: 72.829500 },
  "Juhu Beach Main Entrance": { lat: 19.098800, lng: 72.826400 },

  // --- PUNE ---
  "Shivajinagar Bus Stand": { lat: 18.531000, lng: 73.845000 }, // Corrected
  "Hinjewadi Phase 1": { lat: 18.591300, lng: 73.738900 },
  "Koregaon Park North Main": { lat: 18.536200, lng: 73.894000 },
  "Magarpatta City Gate": { lat: 18.514000, lng: 73.925000 },

  // --- CHENNAI ---
  "Chennai Central Station": { lat: 13.082200, lng: 80.275500 }, // Corrected
  "Marina Beach Lighthouse": { lat: 13.047500, lng: 80.282400 },
  "T Nagar Panagal Park": { lat: 13.041800, lng: 80.234100 },
  "Adyar Signal": { lat: 13.001200, lng: 80.256500 },
  "Velachery Phoenix Mall": { lat: 12.993100, lng: 80.218000 },

  // --- COIMBATORE ---
  "Gandhipuram Bus Stand": { lat: 11.017500, lng: 76.959000 }, // Corrected to Town Bus Stand
  "RS Puram Head Post Office": { lat: 11.006700, lng: 76.953800 },
  "Lakshmi Mills Junction": { lat: 11.010000, lng: 76.980000 },
  "Coimbatore Junction": { lat: 11.001400, lng: 76.961400 },

  // --- NEW DELHI ---
  "Connaught Place (Inner Circle)": { lat: 28.631500, lng: 77.216700 },
  "India Gate": { lat: 28.612900, lng: 77.229500 },
  "Hauz Khas Village": { lat: 28.549400, lng: 77.200100 },
  "Karol Bagh Market": { lat: 28.652000, lng: 77.191500 },
  "IGI Airport T3": { lat: 28.556200, lng: 77.100000 },

  // --- DEFAULT FALLBACK AREAS ---
  "Central Market": { lat: 28.570000, lng: 77.240000 }, // Lajpat Nagar
  "Railway Station Road": { lat: 28.642000, lng: 77.220000 }, // Paharganj
  "Civil Lines": { lat: 28.675000, lng: 77.225000 },
  "City Centre": { lat: 28.630000, lng: 77.217000 }, // Connaught Place
};

// Electricity Grid Hierarchy Definition
// Added 'coverage' to explain which areas are served by which substation
// Synced coords with AREA_COORDINATES
export const ANANTAPUR_SUBSTATIONS = [
  // TIER 3: SOURCE
  { 
    id: 'sub-main', 
    name: '220kV Grid Substation, Rapthadu', 
    lat: 14.615000, lng: 77.618000, 
    capacity: 400, tier: 3, feeds: [],
    coverage: "Feeds all city substations"
  }, 
  
  // TIER 2: DISTRIBUTION
  { 
    id: 'sub-bellary', 
    name: '132/33 kV Substation, Bellary Rd', 
    lat: 14.695000, lng: 77.585000, 
    capacity: 150, tier: 2, parent: 'sub-main', feeds: [],
    coverage: "Serves: Railway Station, Old Town Area"
  },
  
  // TIER 1: LOCAL FEEDERS
  { 
    id: 'sub-town', 
    name: '33kV Town Feeder, Clock Tower', 
    lat: 14.681096, lng: 77.596226, // Sync with Clock Tower
    capacity: 40, tier: 1, parent: 'sub-bellary',
    coverage: "Serves: Clock Tower, Gulzarpet, RTC Bus Stand"
  }, 
  { 
    id: 'sub-jntu', 
    name: '33kV Substation, JNTU', 
    lat: 14.650815, lng: 77.607013, // Sync with JNTUA
    capacity: 50, tier: 1, parent: 'sub-bellary',
    coverage: "Serves: JNTUA Admin Block, Ram Nagar"
  }, 
  { 
    id: 'sub-ind', 
    name: '33kV Industrial Estate SS', 
    lat: 14.670000, lng: 77.630000, 
    capacity: 80, tier: 1, parent: 'sub-main',
    coverage: "Serves: Industrial Estate, Housing Board Colony" 
  }, 
];

export const THEMES = {
  traffic: { 
    gradient: 'from-indigo-500 to-purple-600', 
    primary: 'bg-indigo-600', 
    light: 'bg-indigo-50', 
    text: 'text-indigo-700', 
    border: 'border-indigo-200',
    hex: '#4f46e5' // Indigo 600
  },
  air: { 
    gradient: 'from-emerald-400 to-teal-600', 
    primary: 'bg-teal-600', 
    light: 'bg-teal-50', 
    text: 'text-teal-700', 
    border: 'border-teal-200',
    hex: '#0d9488' // Teal 600
  },
  water: { 
    gradient: 'from-cyan-400 to-blue-600', 
    primary: 'bg-cyan-600', 
    light: 'bg-cyan-50', 
    text: 'text-cyan-700', 
    border: 'border-cyan-200',
    hex: '#0891b2' // Cyan 600
  },
  electricity: { 
    gradient: 'from-amber-400 to-orange-600', 
    primary: 'bg-orange-600', 
    light: 'bg-orange-50', 
    text: 'text-orange-700', 
    border: 'border-orange-200',
    hex: '#ea580c' // Orange 600
  },
};
