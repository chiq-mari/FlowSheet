// src/pages/Member/ProgressLineChart.jsx
import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const LINE_COLORS = ['#3b82f6', '#16a34a', '#c2410c', '#7c3aed', '#db2777'];

const dateKey = (value) => {
  const d = new Date(value);
  return isNaN(d) ? String(value) : d.toISOString().slice(0, 10);
};

const truncate = (text, max = 20) => (text && text.length > max ? `${text.slice(0, max)}...` : text);

/**
 * Gráfica de línea: evolución del % de avance en el tiempo, una línea por actividad.
 * @param {Array} notifications - Notificaciones del proyecto seleccionado
 */
export function ProgressLineChart({ notifications }) {
  const { data, activityNames } = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)));
    const dates = [...new Set(sorted.map((n) => dateKey(n.date)))];
    const names = [...new Set(sorted.map((n) => n.assignment_name))];

    const points = dates.map((d) => {
      const point = { date: d };
      names.forEach((name) => {
        const match = sorted.filter((n) => dateKey(n.date) === d && n.assignment_name === name).pop();
        point[name] = match ? Number(match.progress_percentage) : null;
      });
      return point;
    });

    return { data: points, activityNames: names };
  }, [notifications]);

  if (data.length === 0) {
    return <p className="member-empty-text">No hay datos suficientes para graficar.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 45 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} />
        <Tooltip
          formatter={(value) => (value === null ? '-' : `${value}%`)}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11 }}
          formatter={(value) => truncate(value)}
        />
        {activityNames.map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            connectNulls={false}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
