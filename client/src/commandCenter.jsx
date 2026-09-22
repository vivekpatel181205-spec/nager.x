function RoleLanding({ role, data, setView }) {
  const authority = role === "Authority";
  return (
    <>
      <PageHead
        eyebrow={
          authority
            ? "AUTHORITY COMMAND / RESPONSE OPERATIONS"
            : "LOGISTICS COMMAND / FLEET OPERATIONS"
        }
        title={
          authority
            ? "Coordinate the city response."
            : "Move every delivery with intent."
        }
        copy={
          authority
            ? "Prioritize incidents, monitor pressure and coordinate the next response."
            : "Balance route pressure, delivery demand and fleet decisions from one operating view."
        }
        action={<span className="role-pill">{role} access</span>}
      />
      <div className="metrics four">
        <Metric
          icon={authority ? AlertTriangle : Truck}
          label={authority ? "Open incidents" : "Delivery load"}
          value={
            authority
              ? data.incidents.filter((item) => item.status !== "Resolved")
                  .length
              : "Moderate"
          }
          note={authority ? "Response queue" : "Priority zones"}
          tone="coral"
        />
        <Metric
          icon={Activity}
          label="Network pressure"
          value="High"
          note="Knowledge Park II"
          tone="gold"
        />
        <Metric
          icon={ShieldCheck}
          label={authority ? "Response status" : "Fleet status"}
          value={authority ? "Watch" : "Connected"}
          note="Local operations view"
          tone="teal"
        />
        <Metric
          icon={Route}
          label="Planned routes"
          value={data.routes.length}
          note="Saved route plans"
          tone="blue"
        />
      </div>
      <div className="content-grid">
        <Panel
          eyebrow={authority ? "RESPONSE QUEUE" : "FLEET PRIORITIES"}
          title={authority ? "Incidents needing attention" : "Route priorities"}
        >
          <IncidentRows incidents={data.incidents.slice(0, 6)} />
        </Panel>
        <Panel eyebrow="CITY BRAIN SIGNAL" title="Recommended action">
          <div className="brief-stack">
            <div>
              <span className="brief-label predicted">PREDICTED PRESSURE</span>
              <strong>High pressure in 30 minutes</strong>
              <small>
                Knowledge Park II and Pari Chowk require active monitoring.
              </small>
            </div>
            <div>
              <span className="brief-label action">RECOMMENDED ACTION</span>
              <strong>
                {authority
                  ? "Stage the alternate corridor"
                  : "Cluster priority deliveries"}
              </strong>
              <small>
                Open the relevant NagarX module to continue the workflow.
              </small>
            </div>
          </div>
          <button
            className="secondary"
            onClick={() => setView(authority ? "incidents" : "delivery")}
          >
            {authority ? "Open incident queue" : "Open Smart Delivery"}{" "}
            <ArrowIcon />
          </button>
        </Panel>
      </div>
    </>
  );
}
import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Car,
  CheckCircle2,
  CircleUserRound,
  Compass,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Route,
  ShieldCheck,
  Truck,
  Bus,
  BrainCircuit,
  Siren,
  X,
} from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const API = import.meta.env.VITE_API_URL || "/api";
const authStorage = window.sessionStorage;
const demoAccounts = {
  Citizen: ["citizen@nagerx.demo", "citizen123"],
  Authority: ["authority@nagerx.demo", "authority123"],
  Logistics: ["logistics@nagerx.demo", "logistics123"],
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authStorage.nagerxToken
        ? { Authorization: `Bearer ${authStorage.nagerxToken}` }
        : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (response.status === 401) {
    authStorage.removeItem("nagerxToken");
    throw new Error("Session expired. Please sign in again.");
  }
  if (!response.ok)
    throw new Error(payload?.error || `Request failed (${response.status})`);
  return payload;
};

const navItems = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["brain", "AI City Brain", BrainCircuit],
  ["traffic", "Traffic", Activity],
  ["routes", "Dynamic Routes", Route],
  ["delivery", "Smart Delivery", Truck],
  ["transit", "Live Transit", Bus],
  ["emergency", "Emergency", Siren],
  ["incidents", "Incidents", AlertTriangle],
  ["analytics", "Analytics", BarChart3],
];
const trafficSeed = [
  {
    name: "Knowledge Park II",
    pressure: 88,
    current: "Critical",
    forecast: "Critical",
    action: "Stage alternate corridor",
    latitude: 28.4742,
    longitude: 77.4831,
  },
  {
    name: "Pari Chowk",
    pressure: 72,
    current: "High",
    forecast: "High",
    action: "Hold non-essential trips",
    latitude: 28.4652,
    longitude: 77.5088,
  },
  {
    name: "Sector 18",
    pressure: 54,
    current: "Moderate",
    forecast: "High",
    action: "Recommend off-peak departure",
    latitude: 28.5708,
    longitude: 77.3219,
  },
  {
    name: "Gaur City",
    pressure: 32,
    current: "Low",
    forecast: "Moderate",
    action: "Monitor school-hour demand",
    latitude: 28.6044,
    longitude: 77.4378,
  },
];
const transitSeed = [
  {
    mode: "Bus",
    route: "101",
    next: "Pari Chowk",
    eta: 6,
    crowding: "Moderate",
    status: "On schedule",
  },
  {
    mode: "Bus",
    route: "203",
    next: "Knowledge Park II",
    eta: 11,
    crowding: "Low",
    status: "On schedule",
  },
  {
    mode: "Metro",
    route: "Blue Line",
    next: "Noida Sector 18",
    eta: 4,
    crowding: "High",
    status: "Minor delay",
  },
  {
    mode: "Metro",
    route: "Aqua Line",
    next: "Alpha 1",
    eta: 8,
    crowding: "Moderate",
    status: "On schedule",
  },
];
const deliverySeed = [
  ["NX-D01", "Gaur City", "High", 8.4],
  ["NX-D02", "Techzone 4", "Medium", 12.1],
  ["NX-D03", "Sector 18", "High", 15.8],
  ["NX-D04", "Pari Chowk", "Low", 5.2],
  ["NX-D05", "Knowledge Park II", "Critical", 9.7],
  ["NX-D06", "Alpha 1", "Medium", 6.6],
  ["NX-D07", "Kasna", "High", 10.4],
  ["NX-D08", "Gaur City", "Low", 7.1],
  ["NX-D09", "Techzone 4", "Medium", 13.2],
  ["NX-D10", "Pari Chowk", "Low", 4.8],
  ["NX-D11", "Sector 18", "High", 17.5],
  ["NX-D12", "Alpha 1", "Medium", 7.8],
].map(([id, location, priority, distance]) => ({
  id,
  location,
  priority,
  distance,
}));

function DemoBadge() {
  return null;
}
function PageHead({ eyebrow, title, copy, action }) {
  return (
    <div className="page-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{copy}</p>
      </div>
      {action}
    </div>
  );
}
function Metric({ icon: Icon, label, value, note, tone = "teal" }) {
  return (
    <div className="metric">
      <div className={`metric-icon ${tone}`}>
        <Icon size={18} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}
function Panel({ title, eyebrow, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: demoAccounts.Citizen[0],
    password: demoAccounts.Citizen[1],
  });
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      authStorage.nagerxToken = data.token;
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <main className="login-shell">
      <section className="login-art">
        <div className="brand-mark">NX</div>
        <p className="eyebrow">SIH26205 / TRANSPORTATION & LOGISTICS</p>
        <h1>
          NagarX
          <br />
          <em>City Brain.</em>
        </h1>
        <p className="login-copy">
          A unified prototype for traffic, transit, incidents and intelligent
          delivery operations.
        </p>
        <div className="signal-grid">
          <span>Predict pressure</span>
          <span>Route smarter</span>
          <span>Respond faster</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-inner">
          <div className="mobile-brand">
            <span className="brand-mark small">NX</span>
            <strong>NagarX</strong>
          </div>
          <DemoBadge />
          <p className="eyebrow">CITY COMMAND CENTER</p>
          <h2>Enter the mobility hub</h2>
          <p className="muted">
            Use a demo account to explore the integrated workflow.
          </p>
          <form onSubmit={submit} className="compact-form">
            <label>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button className="primary full">Sign in to City Brain</button>
          </form>
          <div className="demo-account-list">
            {Object.entries(demoAccounts).map(([role, [email, password]]) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ email, password })}
              >
                <strong>{role}</strong>
                <small>{email}</small>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
function MapView({ incidents, traffic }) {
  const points = [
    ...incidents.map((item) => ({ ...item, kind: "Incident" })),
    ...traffic.map((item) => ({
      ...item,
      kind: "Traffic",
      location: item.location || item.name,
      latitude: item.latitude,
      longitude: item.longitude,
    })),
  ];
  return (
    <div className="map-wrap">
      <MapContainer center={[28.49, 77.48]} zoom={11} scrollWheelZoom>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((point) => (
          <Marker
            key={`${point.kind}-${point.id || point.location}`}
            position={[point.latitude, point.longitude]}
          >
            <Popup>
              <strong>{point.location}</strong>
              <br />
              {point.kind} ·{" "}
              {point.severity || point.congestion_level || point.current}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-key">
        <span>
          <i className="dot critical" /> Critical
        </span>
        <span>
          <i className="dot high" /> High
        </span>
        <span>
          <i className="dot low" /> Monitored
        </span>
      </div>
    </div>
  );
}
function Dashboard({ data, setView }) {
  const open = data.incidents.filter(
    (item) => item.status !== "Resolved",
  ).length;
  const hotspots = trafficSeed.filter((item) => item.pressure > 70).length;
  return (
    <>
      <PageHead
        eyebrow="CITY COMMAND / DEMO SIMULATION"
        title="See the city before it slows down."
        copy="Current situation, predicted pressure and the next recommended action in one view."
        action={<DemoBadge />}
      />
      <div className="metrics four">
        <Metric
          icon={Activity}
          label="Current congestion"
          value="Moderate"
          note="Local traffic snapshot"
          tone="gold"
        />
        <Metric
          icon={AlertTriangle}
          label="Open incidents"
          value={open}
          note="Requires attention"
          tone="coral"
        />
        <Metric
          icon={MapPin}
          label="Traffic hotspots"
          value={hotspots}
          note="Pilot pressure zones"
          tone="blue"
        />
        <Metric
          icon={Route}
          label="Active routes"
          value={data.routes.length}
          note="Saved route plans"
          tone="teal"
        />
      </div>
      <div className="command-grid">
        <Panel
          eyebrow="CITY BRAIN BRIEF"
          title="Current / predicted / action"
          className="brief-panel"
        >
          <div className="brief-stack">
            <div>
              <span className="brief-label">CURRENT</span>
              <strong>Moderate congestion</strong>
              <small>
                Knowledge Park and Pari Chowk are carrying the highest local
                pressure.
              </small>
            </div>
            <div>
              <span className="brief-label predicted">PREDICTED · +30 MIN</span>
              <strong>High pressure near Sector 18</strong>
              <small>
                Illustrative forecast based on seeded traffic observations.
              </small>
            </div>
            <div>
              <span className="brief-label action">RECOMMENDED ACTION</span>
              <strong>Redirect discretionary traffic</strong>
              <small>
                Use alternate corridors and monitor the two critical hotspots.
              </small>
            </div>
          </div>
          <button className="secondary" onClick={() => setView("brain")}>
            Open AI City Brain <ArrowIcon />
          </button>
        </Panel>
        <Panel eyebrow="RECENT ALERTS" title="Signals to watch">
          <div className="alert-list">
            {data.alerts.slice(0, 4).map((alert) => (
              <div className="alert-item" key={alert.id}>
                <AlertTriangle size={17} />
                <div>
                  <strong>{alert.title}</strong>
                  <small>{alert.message}</small>
                </div>
                <span>{alert.type}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="content-grid">
        <Panel eyebrow="NETWORK MONITOR" title="City map">
          <MapView incidents={data.incidents} traffic={data.traffic} />
        </Panel>
        <Panel eyebrow="RESPONSE QUEUE" title="Priority incidents">
          <IncidentRows incidents={data.incidents.slice(0, 5)} />
        </Panel>
      </div>
    </>
  );
}
function ArrowIcon() {
  return <span aria-hidden="true">-&gt;</span>;
}
function IncidentRows({ incidents }) {
  return (
    <div className="incident-list">
      {incidents.length ? (
        incidents.map((item) => (
          <div className="incident-row" key={item.id}>
            <div>
              <strong>{item.type}</strong>
              <small>{item.location}</small>
            </div>
            <span className={`tag tag-${item.severity.toLowerCase()}`}>
              {item.severity}
            </span>
          </div>
        ))
      ) : (
        <div className="empty-state">No incidents in the current view.</div>
      )}
    </div>
  );
}
function Brain({ traffic }) {
  return (
    <>
      <PageHead
        eyebrow="AI CITY BRAIN / PILOT SIMULATION"
        title="Predict pressure. Explain the action."
        copy="A deterministic local prediction engine for the hackathon demo. It is not a trained production ML model."
        action={<DemoBadge />}
      />
      <div className="metrics four">
        <Metric
          icon={BrainCircuit}
          label="Traffic pressure"
          value="High"
          note="Illustrative next 30 min"
          tone="coral"
        />
        <Metric
          icon={Truck}
          label="Logistics load"
          value="Moderate"
          note="Seeded demand signal"
          tone="gold"
        />
        <Metric
          icon={Activity}
          label="Demand forecast"
          value="+18%"
          note="Pilot scenario"
          tone="blue"
        />
        <Metric
          icon={ShieldCheck}
          label="Risk level"
          value="Watch"
          note="No live control"
          tone="teal"
        />
      </div>
      <Panel eyebrow="FORECAST HORIZON" title="Pressure by hotspot">
        <div className="forecast-grid">
          {traffic.map((item) => (
            <div className="forecast-card" key={item.name}>
              <div className="forecast-top">
                <strong>{item.name}</strong>
                <span
                  className={`pressure pressure-${item.current.toLowerCase()}`}
                >
                  {item.current}
                </span>
              </div>
              <div className="pressure-bar">
                <i style={{ width: `${item.pressure}%` }} />
              </div>
              <div className="forecast-meta">
                <span>Now {item.pressure}%</span>
                <span>+30m {item.forecast}</span>
              </div>
              <small>Action: {item.action}</small>
            </div>
          ))}
        </div>
      </Panel>
      <div className="content-grid">
        <Panel eyebrow="MODEL NOTE" title="Transparent by design">
          <p className="panel-copy">
            The PPT proposes LSTM/XGBoost forecasting. This prototype uses
            stable seeded rules so the demo is repeatable and does not claim
            model accuracy.
          </p>
        </Panel>
        <Panel eyebrow="DECISION FEED" title="Recommended actions">
          <div className="signal-list">
            <div>
              <span>Traffic diversion</span>
              <strong>Prepare alternate corridor</strong>
            </div>
            <div>
              <span>Demand response</span>
              <strong>Stage extra transit capacity</strong>
            </div>
            <div>
              <span>Logistics</span>
              <strong>Cluster high-priority deliveries</strong>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
function Routes({ onPlan }) {
  const [form, setForm] = useState({
    start_location: "Pari Chowk",
    destination: "Noida Sector 18",
    mode: "Car",
  });
  const [result, setResult] = useState(null);
  const plan = (event) => {
    event.preventDefault();
    const seed = `${form.start_location}|${form.destination}`.length;
    setResult({
      recommended: "Route B",
      routes: [
        {
          name: "Route A",
          distance: 18.4 + (seed % 3),
          time: 42 + (seed % 5),
          pressure: "High",
          congestion: "Slow",
        },
        {
          name: "Route B",
          distance: 20.1 + (seed % 2),
          time: 37 + (seed % 4),
          pressure: "Moderate",
          congestion: "Steady",
        },
        {
          name: "Route C",
          distance: 23.8 + (seed % 4),
          time: 45 + (seed % 6),
          pressure: "Low",
          congestion: "Clear",
        },
      ],
    });
    onPlan(form);
  };
  return (
    <>
      <PageHead
        eyebrow="DYNAMIC ROUTING / LOCAL DEMO CALCULATION"
        title="Compare the corridor, then choose."
        copy="Stable route options from a local deterministic calculation. No turn-by-turn navigation is connected."
        action={<DemoBadge />}
      />
      <div className="content-grid">
        <Panel eyebrow="ROUTE REQUEST" title="Plan a journey">
          <form className="compact-form" onSubmit={plan}>
            <label>
              Origin
              <input
                required
                value={form.start_location}
                onChange={(event) =>
                  setForm({ ...form, start_location: event.target.value })
                }
              />
            </label>
            <label>
              Destination
              <input
                required
                value={form.destination}
                onChange={(event) =>
                  setForm({ ...form, destination: event.target.value })
                }
              />
            </label>
            <label>
              Travel mode
              <select
                value={form.mode}
                onChange={(event) =>
                  setForm({ ...form, mode: event.target.value })
                }
              >
                <option>Car</option>
                <option>Delivery van</option>
                <option>Bus</option>
                <option>Emergency vehicle</option>
              </select>
            </label>
            <button className="primary full">
              Compare routes <ArrowIcon />
            </button>
          </form>
        </Panel>
        <Panel eyebrow="ROUTE GUIDANCE" title="Recommended route">
          <div className="route-options">
            {result ? (
              result.routes.map((route) => (
                <div
                  className={`route-option ${route.name === result.recommended ? "recommended" : ""}`}
                  key={route.name}
                >
                  <div>
                    <span>
                      {route.name}
                      {route.name === result.recommended && <b> RECOMMENDED</b>}
                    </span>
                    <strong>
                      {route.distance.toFixed(1)} km · {route.time} min
                    </strong>
                    <small>
                      {route.congestion} traffic pressure · {route.pressure}
                    </small>
                  </div>
                  <span className="tag tag-teal">{route.pressure}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                Submit an origin and destination to compare stable route
                options.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
function Delivery() {
  const [clustered, setClustered] = useState(false);
  const groups = clustered ? 5 : 8;
  return (
    <>
      <PageHead
        eyebrow="SMART DELIVERY / ILLUSTRATIVE RESULT"
        title="Fewer trips, clearer priorities."
        copy="Cluster nearby demo orders into operational groups. This is a local calculation, not a measured real-world saving."
        action={<DemoBadge />}
      />
      <div className="metrics four">
        <Metric
          icon={Truck}
          label="Orders"
          value={deliverySeed.length}
          note="Seeded demo orders"
          tone="blue"
        />
        <Metric
          icon={Route}
          label="Trips before"
          value="8"
          note="Demo calculation"
          tone="coral"
        />
        <Metric
          icon={CheckCircle2}
          label="Trips after"
          value={clustered ? groups : "-"}
          note={clustered ? "Illustrative result" : "Run clustering"}
          tone="teal"
        />
        <Metric
          icon={Activity}
          label="Priority load"
          value="4"
          note="High / critical orders"
          tone="gold"
        />
      </div>
      <Panel eyebrow="ORDER CLUSTERING" title="Delivery groups">
        <div className="delivery-toolbar">
          <p className="muted">
            Nearby locations are grouped around shared corridors.
          </p>
          <button className="primary" onClick={() => setClustered(true)}>
            Generate optimized groups
          </button>
        </div>
        <div className="delivery-grid">
          {deliverySeed.map((order) => (
            <div className="delivery-card" key={order.id}>
              <span>{order.id}</span>
              <strong>{order.location}</strong>
              <small>
                {order.distance} km · {order.priority} priority
              </small>
            </div>
          ))}
        </div>
        {clustered && (
          <div className="notice">
            Illustrative result: {deliverySeed.length} orders grouped into{" "}
            {groups} optimized trips.
          </div>
        )}
      </Panel>
    </>
  );
}
function Transit() {
  return (
    <>
      <PageHead
        eyebrow="LIVE TRANSIT / DEMO SIMULATION"
        title="Transit signals in one view."
        copy="Seeded bus and metro information for the NagarX prototype. No GTFS or GTFS-Realtime feed is connected."
        action={<DemoBadge />}
      />
      <div className="transit-grid">
        {transitSeed.map((item) => (
          <div className="transit-card" key={`${item.mode}-${item.route}`}>
            <div className="transit-icon">
              {item.mode === "Bus" ? <Bus size={21} /> : <Activity size={21} />}
            </div>
            <div>
              <span>
                {item.mode} {item.route}
              </span>
              <strong>{item.eta} min</strong>
              <small>
                Next: {item.next} · Crowding: {item.crowding}
              </small>
              <em>{item.status}</em>
            </div>
          </div>
        ))}
      </div>
      <Panel eyebrow="DATA STATUS" title="Transit feed boundary">
        <p className="panel-copy">
          Transit Data: Demo Simulation. Connect a GTFS/GTFS-Realtime provider
          before describing this view as live city-wide transit.
        </p>
      </Panel>
    </>
  );
}
function Emergency() {
  const [active, setActive] = useState(false);
  return (
    <>
      <PageHead
        eyebrow="EMERGENCY PRIORITY / LOCAL SIMULATION"
        title="Clear a corridor for response."
        copy="Simulate a priority route and communicate the traffic diversion recommendation."
        action={<DemoBadge />}
      />
      <div className="content-grid">
        <Panel eyebrow="PRIORITY REQUEST" title="Emergency corridor">
          <form
            className="compact-form"
            onSubmit={(event) => {
              event.preventDefault();
              setActive(true);
            }}
          >
            <label>
              Emergency type
              <select>
                <option>Ambulance</option>
                <option>Fire</option>
                <option>Police</option>
              </select>
            </label>
            <label>
              Origin
              <input defaultValue="Knowledge Park II" />
            </label>
            <label>
              Destination
              <input defaultValue="Kailash Hospital" />
            </label>
            <button className="primary full">
              Activate local simulation <Siren size={16} />
            </button>
          </form>
        </Panel>
        <Panel
          eyebrow={active ? "AMBULANCE PRIORITY ACTIVE" : "STANDBY"}
          title="Green corridor preview"
        >
          <div className={`corridor ${active ? "active" : ""}`}>
            <strong>Knowledge Park II - Pari Chowk - Hospital</strong>
            <span>Estimated response: 14 min</span>
            <span>Affected junctions: 4</span>
            <small>
              Action: prioritize selected corridor and divert regular traffic.
              This does not control real signals.
            </small>
          </div>
        </Panel>
      </div>
    </>
  );
}
function Incidents({ incidents, onRefresh }) {
  const [form, setForm] = useState({
    type: "Accident",
    location: "Knowledge Park II",
    severity: "High",
    description: "",
  });
  const [message, setMessage] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await request("/incidents", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          latitude: 28.4742,
          longitude: 77.4831,
        }),
      });
      setForm({ ...form, description: "" });
      setMessage("Incident added to the City Hub and authority alert feed.");
      onRefresh();
    } catch (error) {
      setMessage(error.message);
    }
  };
  return (
    <>
      <PageHead
        eyebrow="INCIDENT REPORTING"
        title="Turn a report into a response."
        copy="Validated incident reports flow to the map, dashboard counts and authority notifications."
      />
      <div className="content-grid">
        <Panel eyebrow="CITIZEN INPUT" title="Report an incident">
          <form className="compact-form" onSubmit={submit}>
            <label>
              Category
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value })
                }
              >
                {[
                  "Accident",
                  "Road blockage",
                  "Vehicle breakdown",
                  "Flooding",
                  "Traffic jam",
                  "Road work",
                  "Other",
                ].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label>
              Location
              <input
                required
                value={form.location}
                onChange={(event) =>
                  setForm({ ...form, location: event.target.value })
                }
              />
            </label>
            <label>
              Severity
              <select
                value={form.severity}
                onChange={(event) =>
                  setForm({ ...form, severity: event.target.value })
                }
              >
                {["Low", "Medium", "High", "Critical"].map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>
            <label>
              Description
              <textarea
                required
                minLength="10"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
            {message && <div className="notice">{message}</div>}
            <button className="primary full">Submit incident</button>
          </form>
        </Panel>
        <Panel eyebrow="LIVE QUEUE" title="Recent incidents">
          <IncidentRows incidents={incidents.slice(0, 8)} />
        </Panel>
      </div>
    </>
  );
}
function Analytics({ analytics }) {
  const grouped = (analytics?.incidents || []).reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + item.count;
    return acc;
  }, {});
  const max = Math.max(...Object.values(grouped), 1);
  return (
    <>
      <PageHead
        eyebrow="TRAFFIC & OPERATIONS ANALYTICS"
        title="Evidence for the next decision."
        copy="Operational summaries from local seeded records. Pilot metrics are illustrative."
      />
      <div className="metrics four">
        <Metric
          icon={AlertTriangle}
          label="Total incidents"
          value={analytics?.totals?.total || 0}
          note="Recorded reports"
          tone="coral"
        />
        <Metric
          icon={Activity}
          label="Open now"
          value={analytics?.totals?.open || 0}
          note="Awaiting resolution"
          tone="gold"
        />
        <Metric
          icon={CheckCircle2}
          label="Resolved"
          value={analytics?.totals?.resolved || 0}
          note="Closed reports"
          tone="teal"
        />
        <Metric
          icon={ShieldCheck}
          label="Avg response"
          value={`${analytics?.average_response_minutes || 0} min`}
          note="Pilot metric"
          tone="blue"
        />
      </div>
      <Panel eyebrow="INCIDENT MIX" title="Reports by category">
        <div className="bar-chart">
          {Object.entries(grouped).map(([type, count]) => (
            <div className="bar-row" key={type}>
              <span>{type}</span>
              <div>
                <i style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

export default function CommandCenter() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [data, setData] = useState({
    incidents: [],
    traffic: [],
    routes: [],
    analytics: null,
    alerts: [],
  });
  const load = async () => {
    const [incidents, traffic, routes, analytics, alerts] = await Promise.all([
      request("/incidents"),
      request("/traffic"),
      request("/routes"),
      request("/analytics"),
      request("/alerts"),
    ]);
    setData({ incidents, traffic, routes, analytics, alerts });
  };
  useEffect(() => {
    const token = authStorage.nagerxToken;
    if (token)
      request("/auth/me")
        .then((result) => setUser(result.user))
        .catch(() => authStorage.removeItem("nagerxToken"));
  }, []);
  useEffect(() => {
    if (user) {
      setView(user.role === "Authority" ? "incidents" : user.role === "Logistics" ? "delivery" : "dashboard");
      load().catch(() => {});
    }
  }, [user]);
  if (!user) return <Login onLogin={setUser} />;
  const logout = () => {
    authStorage.removeItem("nagerxToken");
    setUser(null);
  };
  const page = {
    dashboard: user.role === "Citizen" ? <Dashboard data={data} setView={setView} /> : <RoleLanding role={user.role} data={data} setView={setView} />,
    brain: <Brain traffic={trafficSeed} />,
    routes: <Routes onPlan={() => {}} />,
    delivery: <Delivery />,
    transit: <Transit />,
    emergency: <Emergency />,
    incidents: <Incidents incidents={data.incidents} onRefresh={load} />,
    analytics: <Analytics analytics={data.analytics} />,
    traffic: (
      <>
        <PageHead
          eyebrow="TRAFFIC MONITOR"
          title="Pressure across the network."
          copy="Traffic observations and incident context from the local demo feed."
          action={<DemoBadge />}
        />
        <Panel eyebrow="TRAFFIC MAP" title="Hotspots and incidents">
          <MapView incidents={data.incidents} traffic={data.traffic} />
        </Panel>
      </>
    ),
  }[view];
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark small">NX</span>
          <span>
            Nagar<strong>X</strong>
          </span>
          <button
            className="icon-button mobile-only"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="side-label">CITY COMMAND</div>
        <nav>
          {navItems.map(([id, label, Icon]) => (
            <button
              key={id}
              className={view === id ? "active" : ""}
              onClick={() => {
                setView(id);
                setMenuOpen(false);
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <DemoBadge />
          <div className="user-chip">
            <CircleUserRound size={19} />
            <div>
              <strong>{user.name}</strong>
              <small>{user.role} access</small>
            </div>
          </div>
          <button className="logout" onClick={logout}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="hub-title">
            NagarX <span>/ AI-powered urban mobility prototype</span>
          </div>
          <div className="top-actions">
            <span className="api-status">
              <span /> Local API connected
            </span>
            <Bell size={18} />
          </div>
        </header>
        <div className="page-content">{page}</div>
      </main>
    </div>
  );
}
