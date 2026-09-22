export const demoStatus = 'Demo Mode';

export const predictions = {
  current: { label: 'Moderate', score: 58, color: 'amber' },
  windows: [
    { label: 'Next 30 min', pressure: 'High', score: 76, delta: '+18 pressure points' },
    { label: 'Next 1 hour', pressure: 'High', score: 82, delta: '+24 pressure points' },
    { label: 'Next 2 hours', pressure: 'Moderate', score: 64, delta: 'Recovery expected' }
  ],
  trend: [42, 48, 51, 58, 63, 76, 82, 78, 70, 64],
  hotspots: [
    { name: 'Knowledge Park II', current: 'High', predicted: 'Critical', time: '18 min', action: 'Divert through Alpha 1' },
    { name: 'Pari Chowk', current: 'Moderate', predicted: 'High', time: '32 min', action: 'Meter incoming traffic' },
    { name: 'Kasna Junction', current: 'Critical', predicted: 'High', time: 'Now', action: 'Keep alternate corridor open' }
  ]
};

export const deliveries = [
  { id: 'DL-201', area: 'Gaur City', priority: 'High', distance: 8.4, window: '10:00-12:00', lat: 28.6044, lng: 77.4378 },
  { id: 'DL-202', area: 'Techzone 4', priority: 'Medium', distance: 5.2, window: '10:00-14:00', lat: 28.5891, lng: 77.4053 },
  { id: 'DL-203', area: 'Pari Chowk', priority: 'High', distance: 6.1, window: '12:00-15:00', lat: 28.4652, lng: 77.5088 },
  { id: 'DL-204', area: 'Alpha 1', priority: 'Low', distance: 3.8, window: '12:00-16:00', lat: 28.4685, lng: 77.5057 },
  { id: 'DL-205', area: 'Knowledge Park II', priority: 'Critical', distance: 7.4, window: '09:00-11:00', lat: 28.4742, lng: 77.4831 },
  { id: 'DL-206', area: 'Sector 18', priority: 'Medium', distance: 12.3, window: '14:00-18:00', lat: 28.5708, lng: 77.3219 },
  { id: 'DL-207', area: 'Kasna', priority: 'High', distance: 9.5, window: '10:00-13:00', lat: 28.4312, lng: 77.5171 },
  { id: 'DL-208', area: 'Surajpur', priority: 'Low', distance: 6.8, window: '15:00-18:00', lat: 28.4931, lng: 77.5112 },
  { id: 'DL-209', area: 'Noida Sector 18', priority: 'Medium', distance: 13.1, window: '11:00-15:00', lat: 28.5708, lng: 77.3219 },
  { id: 'DL-210', area: 'Dadri', priority: 'Low', distance: 15.2, window: '16:00-19:00', lat: 28.5526, lng: 77.5540 },
  { id: 'DL-211', area: 'Gaur City', priority: 'Medium', distance: 7.9, window: '10:00-14:00', lat: 28.6044, lng: 77.4378 },
  { id: 'DL-212', area: 'Techzone 4', priority: 'High', distance: 5.7, window: '13:00-16:00', lat: 28.5891, lng: 77.4053 }
];

export const transit = [
  { mode: 'Bus', route: '101', from: 'Pari Chowk', next: 'Alpha 1', eta: 6, crowding: 'Moderate', status: 'On time' },
  { mode: 'Bus', route: '214', from: 'Gaur City', next: 'Noida Sector 18', eta: 11, crowding: 'Low', status: 'On time' },
  { mode: 'Metro', route: 'Blue Line', from: 'Noida Sector 18', next: 'Botanical Garden', eta: 4, crowding: 'High', status: '2 min delay' },
  { mode: 'Metro', route: 'Aqua Line', from: 'Knowledge Park II', next: 'Pari Chowk', eta: 8, crowding: 'Moderate', status: 'On time' }
];

export const emergencyCorridors = [
  { name: 'Pari Chowk -> Kailash Hospital', junctions: ['Pari Chowk', 'Alpha 1', 'Knowledge Park II'], response: 14, diversion: 'Use Surajpur Road for regular traffic' },
  { name: 'Kasna -> Yatharth Hospital', junctions: ['Kasna', 'Ecotech', 'Surajpur'], response: 18, diversion: 'Hold traffic at Kasna entry for 90 seconds' },
  { name: 'Gaur City -> Fortis Noida', junctions: ['Gaur City', 'Techzone 4', 'Sector 18'], response: 26, diversion: 'Route commercial traffic via Noida Extension' }
];

export const alertSeed = [
  { type: 'AI Prediction', severity: 'High', location: 'Knowledge Park II', text: 'Critical pressure predicted within 18 minutes.', time: '2 min ago' },
  { type: 'Traffic', severity: 'High', location: 'Pari Chowk', text: 'Average speed has fallen below the pilot threshold.', time: '8 min ago' },
  { type: 'Logistics', severity: 'Medium', location: 'Gaur City', text: 'Delivery demand is concentrated in two nearby zones.', time: '14 min ago' },
  { type: 'Transit', severity: 'Low', location: 'Blue Line', text: 'Two-minute simulated delay at Botanical Garden.', time: '19 min ago' }
];

export const clusterDeliveries = orders => {
  const groups = new Map();
  orders.forEach(order => {
    const key = order.area.toLowerCase().replace(/\s+(ii|1|2|4)$/i, '').trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(order);
  });
  return [...groups.values()].map((items, index) => ({ id: `TRIP-${index + 1}`, area: items[0].area, orders: items, distance: Number(items.reduce((sum, item) => sum + item.distance, 0).toFixed(1)), priority: items.some(item => item.priority === 'Critical') ? 'Critical' : items.some(item => item.priority === 'High') ? 'High' : 'Standard' }));
};

export const routeOptions = (origin, destination, mode) => {
  const seed = `${origin}|${destination}|${mode}`.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const base = 12 + (seed % 29);
  const multiplier = mode === 'Bike' ? 1.18 : mode === 'Walk' ? 1.55 : mode === 'EV' ? 0.96 : 1;
  return [
    { name: 'Green Corridor', distance: Number((base * multiplier / 2).toFixed(1)), minutes: Math.round(base * multiplier * 1.5), pressure: 'Low', congestion: 'Light', recommended: true },
    { name: 'Central Connector', distance: Number((base * multiplier / 2 - 1.4).toFixed(1)), minutes: Math.round(base * multiplier * 1.35), pressure: 'Moderate', congestion: 'Steady', recommended: false },
    { name: 'Express Link', distance: Number((base * multiplier / 2 + 2.8).toFixed(1)), minutes: Math.round(base * multiplier * 1.2), pressure: 'High', congestion: 'Heavy', recommended: false }
  ];
};
