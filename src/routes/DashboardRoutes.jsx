import { useNavigate, useParams, Navigate } from "react-router-dom";
import { useTheme } from "../context/theme.js";
import MonthView from "../components/MonthView.jsx";
import WeekView from "../components/WeekView.jsx";
import DayView from "../components/DayView.jsx";

export function MonthRoute() {
  const navigate = useNavigate();
  return <MonthView onWeek={(wi) => navigate(`/dashboard/week/${wi}`)} onDay={(wi, di) => navigate(`/dashboard/week/${wi}/day/${di}`)} />;
}

export function WeekRoute({ monthData }) {
  const { weekIdx } = useParams();
  const navigate = useNavigate();
  const wi = parseInt(weekIdx, 10);
  const week = monthData[wi];
  if (!week) return <Navigate to="/dashboard" replace />;
  return <WeekView week={week} onDay={(di) => navigate(`/dashboard/week/${wi}/day/${di}`)} onBack={() => navigate("/dashboard")} />;
}

export function DayRoute({ monthData, plan }) {
  const t = useTheme();
  const { weekIdx, dayIdx } = useParams();
  const navigate = useNavigate();
  const wi = parseInt(weekIdx, 10);
  const di = parseInt(dayIdx, 10);
  const week = monthData[wi];
  const day = week?.days[di];
  if (!day) return <Navigate to="/dashboard" replace />;

  if (day.isRest) {
    return (
      <div>
        <button onClick={() => navigate(`/dashboard/week/${wi}`)} style={{ fontSize: 12, color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>&larr; Back to Week</button>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: t.text }}>Rest Day</div>
          <div style={{ fontSize: 14, color: t.textDim, marginTop: 8 }}>Recovery is part of the plan.</div>
        </div>
      </div>
    );
  }
  return <DayView day={day} planId={plan.planId} onBack={() => navigate(`/dashboard/week/${wi}`)} />;
}
