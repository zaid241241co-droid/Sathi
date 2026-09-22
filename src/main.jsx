import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const heroImage =
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=85";

const places = [
  { name: "College", icon: "⌂", time: "22 min" },
  { name: "Market", icon: "◈", time: "12 min" },
  { name: "Hospital", icon: "✚", time: "18 min" },
  { name: "Bus Stand", icon: "▣", time: "10 min" },
];

function App() {
  const [screen, setScreen] = useState("home");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("Now");
  const [route, setRoute] = useState("safer");
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [safetyCheck, setSafetyCheck] = useState(false);
  const [safeResponded, setSafeResponded] = useState(false);

  const go = (next) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setScreen(next);
  };

  const analyze = () => {
    if (!destination.trim()) setDestination("College");
    go("analysis");
  };

  const startJourney = () => {
    setJourneyStarted(true);
    setSafetyCheck(false);
    setSafeResponded(false);
    go("walk");
    setTimeout(() => setSafetyCheck(true), 4500);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => go("home")} aria-label="SATHI home">
          <span className="brand-mark">✦</span>
          <span>SATHI</span>
        </button>
        <div className="top-actions">
          {screen !== "home" && (
            <button className="back-btn" onClick={() => go("home")}>← Home</button>
          )}
          <button className="menu-btn" onClick={() => go("profile")}>☰</button>
        </div>
      </header>

      {screen === "home" && (
        <Home
          destination={destination}
          setDestination={setDestination}
          analyze={analyze}
          go={go}
        />
      )}

      {screen === "analysis" && (
        <Analysis
          destination={destination || "College"}
          time={time}
          setTime={setTime}
          go={go}
        />
      )}

      {screen === "safer" && (
        <SaferRoute route={route} setRoute={setRoute} go={go} />
      )}

      {screen === "havens" && <SafeHavens go={go} />}

      {screen === "walk" && (
        <WalkWithMe
          journeyStarted={journeyStarted}
          safetyCheck={safetyCheck}
          safeResponded={safeResponded}
          setSafeResponded={setSafeResponded}
          go={go}
        />
      )}

      {screen === "profile" && <Profile go={go} />}

      <nav className="bottom-nav">
        <button className={screen === "home" ? "active" : ""} onClick={() => go("home")}>
          <span>⌂</span><small>Home</small>
        </button>
        <button className={["analysis", "safer"].includes(screen) ? "active" : ""} onClick={() => go("analysis")}>
          <span>⌁</span><small>Route</small>
        </button>
        <button className={screen === "havens" ? "active" : ""} onClick={() => go("havens")}>
          <span>♧</span><small>Safe Havens</small>
        </button>
        <button className={screen === "profile" ? "active" : ""} onClick={() => go("profile")}>
          <span>◯</span><small>Profile</small>
        </button>
      </nav>
    </div>
  );
}

function Home({ destination, setDestination, analyze, go }) {
  return (
    <main className="home-page">
      <section className="hero-card">
        <img src={heroImage} alt="" />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="eyebrow">SAFER JOURNEYS, WITH CONTEXT</p>
          <h1>The route<br />nobody warned<br />her about.</h1>
          <p className="hero-sub">
            Know your route. Understand what changes with time.
            Get home with confidence.
          </p>
        </div>
        <div className="hero-search">
          <div className="location-row">
            <span className="pin">●</span>
            <div>
              <small>Your location</small>
              <strong>Current location</strong>
            </div>
          </div>
          <div className="search-line" />
          <div className="location-row">
            <span className="pin destination-pin">●</span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where are you going?"
            />
          </div>
          <button className="primary-btn" onClick={analyze}>
            Find safer route <span>→</span>
          </button>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">BUILT AROUND YOUR JOURNEY</p>
            <h2>Safety information,<br />when it matters.</h2>
          </div>
        </div>

        <div className="feature-strip">
          <button onClick={() => go("analysis")}>
            <span className="feature-icon green">⌁</span>
            <b>Route risk</b>
            <small>See what changes along the way</small>
          </button>
          <button onClick={() => go("safer")}>
            <span className="feature-icon peach">↗</span>
            <b>Safer options</b>
            <small>Compare routes before leaving</small>
          </button>
          <button onClick={() => go("havens")}>
            <span className="feature-icon sand">♧</span>
            <b>Safe havens</b>
            <small>Places you can reach for help</small>
          </button>
        </div>

        <div className="quote-card">
          <span>“</span>
          <p>SATHI doesn't decide for you.<br /><b>It gives you more context to decide.</b></p>
        </div>
      </section>
    </main>
  );
}

function FakeMap({ time = "Now", journey = false }) {
  const night = ["9 PM", "11 PM"].includes(time);

  return (
    <div className="fake-map">
      <div className="map-area-label park">CITY PARK</div>
      <div className="map-area-label market">MARKET AREA</div>
      <div className="map-area-label homes">RESIDENTIAL AREA</div>

      <div className="map-road r1" />
      <div className="map-road r2" />
      <div className="map-road r3" />
      <div className="map-road r4" />

      <div className="route-segment safe" />
      <div className={`route-segment caution ${night ? "night-risk" : ""}`} />
      <div className={`route-segment risk ${night ? "strong-risk" : ""}`} />

      <div className="map-marker start">
        <span />
        <b>Start</b>
      </div>

      <div className="map-marker destination">
        <span />
        <b>Destination</b>
      </div>

      {journey && (
        <div className="map-marker current">
          <span>●</span>
          <b>You</b>
        </div>
      )}

      {!journey && (
        <div className="risk-info">
          <strong>{night ? "Higher concern" : "Caution zone"}</strong>
          <small>{night ? "Lower activity after 9 PM" : "700 m stretch"}</small>
        </div>
      )}

      <div className="map-time-badge">🕐 {time}</div>

      <div className="map-hint">
        <span>●</span> Route condition changes with time
      </div>
    </div>
  );
}

function Analysis({ destination, time, setTime, go }) {
  const highAtNight = ["9 PM", "11 PM"].includes(time);
  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow dark">ROUTE ANALYSIS</p>
          <h2>{destination}</h2>
        </div>
        <span className={`status-pill ${highAtNight ? "red" : "amber"}`}>
          {highAtNight ? "Higher concern" : "Moderate concern"}
        </span>
      </div>

      <div className="route-inputs">
        <div><small>Your location</small><b>Current location</b></div>
        <div><small>Destination</small><b>{destination}</b></div>
      </div>

      <FakeMap time={time} />

      <div className="legend">
        <span><i className="dot green-dot" /> Lower concern</span>
        <span><i className="dot amber-dot" /> Caution</span>
        <span><i className="dot red-dot" /> Higher concern</span>
      </div>

      <section className="info-card assessment">
        <div className="card-top">
          <div>
            <small>OVERALL ROUTE ASSESSMENT</small>
            <h3>{highAtNight ? "Higher concern" : "Moderate concern"}</h3>
          </div>
          <span className="big-status">{highAtNight ? "!" : "!"}</span>
        </div>
        <div className="mini-stats">
          <span>⚠ 1 isolated stretch</span>
          <span>◌ Low activity</span>
          <span>♧ 2 safe havens</span>
        </div>
      </section>

      <section className="why-card">
        <h3>Why is this section flagged?</h3>
        <p>• Lower pedestrian activity during this time</p>
        <p>• Fewer open establishments nearby</p>
        <p>• Limited public facilities along the stretch</p>
      </section>

      <section className="time-card">
        <div className="card-heading">
          <div>
            <small>TIME-BASED RISK</small>
            <h3>Same route. Different conditions.</h3>
          </div>
          <span>◷</span>
        </div>
        <div className="time-tabs">
          {["Now", "6 PM", "9 PM", "11 PM"].map((t) => (
            <button className={time === t ? "selected" : ""} onClick={() => setTime(t)} key={t}>{t}</button>
          ))}
        </div>
        <p className="time-note">
          At <b>{time}</b>, this route has {highAtNight ? "lower activity and fewer open places." : "more activity and better visibility."}
        </p>
      </section>

      <div className="action-grid">
        <button className="secondary-btn" onClick={() => go("havens")}>Find safe havens</button>
        <button className="primary-btn" onClick={() => go("safer")}>View safer alternative →</button>
      </div>
    </main>
  );
}

function SaferRoute({ route, setRoute, go }) {
  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow dark">ROUTE OPTIONS</p>
          <h2>Choose what matters<br />more to you.</h2>
        </div>
      </div>

      <div className="alert-soft">
        <span>!</span>
        <div><b>This route has 1 concerning stretch.</b><small>We found another option with more active roads.</small></div>
      </div>

      <button className={`route-option ${route === "fast" ? "chosen" : ""}`} onClick={() => setRoute("fast")}>
        <div className="route-option-top"><b>Fastest route</b><span>18 min</span></div>
        <small>5.2 km · saves 4 minutes</small>
        <div className="tag-row"><em>1 concerning stretch</em><em>Lower activity</em></div>
        <span className="radio">{route === "fast" ? "●" : "○"}</span>
      </button>

      <button className={`route-option safer-option ${route === "safer" ? "chosen" : ""}`} onClick={() => setRoute("safer")}>
        <div className="route-option-top"><b>More active route</b><span>22 min</span></div>
        <small>6.8 km · +4 minutes</small>
        <div className="tag-row"><em>More active areas</em><em>More safe havens</em><em>Well-lit roads</em></div>
        <span className="radio">{route === "safer" ? "●" : "○"}</span>
      </button>

      <div className="choice-note">
        <span className="mini-photo" />
        <p><b>SATHI gives you the context.</b><br />You decide which trade-off works for your journey.</p>
      </div>

      <button className="primary-btn full" onClick={() => go("walk")}>
        Start with this route →
      </button>

      <button className="text-btn" onClick={() => go("analysis")}>← Back to route analysis</button>
    </main>
  );
}

function SafeHavens({ go }) {
  const havens = [
    ["24/7 Petrol Pump", "4 min · 1.2 km", "Well-lit · Main road", "⛽"],
    ["Open Pharmacy", "5 min · 1.5 km", "Open until 11 PM", "✚"],
    ["Police Station", "8 min · 2.3 km", "24/7 · Well connected", "♜"],
    ["Open Shop", "3 min · 1.1 km", "Public · Main road", "▣"],
  ];
  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow dark">SAFE HAVENS</p>
          <h2>Places you can reach<br />if you feel unsafe.</h2>
        </div>
      </div>

      <div className="haven-map">
        <FakeMap />
        <span className="haven-pin h1">♧</span>
        <span className="haven-pin h2">✚</span>
        <span className="haven-pin h3">⛽</span>
      </div>

      <div className="filter-row">
        {["All", "Police", "Hospital", "Shops", "Fuel"].map((x, i) => <button className={i === 0 ? "active" : ""} key={x}>{x}</button>)}
      </div>

      <div className="haven-list">
        {havens.map(([name, meta, detail, icon]) => (
          <div className="haven-item" key={name}>
            <span className="haven-icon">{icon}</span>
            <div><b>{name}</b><small>{meta}</small><em>{detail}</em></div>
            <button onClick={() => go("walk")}>Navigate</button>
          </div>
        ))}
      </div>

      <div className="haven-tip">◎ <b>Need a safer place?</b> Tap any location to start directions.</div>
    </main>
  );
}

function WalkWithMe({ safetyCheck, safeResponded, setSafeResponded, go }) {
  return (
    <main className="page walk-page">
      <div className="page-title">
        <div>
          <p className="eyebrow dark">WALK WITH ME</p>
          <h2>SATHI is with you.</h2>
        </div>
        <span className="live-pill"><i /> LIVE</span>
      </div>

      <div className="journey-card">
        <div className="journey-head"><span>Home → College</span><b>ETA 8:45 PM</b></div>
        <FakeMap journey />
        <div className="journey-status"><span>✓</span><div><b>You're on your planned route</b><small>2.3 km remaining · 12 min</small></div></div>
      </div>

      <div className="walk-message">
        <span className="avatar">S</span>
        <div><b>Walk With Me</b><p>SATHI will check in if something about the journey changes.</p></div>
      </div>

      {!safeResponded ? (
        <div className={`safety-panel ${safetyCheck ? "attention" : ""}`}>
          <small>{safetyCheck ? "SAFETY CHECK" : "JOURNEY STATUS"}</small>
          <h3>{safetyCheck ? "Are you safe?" : "You're on your way."}</h3>
          <p>{safetyCheck ? "We haven't heard from you in a while." : "We'll check in during your journey."}</p>
          <button className="primary-btn full" onClick={() => setSafeResponded(true)}>I'm Safe</button>
          <button className="secondary-btn full" onClick={() => go("help")}>I Need Help</button>
          {safetyCheck && <button className="quiet-btn">Can't talk</button>}
        </div>
      ) : (
        <div className="safe-confirm">
          <span>✓</span>
          <h3>You're safe.</h3>
          <p>SATHI will continue to stay with your journey.</p>
          <button className="primary-btn" onClick={() => go("home")}>Back to home</button>
        </div>
      )}
    </main>
  );
}

function Profile({ go }) {
  return (
    <main className="page profile-page">
      <div className="profile-hero">
        <span className="profile-avatar">A</span>
        <div><small>WELCOME BACK</small><h2>Anaya</h2></div>
      </div>
      {["My Routes", "Trusted Contacts", "Safety Preferences", "Help & Support", "About SATHI"].map((x, i) => (
        <button className="profile-row" key={x} onClick={() => i === 1 ? alert("Prototype: trusted contact is Mom") : null}>
          <span>{["⌁", "♡", "⚙", "?", "i"][i]}</span><b>{x}</b><strong>›</strong>
        </button>
      ))}
      <div className="profile-quote">Because she deserves a safer journey.</div>
      <button className="text-btn" onClick={() => go("home")}>← Back home</button>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
