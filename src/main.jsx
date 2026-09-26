import RealMap from "./components/RealMap";
import React, { useEffect,useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabase";
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
  const [journeyId, setJourneyId] = useState(null);
  const [trustedContact, setTrustedContact] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("sathiTrustedContact")) || null;
  } catch {
    return null;
  }
});

  const go = (next) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setScreen(next);
  };

  const analyze = () => {
    if (!destination.trim()) setDestination("College");
    go("analysis");
  };

  const startJourney = async () => {
  const journeyDestination = destination || "College";

  const { data, error } = await supabase
    .from("journeys")
    .insert({
      destination: journeyDestination,
      status: "active",
      safety_status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Journey save failed:", error);
    alert("Could not start journey. Please try again.");
    return;
  }

  setJourneyId(data.id);
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
        <SaferRoute
  route={route}
  setRoute={setRoute}
  go={go}
  startJourney={startJourney}
/>
      )}

      {screen === "havens" && <SafeHavens go={go} />}
      {screen === "haven-route" && <SafeHavenRoute go={go} />}

      {screen === "walk" && (
       <WalkWithMe 
  destination={destination}
  journeyStarted={journeyStarted}
  safetyCheck={safetyCheck}
  safeResponded={safeResponded}
  setSafeResponded={setSafeResponded}
  go={go}
/>
      )}

      {screen === "profile" && (
  <Profile
    go={go}
    trustedContact={trustedContact}
    setTrustedContact={setTrustedContact}
  />
)}
      {screen === "help" && (
  <HelpScreen
    go={go}
    trustedContact={trustedContact}
  />
)}

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
  const riskData = {
    Now: {
      level: "Moderate concern",
      className: "amber",
      score: 58,
      activity: "Moderate",
      visibility: "Good",
      establishments: "Several open",
      isolated: 1,
      havens: 2,
      message: "Moderate activity and reasonable visibility along the route.",
    },

    "6 PM": {
      level: "Lower concern",
      className: "green",
      score: 32,
      activity: "High",
      visibility: "Good",
      establishments: "Most open",
      isolated: 0,
      havens: 3,
      message: "Higher pedestrian activity and better visibility make this route less concerning.",
    },

    "9 PM": {
      level: "Higher concern",
      className: "red",
      score: 76,
      activity: "Low",
      visibility: "Reduced",
      establishments: "Fewer open",
      isolated: 2,
      havens: 2,
      message: "Lower activity and fewer open establishments increase concern along parts of this route.",
    },

    "11 PM": {
      level: "High concern",
      className: "red",
      score: 89,
      activity: "Very low",
      visibility: "Low",
      establishments: "Very few open",
      isolated: 3,
      havens: 1,
      message: "Very low activity, reduced visibility and fewer open places make this route more concerning.",
    },
  };

  const risk = riskData[time];

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow dark">ROUTE ANALYSIS</p>
          <h2>{destination}</h2>
        </div>

        <span className={`status-pill ${risk.className}`}>
          {risk.level}
        </span>
      </div>

      <div className="route-inputs">
        <div>
          <small>Your location</small>
          <b>Current location</b>
        </div>

        <div>
          <small>Destination</small>
          <b>{destination}</b>
        </div>
      </div>

      <RealMap destination={destination} time={time} />

      <div className="legend">
        <span>
          <i className="dot green-dot" /> Lower concern
        </span>

        <span>
          <i className="dot amber-dot" /> Caution
        </span>

        <span>
          <i className="dot red-dot" /> Higher concern
        </span>
      </div>

      <section className="info-card assessment">
        <div className="card-top">
          <div>
            <small>OVERALL ROUTE ASSESSMENT</small>
            <h3>{risk.level}</h3>
          </div>

          <span className="big-status">
            {risk.score}
          </span>
        </div>

        <div className="mini-stats">
          <span>⚠ {risk.isolated} isolated stretch{risk.isolated !== 1 ? "es" : ""}</span>
          <span>◌ {risk.activity} activity</span>
          <span>♧ {risk.havens} safe haven{risk.havens !== 1 ? "s" : ""}</span>
        </div>
      </section>

      <section className="why-card">
        <h3>Why is this route flagged?</h3>

        <p>• {risk.activity} pedestrian activity around this time</p>
        <p>• {risk.establishments} establishments may be available</p>
        <p>• {risk.visibility} visibility conditions</p>
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
            <button
              className={time === t ? "selected" : ""}
              onClick={() => setTime(t)}
              key={t}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="time-note">
          At <b>{time}</b>, {risk.message}
        </p>
      </section>

      <div className="action-grid">
        <button
          className="secondary-btn"
          onClick={() => go("havens")}
        >
          Find safe havens
        </button>

        <button
          className="primary-btn"
          onClick={() => go("safer")}
        >
          View safer alternative →
        </button>
      </div>
    </main>
  );
}

function SaferRoute({ route, setRoute, go, startJourney }) {
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

      <button className="primary-btn full" onClick={startJourney}>
  Start with this route →
</button>

      <button className="text-btn" onClick={() => go("analysis")}>← Back to route analysis</button>
    </main>
  );
}

function SafeHavens({ go }) {
  const [havens, setHavens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const query = `
            [out:json];
            (
              node["amenity"="fuel"](around:2000,${lat},${lon});
              node["amenity"="pharmacy"](around:2000,${lat},${lon});
              node["amenity"="police"](around:2000,${lat},${lon});
              node["shop"](around:2000,${lat},${lon});
            );
            out center tags;
          `;

          const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
              method: "POST",
              body: query,
            }
          );

          const data = await response.json();

          const results = data.elements
  .map((place) => {
    const tags = place.tags || {};

    const lat = place.lat ?? place.center?.lat;
    const lon = place.lon ?? place.center?.lon;

    if (!lat || !lon) return null;

    let type = "Shop";
    let icon = "▣";

    if (tags.amenity === "police") {
      type = "Police";
      icon = "♜";
    } else if (tags.amenity === "pharmacy") {
      type = "Pharmacy";
      icon = "✚";
    } else if (tags.amenity === "fuel") {
      type = "Fuel";
      icon = "⛽";
    }

    const distance = Math.sqrt(
      Math.pow((lat - position.coords.latitude) * 111, 2) +
      Math.pow(
        (lon - position.coords.longitude) *
          111 *
          Math.cos(
            (position.coords.latitude * Math.PI) / 180
          ),
        2
      )
    );

    return {
      id: place.id,
      name: tags.name || `${type} nearby`,
      type,
      icon,
      lat,
      lon,
      distance,
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.distance - b.distance)
  .slice(0, 20);

setHavens(results);
        } catch (err) {
          console.error(err);
          setError("Unable to find nearby safe places.");
        }

        setLoading(false);
      },
      () => {
        setError("Please allow location access to find nearby safe havens.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow dark">SAFE HAVENS</p>
          <h2>Places you can reach<br />if you feel unsafe.</h2>
        </div>
      </div>

      {loading && (
        <div className="info-card">
          <h3>Finding safe places near you...</h3>
          <p>Checking nearby police stations, pharmacies, fuel stations and shops.</p>
        </div>
      )}

      {error && (
        <div className="alert-soft">
          <span>!</span>
          <div>
            <b>Location needed</b>
            <small>{error}</small>
          </div>
        </div>
      )}

      {!loading && !error && havens.length === 0 && (
        <div className="info-card">
          <h3>No nearby places found</h3>
          <p>Try again from an area with more mapped locations.</p>
        </div>
      )}

      <div className="filter-row">
        {["All", "Police", "Pharmacy", "Shop", "Fuel"].map((x, i) => (
          <button
            className={i === 0 ? "active" : ""}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="haven-list">
        {havens.map((haven) => (
          <div className="haven-item" key={`${haven.type}-${haven.id}`}>
            <span className="haven-icon">{haven.icon}</span>

            <div>
              <b>{haven.name}</b>
              <small>{haven.type} · Nearby</small>
              <em>Open location in Maps</em>
            </div>

            <button
  onClick={() => {
    localStorage.setItem(
      "sathiSafeHaven",
      JSON.stringify(haven)
    );
    go("haven-route");
  }}
>
  Navigate
</button>
          </div>
        ))}
      </div>

      {!loading && havens.length > 0 && (
        <div className="haven-tip">
          ◎ <b>Real nearby places.</b> SATHI uses your current location to find mapped safe places around you.
        </div>
      )}
    </main>
  );
}

function WalkWithMe({ destination, safetyCheck, safeResponded, setSafeResponded, go }) {
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
        <div className="journey-head">
  <span>Current location → {destination}</span>
  <b>JOURNEY ACTIVE</b>
</div>
        <RealMap
  destination={destination}
  onJourneyComplete={() => setSafeResponded(true)}
/>
        <div className="journey-status"><span>✓</span><div><b>You're on your planned route</b><small>SATHI is monitoring your journey · Stay on the planned route</small></div></div>
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
  <h3>Journey check-in complete.</h3>
  <p>
    You're safe. SATHI has recorded your check-in and will continue
    monitoring your journey.
  </p>

  <button
    className="primary-btn"
    onClick={() => go("home")}
  >
    Finish journey
  </button>
</div>
      )}
    </main>
  );
}

function HelpScreen({ go, trustedContact }) {
  const shareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: "SATHI - My Location",
        text: "I may need help. Please check my location.",
      });
    } else {
      alert("Location sharing is not supported on this browser.");
    }
  };

  const alertContact = () => {
  if (!trustedContact) {
    alert("Please add a trusted contact first.");
    go("profile");
    return;
  }

  const confirmed = window.confirm(
    `Call your trusted contact ${trustedContact.name}?`
  );

  if (confirmed) {
    window.location.href = `tel:${trustedContact.phone}`;
  }
};

  return (
    <main className="page help-page">
      <div className="page-title">
        <div>
          <p className="eyebrow dark">EMERGENCY SUPPORT</p>
          <h2>I Need Help</h2>
        </div>
        <span className="live-pill"><i /> ACTIVE</span>
      </div>

      <section className="help-alert">
        <span>!</span>
        <div>
          <b>You're not alone.</b>
          <p>Choose the support you need right now.</p>
        </div>
      </section>

      <div className="help-actions">

        <a className="help-action emergency" href="tel:112">
          <span>📞</span>
          <div>
            <b>Call Emergency — 112</b>
            <small>Connect to emergency services</small>
          </div>
          <strong>→</strong>
        </a>

        <button className="help-action" onClick={shareLocation}>
          <span>📍</span>
          <div>
            <b>Share My Location</b>
            <small>Share your current location</small>
          </div>
          <strong>→</strong>
        </button>

        <button className="help-action" onClick={alertContact}>
          <span>👤</span>
          <div>
            <b>
  {trustedContact
    ? `Call ${trustedContact.name}`
    : "Add Trusted Contact"}
</b>

<small>
  {trustedContact
    ? trustedContact.phone
    : "Add a trusted person from your profile"}
</small>
          </div>
          <strong>→</strong>
        </button>

        <button className="help-action" onClick={() => go("havens")}>
          <span>🛡️</span>
          <div>
            <b>Find a Safe Haven</b>
            <small>Find a nearby safe place</small>
          </div>
          <strong>→</strong>
        </button>

      </div>

      <button className="text-btn" onClick={() => go("walk")}>
        ← Back to Walk With Me
      </button>
    </main>
  );
}

function Profile({ go, trustedContact, setTrustedContact }) {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const [showHelp, setShowHelp] = useState(false);
const [showAbout, setShowAbout] = useState(false);

  const [profileName, setProfileName] = useState("");
  const [email, setEmail] = useState("");

  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");

  const [profileSaved, setProfileSaved] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();

    if (!profileName.trim() || !email.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    const { data, error } = await supabase
  .from("profiles")
  .insert({
    name: profileName.trim(),
    email: email.trim(),
  })
  .select()
  .single();

    if (error) {
      console.error(error);
      alert("Could not save profile.");
      return;
    }

    localStorage.setItem(
      "sathiProfile",
      JSON.stringify({
        name: profileName.trim(),
        email: email.trim(),
      })
    );

    setProfileSaved(true);
    setShowProfileForm(false);
  };

  const saveContact = async (e) => {
    e.preventDefault();

    if (!contactName.trim() || !phone.trim()) {
      alert("Please enter both name and phone number.");
      return;
    }

    const contact = {
      name: contactName.trim(),
      phone: phone.trim(),
    };

    const profileData = JSON.parse(
      localStorage.getItem("sathiProfile") || "null"
    );

    if (profileData) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", profileData.email)
        .single();

      if (profile) {
        const { error } = await supabase
          .from("trusted_contacts")
          .insert({
  profile_id: profile.id,
  name: contact.name,
  phone: contact.phone,
});

        if (error) {
          console.error(error);
          alert("Could not save trusted contact.");
          return;
        }
      }
    }

    localStorage.setItem(
      "sathiTrustedContact",
      JSON.stringify(contact)
    );

    setTrustedContact(contact);
    setContactName("");
    setPhone("");
    setShowContactForm(false);
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem("sathiProfile");

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);

        setProfileName(profile.name || "");
        setEmail(profile.email || "");
        setProfileSaved(true);
      } catch {
        localStorage.removeItem("sathiProfile");
      }
    }
  }, []);

  return (
    <main className="page profile-page">


      {!profileSaved ? (
        <form
          className="trusted-contact-form"
          onSubmit={saveProfile}
        >
          <div>
            <small>YOUR NAME</small>

            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <small>EMAIL</small>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            className="primary-btn full"
          >
            Save Profile
          </button>
        </form>
      ) : (
        <div className="trusted-contact-card">

          <div className="trusted-contact-heading">
            <div>
              <small>MY PROFILE</small>
              <h3>{profileName}</h3>
            </div>

            <span>♡</span>
          </div>

          <p className="trusted-phone">{email}</p>

          <button
            className="secondary-btn"
            onClick={() => setShowProfileForm(true)}
          >
            Edit Profile
          </button>
        </div>
      )}

      {showProfileForm && (
        <form
          className="trusted-contact-form"
          onSubmit={saveProfile}
        >
          <div>
            <small>YOUR NAME</small>

            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>

          <div>
            <small>EMAIL</small>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="primary-btn full"
          >
            Update Profile
          </button>

          <button
            type="button"
            className="text-btn"
            onClick={() => setShowProfileForm(false)}
          >
            Cancel
          </button>
        </form>
      )}

      <div className="trusted-contact-card">

        <div className="trusted-contact-heading">
          <div>
            <small>TRUSTED CONTACT</small>

            <h3>
              {trustedContact
                ? trustedContact.name
                : "No trusted contact added"}
            </h3>
          </div>

          <span>♡</span>
        </div>

        {trustedContact ? (
          <>
            <p className="trusted-phone">
              {trustedContact.phone}
            </p>

            <div className="trusted-contact-actions">

              <a
                className="primary-btn"
                href={`tel:${trustedContact.phone}`}
              >
                📞 Call
              </a>

              <button
                className="secondary-btn"
                onClick={() => {
                  setContactName(trustedContact.name);
                  setPhone(trustedContact.phone);
                  setShowContactForm(true);
                }}
              >
                Edit
              </button>

              <button
                className="text-btn"
                onClick={() => {
                  localStorage.removeItem("sathiTrustedContact");
                  setTrustedContact(null);
                }}
              >
                Remove
              </button>

            </div>
          </>
        ) : (
          <>
            <p>
              Add someone you trust for emergency support.
            </p>

            <button
              className="primary-btn full"
              onClick={() => setShowContactForm(true)}
            >
              + Add Trusted Contact
            </button>
          </>
        )}
      </div>

      {showContactForm && (
        <form
          className="trusted-contact-form"
          onSubmit={saveContact}
        >
          <div>
            <small>CONTACT NAME</small>

            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Mom, Dad, Friend"
            />
          </div>

          <div>
            <small>PHONE NUMBER</small>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <button
            type="submit"
            className="primary-btn full"
          >
            Save Trusted Contact
          </button>

          <button
            type="button"
            className="text-btn"
            onClick={() => setShowContactForm(false)}
          >
            Cancel
          </button>
        </form>
      )}

      <div className="profile-menu">

        <button className="profile-row">
          <span>⌁</span>
          <b>My Routes</b>
          <strong>›</strong>
        </button>

        <button
          className="profile-row"
          onClick={() => setShowContactForm(true)}
        >
          <span>♡</span>
          <b>Trusted Contacts</b>
          <strong>›</strong>
        </button>

        <button className="profile-row">
          <span>⚙</span>
          <b>Safety Preferences</b>
          <strong>›</strong>
        </button>

        <button
  className="profile-row"
  onClick={() => setShowHelp(!showHelp)}
>
  <span>?</span>
  <b>Help & Support</b>
  <strong>{showHelp ? "⌃" : "›"}</strong>
</button>

{showHelp && (
  <div className="profile-info-card">
    <h3>Help & Support</h3>

    <p>
      SATHI helps you understand your route and make safer journey
      decisions with time-aware safety information.
    </p>

    <div className="info-item">
      <b>🚨 Emergency Help</b>
      <span>For immediate emergencies, call 112.</span>
    </div>

    <div className="info-item">
      <b>📍 Location & Tracking</b>
      <span>
        Location is used to support route guidance and Walk With Me
        journey monitoring.
      </span>
    </div>

    <div className="info-item">
      <b>👤 Trusted Contact</b>
      <span>
        Add someone you trust so you can quickly contact them during
        your journey.
      </span>
    </div>

    <div className="info-item">
      <b>🗺️ Route Safety</b>
      <span>
        SATHI considers route conditions and different times of day
        when presenting safety context.
      </span>
    </div>

    <div className="info-item">
      <b>📧 Contact Support</b>
      <span>support@sathi.app</span>
    </div>
  </div>
)}

       <button
  className="profile-row"
  onClick={() => setShowAbout(!showAbout)}
>
  <span>i</span>
  <b>About SATHI</b>
  <strong>{showAbout ? "⌃" : "›"}</strong>
</button>

{showAbout && (
  <div className="profile-info-card">
    <h3>About SATHI</h3>

    <p>
      SATHI is a safety-focused journey companion designed to give
      people more context before and during a journey.
    </p>

    <div className="info-item">
      <b>Smart Route Risk Analysis</b>
      <span>Understand safety context along your route.</span>
    </div>

    <div className="info-item">
      <b>Time-Based Risk</b>
      <span>Safety conditions can change depending on the time.</span>
    </div>

    <div className="info-item">
      <b>Safe Haven Finder</b>
      <span>Find nearby places that may provide assistance.</span>
    </div>

    <div className="info-item">
      <b>Safer Alternative Route</b>
      <span>Explore an alternative route with safety context.</span>
    </div>

    <div className="info-item">
      <b>Walk With Me</b>
      <span>
        Stay connected with SATHI while your journey is active.
      </span>
    </div>

    <p className="about-note">
      SATHI is designed to provide safety context and support,
      not replace emergency services.
    </p>
  </div>
)}

      </div>

      <div className="profile-quote">
        Because she deserves a safer journey.
      </div>

      <button
        className="text-btn"
        onClick={() => go("home")}
      >
        ← Back home
      </button>

    </main>
  );
}

function SafeHavenRoute({ go }) {
  const [haven, setHaven] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("sathiSafeHaven")
      );

      setHaven(saved);
    } catch {
      setHaven(null);
    }
  }, []);

  if (!haven) {
    return (
      <main className="page">
        <div className="page-title">
          <div>
            <p className="eyebrow dark">SAFE HAVEN</p>
            <h2>Safe haven not found</h2>
          </div>
        </div>

        <button
          className="primary-btn full"
          onClick={() => go("havens")}
        >
          ← Back to Safe Havens
        </button>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-title">
        <div>
          <p className="eyebrow dark">SAFE HAVEN ROUTE</p>
          <h2>{haven.name}</h2>
        </div>
      </div>

      <div className="journey-card">
        <RealMap
          destination={haven.name}
          destinationPoint={[haven.lat, haven.lon]}
        />

        <div className="journey-status">
          <span>✓</span>

          <div>
            <b>Route to your safe haven</b>
            <small>
              SATHI is guiding you to this nearby safe place.
            </small>
          </div>
        </div>
      </div>

      <button
        className="primary-btn full"
        onClick={() => go("walk")}
      >
        Start Walk With Me →
      </button>

      <button
        className="text-btn"
        onClick={() => go("havens")}
      >
        ← Back to Safe Havens
      </button>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
