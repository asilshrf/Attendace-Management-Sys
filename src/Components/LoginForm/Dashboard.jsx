import React, { useEffect, useState } from "react";
import "./Dashboard.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildMonthMatrix(dateAtFirstOfMonth) {
  const y = dateAtFirstOfMonth.getFullYear();
  const m = dateAtFirstOfMonth.getMonth();

  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const pad2 = (n) => String(n).padStart(2, "0");
const formatHMS = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${h}:${pad2(m)}:${pad2(r)}`;
};

const ymd = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const MINIMUM_SECONDS = 9 * 60 *60;

const Dashboard = ({ onLogout }) => {
  const [punchedIn, setPunchedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem("sessions");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const selectedKey = ymd(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const todayKey = ymd(today.getFullYear(), today.getMonth(), today.getDate());

  const isTodaySelected = selectedKey === todayKey;

  const monthMatrix = buildMonthMatrix(viewDate);

  useEffect(() => {
    try {
      localStorage.setItem("sessions", JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  useEffect(() => {
    if (!punchedIn || !startTime) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [punchedIn, startTime]);

  const isCurrentMonth =
    viewDate.getFullYear() === today.getFullYear() &&
    viewDate.getMonth() === today.getMonth();

  const handlePunch = () => {
    
    if (!isTodaySelected) {
      return;
    }

    if (!punchedIn) {
      setStartTime(Date.now());
      setElapsed(0);
      setPunchedIn(true);
    } else {
      const total = Math.floor((Date.now() - startTime) / 1000);
      setPunchedIn(false);
      setStartTime(null);
      setElapsed(total);

      if (selectedKey) {
        setSessions((prev) => ({
          ...prev,
          [selectedKey]: (prev[selectedKey] ?? 0) + total,
        }));
      }

      if (total < MINIMUM_SECONDS) {
        setMessage("9 hours not completed!");
      }
    }
  };

  const handleReset = () => {
    setSessions({});
    setStartTime(null);
    setElapsed(0);
    setPunchedIn(false);
    localStorage.removeItem("sessions");
  };

  const goPrev = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const goNext = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const handleSelectDay = (day) => {
    if (day) {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      setSelectedDate(newDate);
      
      const newKey = ymd(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      setElapsed(sessions[newKey] || 0);
    }
  };

  const handleLogout = () => onLogout && onLogout();
  const handleCloseMessage = () => setMessage("");
  const isTodayCell = (day) => isCurrentMonth && day === today.getDate();
  const isSelectedCell = (day) => selectedDate.getFullYear() === viewDate.getFullYear() && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getDate() === day;
  const isIncomplete = (key) => sessions[key] !== undefined && sessions[key] < MINIMUM_SECONDS;
  const isAbsent = (key) => {
    const dayDate = new Date(key + "T00:00:00");
    return dayDate < new Date(todayKey + "T00:00:00") && sessions[key] === undefined;
  };
  const timesheetRows = Object.entries(sessions).sort(([a], [b]) =>
    a < b ? 1 : -1
  );
  const canGoPrev = true;
  return (
    <>
      <div className="dashboard">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
        <aside className="timesheet-panel">
          <h3 className="timer-title">Timesheet</h3>
          {timesheetRows.length === 0 ? (
            <div className="timesheet-empty">No records yet.</div>
          ) : (
            <ul className="timesheet-list">
              {timesheetRows.map(([date, seconds]) => (
                <li key={date} className="timesheet-item">
                  <span className="timesheet-date">{date}</span>
                  <span className={`timesheet-duration ${seconds < MINIMUM_SECONDS ? 'incomplete' : ''}`}>
                    {formatHMS(seconds)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="center-stack">
          <h2 className="welcome-text">Welcome</h2>
          <button className="punch-btn" onClick={handlePunch} disabled={!isTodaySelected}>
            {punchedIn ? "Punch Out" : "Punch In"}
          </button>

          <div className="calendar">
            <div className="calendar-header">
              <button onClick={goPrev} disabled={!canGoPrev}>{"<"}</button>
              <div className="cal-title">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </div>
              <button onClick={goNext}>{">"}</button>
            </div>

            <table className="calendar-table">
              <thead>
                <tr>
                  <th>Su</th><th>Mo</th><th>Tu</th><th>We</th>
                  <th>Th</th><th>Fr</th><th>Sa</th>
                </tr>
              </thead>
              <tbody>
                {monthMatrix.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((day, di) => {
                      const dateKey =
                        day != null ? ymd(viewDate.getFullYear(), viewDate.getMonth(), day) : null;
                      
                      const classes = [
                        "cell",
                        day === null ? "empty" : "",
                        isTodayCell(day) ? "today" : "",
                        isSelectedCell(day) ? "selected" : "",
                        dateKey && isIncomplete(dateKey) ? "incomplete" : "",
                        dateKey && isAbsent(dateKey) ? "absent" : "",
                      ].filter(Boolean).join(" ");
                      return (
                        <td
                          key={di}
                          className={classes}
                          onClick={() => handleSelectDay(day)}
                          style={{ cursor: day ? "pointer" : "default" }}
                        >
                          {day ?? ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          <aside className="timer-panel">
          <h3 className="timer-title">Time Tracker</h3>

          <div className="timer-row">
            <div className="timer-label">Today's date</div>
            <div className="timer-value">
              {selectedKey}
            </div>
          </div>

          <div className="timer-row">
            <div className="timer-label">{punchedIn ? "Elapsed" : "Duration"}</div>
            <div className="timer-value timer-big">{formatHMS(elapsed)}</div>
          </div>

          <div className="timer-row">
            <div className="timer-label">Last saved</div>
            <div className="timer-value">
              {selectedKey && sessions[selectedKey] != null ? formatHMS(sessions[selectedKey]) : "—"}
            </div>
          </div>

          <button className="reset-btn" onClick={handleReset}>
            Reset Data
          </button>
        </aside>
      </div>
      {message && (
        <div className="message-box">
          <h4>Warning</h4>
          <p>{message}</p>
          <button onClick={handleCloseMessage}>OK</button>
        </div>
      )}
    </>
  );
};

export default Dashboard;