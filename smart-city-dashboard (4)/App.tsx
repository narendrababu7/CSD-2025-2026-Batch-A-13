
import React, { useState, useEffect } from 'react';
import { 
  Car, Wind, Droplets, Zap, Search, Navigation, 
  MapPin, Bell, User as UserIcon, LogOut, 
  AlertTriangle, ArrowRight, Table, BrainCircuit, Activity,
  PlayCircle, PauseCircle, Download, Radio, CheckCircle2, Wifi, WifiOff, X, Megaphone, Send, Shield, ShieldCheck, Lock, Info,
  Cpu, Power, RefreshCw
} from 'lucide-react';
import { INDIAN_LOCATIONS, COORDINATES, THEMES, CITY_AREAS, AREA_COORDINATES } from './constants';
import { User, LocationData, DashboardType, DashboardData, Alert } from './types';
import MapComponent from './components/MapComponent';
import { SmartChart } from './components/Charts';
import { getSmartAnalysis } from './services/gemini';
import { fetchDashboardData, fetchRoutePolyline } from './services/dataService';

// --- Sub Components ---

const StatCard: React.FC<{ data: any, theme: any }> = ({ data, theme }) => {
  return (
    <div className={`bg-white p-5 rounded-xl border ${theme.border} border-opacity-40 shadow-sm flex items-start justify-between hover:shadow-md transition-all group`}>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{data.title}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <h4 className={`text-3xl font-extrabold text-gray-800`}>{data.value}</h4>
          {data.unit && <span className="text-sm text-gray-400 font-medium">{data.unit}</span>}
        </div>
        <p className={`text-xs mt-2 font-semibold ${
          data.status === 'good' ? 'text-emerald-500' : 
          data.status === 'bad' ? 'text-red-500' : 'text-gray-400'
        }`}>
          {data.status === 'good' ? 'Optimal Range' : data.status === 'bad' ? 'Attention Needed' : 'Stable'}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${theme.light} ${theme.text} group-hover:scale-110 transition-transform`}>
        <data.icon size={24} />
      </div>
    </div>
  );
};

const AlertsTicker = ({ alerts }: { alerts: Alert[] }) => {
  if (alerts.length === 0) return null;
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-red-600 text-white p-1 rounded-md animate-pulse">
          <AlertTriangle size={16} />
        </div>
        <h3 className="font-bold text-red-800">Live System Alerts ({alerts.length})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {alerts.slice(0, 4).map((alert) => (
          <div key={alert.id} className={`bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow ${alert.type === 'danger' ? 'border-red-200 bg-red-50/50' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start">
              <div className="font-semibold text-gray-800 text-sm">{alert.location}</div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${alert.type === 'danger' ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'}`}>
                {alert.type === 'danger' ? 'Critical' : 'Moderate'}
              </span>
            </div>
            <div className="text-xs text-red-700 mt-1 font-medium">{alert.message}</div>
            <div className="text-xs text-gray-400 mt-2 text-right">{alert.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DataTable = ({ data, type }: { data: any[], type: DashboardType }) => {
  const headers = type === 'traffic' 
    ? ['City', 'Location', 'Density (%)', 'Speed (km/h)', 'Vehicles', 'Status']
    : type === 'electricity'
    ? ['City', 'Substation', 'Load (MW)', 'Capacity (MW)', 'Utilization', 'Status']
    : type === 'air'
    ? ['City', 'Station', 'AQI', 'PM2.5', 'PM10', 'Quality']
    : ['City', 'Source', 'pH Level', 'TDS', 'Turbidity', 'Safety'];

  const downloadCSV = () => {
    if (!data || data.length === 0) return;

    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => {
        // Handle potential commas in fields by wrapping in quotes
        return [
          row.city,
          `"${row.location}"`,
          row.param1,
          row.param2,
          row.param3,
          row.status
        ].join(',');
      })
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Table size={16} className="text-gray-500" />
          {type === 'traffic' ? 'Live Traffic Density' : type === 'electricity' ? 'Substation Load Report' : type === 'air' ? 'Air Quality Index' : 'Water Quality Report'}
          <span className="text-gray-400 font-normal text-sm">({data.length} nodes)</span>
        </h3>
        <button 
          onClick={downloadCSV}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-left text-sm relative">
          <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
            <tr>
              {headers.map((h, i) => <th key={i} className="px-6 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3 font-semibold text-gray-700">{row.city}</td>
                <td className="px-6 py-3 font-medium text-gray-800">{row.location}</td>
                <td className="px-6 py-3">{row.param1}</td>
                <td className="px-6 py-3">{row.param2}</td>
                <td className="px-6 py-3">{row.param3}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.status === 'Safe' || row.status === 'Good' ? 'bg-green-100 text-green-700' :
                    row.status === 'Moderate' || row.status === 'High' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Broadcast Modal Component ---
const BroadcastModal = ({ isOpen, onClose, onSend, city }: { isOpen: boolean, onClose: () => void, onSend: (msg: string, type: string) => void, city: string }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('traffic');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Radio className="animate-pulse" size={24} />
            <div>
              <h2 className="text-lg font-bold leading-none">Broadcast System</h2>
              <p className="text-red-100 text-xs mt-1">Command Center • {city}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex gap-3">
            <AlertTriangle className="text-red-600 shrink-0" size={20} />
            <p className="text-xs text-red-800">
              <strong>Important:</strong> This message will be transmitted to all active user dashboards, digital signage, and connected authorities in {city} immediately.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alert Category</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              <option value="traffic">Traffic Congestion</option>
              <option value="air">Air Quality Hazard</option>
              <option value="water">Water Contamination</option>
              <option value="electricity">Power Grid Failure</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Broadcast Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Flash Flood Warning in Sector 4. Evacuate immediately."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm h-32 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
          <button 
            onClick={() => { onSend(message, type); setMessage(''); onClose(); }}
            disabled={!message}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-red-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Megaphone size={16} /> Transmit Alert
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState<'admin' | 'user'>('user');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  // App State
  const [activeTab, setActiveTab] = useState<DashboardType>('traffic');
  const [location, setLocation] = useState<LocationData>({
    state: 'Andhra Pradesh',
    city: 'Anantapur',
    area: '',
    lat: COORDINATES['Anantapur'].lat,
    lng: COORDINATES['Anantapur'].lng
  });
  
  // Search
  const [selectedState, setSelectedState] = useState('Andhra Pradesh');
  const [selectedCity, setSelectedCity] = useState('Anantapur');
  const [currentAreas, setCurrentAreas] = useState<string[]>(CITY_AREAS['Anantapur']);
  const [searchArea, setSearchArea] = useState(CITY_AREAS['Anantapur'][0]);

  // Data State
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Broadcast State
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastAlerts, setBroadcastAlerts] = useState<Alert[]>([]);

  // Simulation
  const [simulationMode, setSimulationMode] = useState(false);

  // Route Planner
  const [showRoute, setShowRoute] = useState(true);
  const [routeSource, setRouteSource] = useState({ city: 'Anantapur', area: CITY_AREAS['Anantapur'][0] });
  const [routeDest, setRouteDest] = useState({ city: 'Anantapur', area: CITY_AREAS['Anantapur'][1] });
  const [route, setRoute] = useState<any>(null);

  // --- Logic ---

  const handleTabChange = (newTab: DashboardType) => {
    setActiveTab(newTab);
    // CRITICAL: Reset specific features when leaving Traffic tab
    if (newTab !== 'traffic') {
      setRoute(null);
      setShowRoute(true); // Reset to default state for next time
    }
  };

  useEffect(() => {
    // Update available areas when city changes
    const areas = CITY_AREAS[selectedCity] || CITY_AREAS['Default'];
    setCurrentAreas(areas);
    setSearchArea(areas[0]);
    // Reset route source/dest if outside
    setRouteSource(prev => ({ ...prev, city: selectedCity, area: areas[0] }));
    setRouteDest(prev => ({ ...prev, city: selectedCity, area: areas[1] || areas[0] }));
  }, [selectedCity]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password.length >= 8) {
      setUser({ 
        email, 
        name: isLogin ? (loginRole === 'admin' ? 'Administrator' : 'Citizen User') : name,
        role: loginRole 
      });
      setAuthError('');
    } else {
      setAuthError('Password must be at least 8 characters');
    }
  };

  const handleBroadcast = (msg: string, type: string) => {
    const newAlert: Alert = {
      id: `broadcast-${Date.now()}`,
      type: 'danger',
      message: `BROADCAST: ${msg}`,
      location: `${selectedCity} (City-wide)`,
      timestamp: new Date().toLocaleTimeString(),
      value: 'CRITICAL',
      category: type as DashboardType
    };
    setBroadcastAlerts(prev => [newAlert, ...prev]);
    alert(`Broadcast Sent Successfully to ${selectedCity} network.`);
  };

  const loadData = async () => {
    if (!simulationMode) setLoading(true);
    const result = await fetchDashboardData(activeTab, location.city, location.lat, location.lng, location.area);
    setData(result);
    setLoading(false);
    
    // AI Forecast (Simulated Call, debounce in real app)
    if (!simulationMode) {
      const analysis = await getSmartAnalysis(
        activeTab, 
        location.city, 
        `Current avg value: ${result.stats[0].value}. Critical alerts: ${result.alerts.length}`
      );
      setAiAnalysis(analysis);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [activeTab, location, user]);

  // Simulation Interval
  useEffect(() => {
    let interval: any;
    if (simulationMode && user) {
      interval = setInterval(loadData, 2000);
    }
    return () => clearInterval(interval);
  }, [simulationMode, user, activeTab, location]);

  const handleSearch = () => {
    const cityCoords = COORDINATES[selectedCity] || COORDINATES['India'];
    
    // Check if the specific search area has defined coordinates to focus the map there
    let targetLat = cityCoords.lat;
    let targetLng = cityCoords.lng;
    
    if (AREA_COORDINATES[searchArea]) {
      targetLat = AREA_COORDINATES[searchArea].lat;
      targetLng = AREA_COORDINATES[searchArea].lng;
    }

    setLocation({
      state: selectedState,
      city: selectedCity,
      area: searchArea,
      lat: targetLat,
      lng: targetLng
    });
    setRoute(null);
  };

  const handleRouteCalc = async () => {
    if (routeSource.area && routeDest.area) {
      let startLat, startLng, endLat, endLng;

      // 1. Get Exact Start Coordinates
      if (AREA_COORDINATES[routeSource.area]) {
        startLat = AREA_COORDINATES[routeSource.area].lat;
        startLng = AREA_COORDINATES[routeSource.area].lng;
      } else {
        // Fallback: Use exact city center (No Jitter)
        startLat = location.lat;
        startLng = location.lng;
      }

      // 2. Get Exact End Coordinates
      if (AREA_COORDINATES[routeDest.area]) {
        endLat = AREA_COORDINATES[routeDest.area].lat;
        endLng = AREA_COORDINATES[routeDest.area].lng;
      } else {
        // Fallback: Use exact city center (No Jitter)
        endLat = location.lat;
        endLng = location.lng;
      }

      const routeData = await fetchRoutePolyline(startLat, startLng, endLat, endLng);
      if (routeData) {
        setRoute(routeData);
      } else {
        alert("Route calculation failed (Offline or API Error).");
      }
    }
  };

  // Combine fetched alerts with manual broadcast alerts
  const displayAlerts = (data ? [...broadcastAlerts, ...data.alerts] : broadcastAlerts)
    .filter(alert => !alert.category || alert.category === activeTab);

  // --- Styles ---
  const theme = THEMES[activeTab];

  if (!user) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <Activity className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Smart City Dashboard</h1>
              <p className="text-gray-500 mt-2 text-sm">Select your access level</p>
            </div>
            
            {/* Role Toggle */}
            <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6">
              <button 
                onClick={() => setLoginRole('user')} 
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${loginRole === 'user' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <UserIcon size={16} /> User
              </button>
              <button 
                onClick={() => setLoginRole('admin')} 
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${loginRole === 'admin' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ShieldCheck size={16} /> Admin
              </button>
            </div>

            <div className="flex bg-gray-50 p-1 rounded-lg mb-6 border border-gray-100">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Login</button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Sign Up</button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={name} onChange={e => setName(e.target.value)} required />}
              <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
              
              {!isLogin && (
                <div className="text-xs grid grid-cols-2 gap-2 text-gray-400 pl-1">
                  <span className={password.length >= 8 ? 'text-green-600' : ''}>• Min 8 chars</span>
                  <span className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>• 1 Uppercase</span>
                  <span className={/[0-9]/.test(password) ? 'text-green-600' : ''}>• 1 Number</span>
                  <span className={/[!@#$%]/.test(password) ? 'text-green-600' : ''}>• 1 Symbol</span>
                </div>
              )}
              
              {authError && <div className="text-red-500 text-xs text-center">{authError}</div>}
              
              <button className={`w-full py-3 text-white font-semibold rounded-lg shadow-lg transition-all ${loginRole === 'admin' ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>
                {isLogin ? `Log In as ${loginRole === 'admin' ? 'Admin' : 'User'}` : 'Create Account'}
              </button>
            </form>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 relative">
      
      {/* Modals - Only Render for Admin */}
      {user.role === 'admin' && (
        <BroadcastModal 
          isOpen={showBroadcast} 
          onClose={() => setShowBroadcast(false)} 
          onSend={handleBroadcast}
          city={selectedCity}
        />
      )}

      {/* Network Status Toast */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-[100] bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up">
           <WifiOff size={20} />
           <div>
             <div className="font-bold text-sm">Offline Mode</div>
             <div className="text-xs text-red-100">Synchronizing when connection returns</div>
           </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${user.role === 'admin' ? 'bg-slate-800' : 'bg-indigo-600'} p-2 rounded-lg shadow-sm transition-colors`}>
              {user.role === 'admin' ? <Shield className="text-white" size={20} /> : <Activity className="text-white" size={20} />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">{user.role === 'admin' ? 'Admin' : 'User'} Smart City Dashboard</h1>
              <p className="text-xs text-gray-500">Real-time Urban Monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSimulationMode(!simulationMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${simulationMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
            >
              {simulationMode ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
              <span className="text-xs font-semibold">{simulationMode ? 'Simulation Active' : 'Start Simulation'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative"
              >
                <Bell size={20} />
                {displayAlerts.length > 0 && (
                   <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[60] overflow-hidden">
                   <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                     <span className="text-sm font-semibold text-gray-700">Notifications</span>
                     <span className="text-xs text-blue-600 cursor-pointer">Mark all read</span>
                   </div>
                   <div className="max-h-64 overflow-y-auto">
                     {displayAlerts.length === 0 ? (
                       <div className="p-6 text-center text-gray-400 text-sm">No new alerts</div>
                     ) : (
                       displayAlerts.map(alert => (
                         <div key={alert.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${alert.type === 'danger' ? 'bg-red-50' : ''}`}>
                           <div className="flex items-start gap-2">
                             <AlertTriangle size={14} className={`mt-0.5 flex-shrink-0 ${alert.type === 'danger' ? 'text-red-600' : 'text-orange-500'}`} />
                             <div>
                               <div className="text-sm text-gray-800 font-medium">{alert.message}</div>
                               <div className="text-xs text-gray-400 mt-1">{alert.timestamp} • {alert.location}</div>
                             </div>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} ${isOnline ? 'animate-pulse' : ''}`}></span>
              <span className={`text-xs font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>{isOnline ? 'System Online' : 'System Offline'}</span>
            </div>
            
            <div className="hidden md:flex flex-col items-end border-l pl-6 border-gray-200">
              <span className="text-sm font-semibold text-gray-700">{user.name}</span>
              <span className="text-xs text-gray-400 capitalize">{user.role} Account</span>
            </div>
            <button onClick={() => setUser(null)} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-500 transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'traffic', label: 'Traffic', icon: Car },
            { id: 'air', label: 'Air Quality', icon: Wind },
            { id: 'water', label: 'Water Quality', icon: Droplets },
            { id: 'electricity', label: 'Electricity', icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as DashboardType)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? `${theme.text} border-${theme.text.split('-')[1]}-600 font-bold bg-${theme.text.split('-')[1]}-50/50 px-4 rounded-t-lg` 
                : 'border-transparent text-gray-500 hover:text-gray-700 px-4'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Banner */}
        <div className={`rounded-xl p-6 mb-8 bg-gradient-to-r ${theme.gradient} border border-white/20 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 text-white`}>
           <div className="flex items-center gap-4">
             <div className={`p-3 rounded-full bg-white/20 backdrop-blur-sm shadow-inner border border-white/30`}>
               {activeTab === 'traffic' ? <Car size={28} /> : activeTab === 'air' ? <Wind size={28} /> : activeTab === 'water' ? <Droplets size={28} /> : <Zap size={28} />}
             </div>
             <div>
               <h2 className="text-2xl font-bold capitalize tracking-tight">{activeTab} Monitoring System</h2>
               <p className="text-white/80 text-sm font-medium">Real-time {activeTab} analytics and forecasting</p>
             </div>
           </div>
           
           <div className="flex gap-4 items-center">
             {/* Only Admin sees Broadcast */}
             {user.role === 'admin' && (
               <button 
                 onClick={() => setShowBroadcast(true)}
                 className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors text-sm font-semibold animate-pulse"
               >
                 <Radio size={16} /> Emergency Broadcast
               </button>
             )}
             <div className="text-right hidden md:block border-l pl-6 border-white/20">
               <div className="text-xs text-white/60 uppercase font-semibold">Last Updated</div>
               <div className="text-xl font-mono text-white font-bold">{new Date().toLocaleTimeString()}</div>
             </div>
           </div>
        </div>

        {/* Universal Search - Updated with Scrollable Area */}
        {activeTab !== 'electricity' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
               <div>
                 <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase">Select State</label>
                 <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedCity(INDIAN_LOCATIONS[e.target.value][0]); }}>
                   {Object.keys(INDIAN_LOCATIONS).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
               <div>
                 <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase">Select City</label>
                 <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}>
                   {INDIAN_LOCATIONS[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
               </div>
               <div>
                 <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase">Select Area/Locality</label>
                 <div className="relative">
                   <select 
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 appearance-none max-h-40 overflow-y-auto"
                    value={searchArea} 
                    onChange={e => setSearchArea(e.target.value)}
                   >
                     {currentAreas.map(area => <option key={area} value={area}>{area}</option>)}
                   </select>
                   <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                 </div>
               </div>
               <button onClick={handleSearch} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                 <Search size={18} /> Update View
               </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading || !data ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
            <Activity size={48} className="mb-4 text-gray-300" />
            <p>Fetching satellite data from ISRO servers...</p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
            
            {/* Alerts Ticker - Now includes Broadcast Alerts */}
            <AlertsTicker alerts={displayAlerts} />

            {/* AI Analysis Banner */}
            {aiAnalysis && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                 <BrainCircuit className="text-indigo-600 flex-shrink-0 mt-1" size={20} />
                 <div>
                   <h4 className="text-sm font-bold text-indigo-900 mb-1">AI Smart Insight</h4>
                   <p className="text-sm text-indigo-800 leading-relaxed">{aiAnalysis}</p>
                 </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.stats.map((stat, i) => (
                <StatCard key={i} data={stat} theme={theme} />
              ))}
            </div>

            {/* Charts & Map Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <SmartChart 
                 title={`24-Hour ${activeTab === 'traffic' ? 'Traffic Trend' : activeTab === 'air' ? 'Air Quality Trend' : activeTab === 'water' ? 'Water Quality Trend' : 'Grid Load Trend'}`} 
                 data={data.chartTrend} 
                 color={theme.hex} 
                 unit={activeTab === 'traffic' ? 'Density (%)' : activeTab === 'air' ? 'AQI' : activeTab === 'water' ? 'Quality Index' : 'Load (MW)'}
               />
               <SmartChart 
                 title={`${activeTab === 'traffic' ? 'Congestion' : 'Distribution'} by Area`} 
                 data={data.chartDistribution} 
                 color={theme.hex} 
                 type="bar"
                 unit={activeTab === 'traffic' ? 'Density (%)' : activeTab === 'air' ? 'AQI' : activeTab === 'water' ? 'TDS Level' : 'Load (MW)'}
               />
            </div>

            {/* Detailed Map Section */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200">
               <div className="p-4 flex flex-col md:flex-row justify-between items-center border-b border-gray-100 mb-1 gap-4">
                 <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                   <MapPin size={18} /> {activeTab === 'traffic' ? 'Traffic Congestion Map' : 'Sensor Network Map'}
                   <span className="text-xs font-normal text-gray-400">({activeTab === 'electricity' ? 'Anantapur Grid' : selectedCity})</span>
                 </h3>
                 
                 {/* Only User sees Route Planner */}
                 {activeTab === 'traffic' && user.role === 'user' && (
                    <div className="flex gap-2">
                      <button onClick={() => setShowRoute(!showRoute)} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md font-medium hover:bg-indigo-100 transition-colors">
                        {showRoute ? 'Hide Planner' : 'Show Route Planner'}
                      </button>
                    </div>
                 )}
               </div>
               
               {/* Only User sees Route Planner UI */}
               {activeTab === 'traffic' && showRoute && user.role === 'user' && (
                 <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 animate-in slide-in-from-top-2">
                    <h4 className="text-xs font-bold text-indigo-800 uppercase mb-3">Intelligent Route Planner (OSRM Powered)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                       {/* Source */}
                       <div className="lg:col-span-2">
                          <label className="text-[10px] uppercase text-gray-500 font-bold">Source</label>
                          <div className="flex gap-2 mt-1">
                             <select className="w-1/2 p-2 text-sm border rounded bg-white" value={routeSource.city} onChange={e => setRouteSource({...routeSource, city: e.target.value})}>
                                {INDIAN_LOCATIONS[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                             <select className="w-1/2 p-2 text-sm border rounded bg-white" value={routeSource.area} onChange={e => setRouteSource({...routeSource, area: e.target.value})}>
                                {currentAreas.map(a => <option key={a} value={a}>{a}</option>)}
                             </select>
                          </div>
                       </div>
                       
                       {/* Destination */}
                       <div className="lg:col-span-2">
                          <label className="text-[10px] uppercase text-gray-500 font-bold">Destination</label>
                          <div className="flex gap-2 mt-1">
                             <select className="w-1/2 p-2 text-sm border rounded bg-white" value={routeDest.city} onChange={e => setRouteDest({...routeDest, city: e.target.value})}>
                                {INDIAN_LOCATIONS[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                             <select className="w-1/2 p-2 text-sm border rounded bg-white" value={routeDest.area} onChange={e => setRouteDest({...routeDest, area: e.target.value})}>
                                {currentAreas.map(a => <option key={a} value={a}>{a}</option>)}
                             </select>
                          </div>
                       </div>

                       <button onClick={handleRouteCalc} className="h-9 bg-indigo-600 text-white text-sm rounded font-medium hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2">
                         <Navigation size={14} /> Find Route
                       </button>
                    </div>
                 </div>
               )}

               <div className="h-[500px] w-full relative z-0">
                 <MapComponent 
                    location={location} 
                    markers={data.markers} 
                    route={activeTab === 'traffic' ? route : null} 
                    type={activeTab} 
                  />
               </div>
            </div>

            {/* Data Table */}
            <DataTable data={data.tableData} type={activeTab} />

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
           
        </div>
      </footer>
    </div>
  );
}
