'use client';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import io from 'socket.io-client';
import { useAppStore } from '@/store';
import Link from 'next/link';

export default function Dashboard() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const addTelemetry = useAppStore(state => state.addTelemetry);


  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-58.3816, -34.6037],
      zoom: 13,
      attributionControl: false
    });

    // Ruta real por calles de Buenos Aires:
    // Av. 9 de Julio → Corrientes → Leandro N. Alem → Libertador → Pueyrredón
    const route: [number, number][] = [
      [-58.3816, -34.6037], // Obelisco
      [-58.3816, -34.6010], // 9 de Julio hacia el norte
      [-58.3816, -34.5985],
      [-58.3830, -34.5975], // Giro hacia Corrientes
      [-58.3855, -34.5975], // Corrientes hacia el oeste
      [-58.3880, -34.5975],
      [-58.3905, -34.5975],
      [-58.3905, -34.5960], // Giro norte
      [-58.3905, -34.5940],
      [-58.3880, -34.5930], // Giro hacia Libertador
      [-58.3855, -34.5920],
      [-58.3830, -34.5915],
      [-58.3800, -34.5910], // Av. del Libertador
      [-58.3770, -34.5905],
      [-58.3750, -34.5910], // Giro sur
      [-58.3750, -34.5935],
      [-58.3760, -34.5960], // Pueyrredón bajando
      [-58.3780, -34.5985],
      [-58.3800, -34.6010],
      [-58.3816, -34.6037], // Vuelta al Obelisco
    ];

    // Inyectar estilos del marcador
    if (!document.getElementById('vehicle-marker-styles')) {
      const style = document.createElement('style');
      style.id = 'vehicle-marker-styles';
      style.textContent = `
        @keyframes vehiclePulse {
          0%   { box-shadow: 0 0 0 0 rgba(56,189,248,0.8); }
          70%  { box-shadow: 0 0 0 10px rgba(56,189,248,0); }
          100% { box-shadow: 0 0 0 0 rgba(56,189,248,0); }
        }
      `;
      document.head.appendChild(style);
    }

    const markerEl = document.createElement('div');
    Object.assign(markerEl.style, {
      width: '18px', height: '18px',
      backgroundColor: '#38BDF8',
      borderRadius: '50%',
      border: '3px solid #fff',
      cursor: 'pointer',
      animation: 'vehiclePulse 1.5s ease-in-out infinite',
    });

    const marker = new maplibregl.Marker({ element: markerEl })
      .setLngLat(route[0])
      .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML('<b>VEH-001</b><br/>Activo · 58 km/h'))
      .addTo(map.current!);

    // Animación suave entre waypoints
    let currentIdx = 0;
    let progress = 0; // 0..1 entre punto actual y siguiente
    const STEP = 0.005; // velocidad de avance

    const animate = () => {
      progress += STEP;
      if (progress >= 1) {
        progress = 0;
        currentIdx = (currentIdx + 1) % route.length;
      }
      const from = route[currentIdx];
      const to = route[(currentIdx + 1) % route.length];
      const lng = from[0] + (to[0] - from[0]) * progress;
      const lat = from[1] + (to[1] - from[1]) * progress;
      marker.setLngLat([lng, lat]);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    map.current.on('load', () => {
      animFrameRef.current = requestAnimationFrame(animate);
    });

    // WebSockets
    const socket = io('http://localhost:3000', {
      auth: { token: 'mock-jwt-token' }
    });
    socket.on('telemetry_update', (data) => { addTelemetry(data); });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      socket.disconnect();
    };
  }, [addTelemetry]);


  return (
    <div className="flex h-screen bg-background" id="dashboard-layout">
      {/* Sidebar dinámico */}
      <aside className="w-64 glass border-r border-gray-800 flex flex-col justify-between" id="app-sidebar">
        <div className="p-6">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-8">SentinAI SOC</h2>
          <nav className="space-y-4">
            <Link href="/dashboard" className="block text-primary font-medium hover:text-white transition-colors" id="nav-outdoor">
              Flotas Outdoor
            </Link>
            <Link href="#indoor" className="block text-gray-400 hover:text-primary transition-colors" id="nav-indoor">
              Locales Indoor (SVG)
            </Link>
          </nav>
        </div>
        <div className="p-6">
          <Link href="/billing" className="block text-gray-400 hover:text-accent font-medium transition-colors" id="nav-billing">
            Facturación y Pagos
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 flex flex-col space-y-6 overflow-y-auto" id="dashboard-content">
        <header className="flex justify-between items-center bg-surface p-4 rounded-xl border border-gray-800 shadow-lg">
          <h1 className="text-2xl font-bold" id="dashboard-title">Monitoreo Global en Tiempo Real</h1>
          <span className="flex items-center space-x-2 text-brand text-sm">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse"></span>
            <span>Sistema WebSockets Activo</span>
          </span>
        </header>

        {/* Sección de Mapas Interagibles */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Componente MapLibre Outdoor */}
          <div className="glass rounded-xl p-4 flex flex-col shadow-xl" id="outdoor-map-card">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Tracking GPS Flotas Terrestres</h3>
            <div ref={mapContainer} style={{ height: '450px' }} className="map-container border border-gray-700 hover:border-primary transition-colors rounded-lg" id="maplibre-container" />
          </div>

          {/* Componente Plano Indoor (React SVG) */}
          <div className="glass rounded-xl p-4 flex flex-col shadow-xl" id="indoor-map-card">
            <h3 className="text-lg font-medium text-gray-300 mb-4">Matriz Indoor de Seguridad</h3>
            <div className="flex-1 bg-surface rounded-lg flex items-center justify-center p-4 border border-gray-800 relative group overflow-hidden">
               {/* Plano SVG Interactivo e Iluminado */}
               <svg viewBox="0 0 800 600" className="w-full h-full" id="svg-floorplan">
                 <rect x="50" y="50" width="700" height="500" fill="none" stroke="#334155" strokeWidth="4" rx="10" />
                 
                 {/* Habitación: Recepción (Hoverable) */}
                 <rect x="50" y="50" width="300" height="250" fill="#1E293B" className="hover:fill-surface cursor-pointer transition-colors" id="room-reception" />
                 <text x="200" y="185" fill="#94A3B8" textAnchor="middle" className="font-semibold text-xl">Recepción</text>
                 {/* Nodo Sensor Interactivo Blue */}
                 <circle cx="280" cy="100" r="12" fill="#38BDF8" className="animate-pulse cursor-pointer hover:fill-accent transition-colors" id="sensor-reception" />
                 
                 {/* Habitación: Almacén Principal */}
                 <rect x="450" y="50" width="300" height="500" fill="#0F172A" className="hover:fill-surface cursor-pointer transition-colors" id="room-warehouse" />
                 <text x="600" y="300" fill="#94A3B8" textAnchor="middle" className="font-semibold text-xl">Almacén Seguro</text>
                 {/* Nodo Sensor Crítico (Animación Rosa/Rojo) */}
                 <circle cx="650" cy="450" r="14" fill="#F472B6" className="animate-pulse cursor-pointer hover:r-16 hover:opacity-80 transition-all duration-300" id="sensor-warehouse" />
               </svg>

               <div className="absolute bottom-4 right-4 bg-background/80 px-3 py-1 rounded text-xs text-brand border border-brand/50 font-bold tracking-widest">
                 RAG AGENT: ALERT
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
