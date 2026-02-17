import { useState, useEffect } from "react";
import "./attendance.css";


const pad     = (n) => String(n).padStart(2, "0");
const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const fmtDur  = (s) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;


function LogEntry({ entry }) {
  return (
    <div className="log-entry">
      <div className={`log-dot ${entry.type}`} />
      <span className="log-type">{entry.type === "in" ? "CHECK IN" : "CHECK OUT"}</span>
      <span className="log-time">{entry.time}</span>
      {entry.duration && <span className="log-duration">{entry.duration}</span>}
    </div>
  );
}


export default function AttendanceClock() {
  const [now,         setNow]         = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [elapsed,     setElapsed]     = useState(0);
  const [log,         setLog]         = useState([]);

  // Tick every second when checked in
  useEffect(() => {
    if (!isCheckedIn) return;
    const id = setInterval(() => {
      const n = new Date();
      setNow(n);
      setElapsed(Math.floor((n - checkInTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isCheckedIn, checkInTime]);

  const handleToggle = () => {
    if (!isCheckedIn) {
      const t = new Date();
      setNow(t);
      setCheckInTime(t);
      setElapsed(0);
      setLog((prev) => [{ type: "in", time: fmtTime(t), id: Date.now() }, ...prev]);
    } else {
      setLog((prev) => [
        { type: "out", time: fmtTime(now), duration: fmtDur(elapsed), id: Date.now() },
        ...prev,
      ]);
      setCheckInTime(null); 
      setElapsed(0);        
    }                        
    setIsCheckedIn((v) => !v);
  };                         

  const state = isCheckedIn ? "active" : "idle";

  return (
    <div className="card">

      {/* Header */}
      <div className="header">
        <div className="header-logo">
            <i className="fas fa-fingerprint"></i>
        </div>
        <h1>Office Attendance</h1>
        <p>{fmtDate(now)}</p>
      </div>

      {/* Clock */}
      <div className="clock-box">
        {isCheckedIn ? (
          <>
            <div className="clock-time">{fmtTime(now)}</div>
            <div className="clock-date">Session: {fmtDur(elapsed)}</div>
          </>
        ) : (
          <div className="clock-standby">Pehle check in kare kripya karke<i class="fas fa-hands-praying"></i>
</div>
        )}
      </div>

      {/* Status */}
      <div className={`status-badge ${state}`}>
        <span className="status-dot" />
        {isCheckedIn ? "Working" : "Not Working"}
      </div>

      {/* Button */}
      <button className={`toggle-btn ${state}`} onClick={handleToggle}>
        {isCheckedIn ? "⏹ Check Out" : "▶ Check In"}
      </button>

      {/* Stats */}
      <div className="stats">
        <div className="stat-cell">
          <div className="stat-label">Checked In</div>
          <div className="stat-value">{checkInTime ? fmtTime(checkInTime) : "—"}</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Sessions</div>
          <div className="stat-value">{log.filter((e) => e.type === "in").length || "—"}</div>
        </div>
      </div>

      {/* Activity Log */}
      {log.length > 0 && (
        <div className="log-section">
          <div className="log-title">Activity Log</div>
          {log.slice(0, 5).map((e) => (
            <LogEntry key={e.id} entry={e} />
          ))}
        </div>
      )}

    </div>
  );
}