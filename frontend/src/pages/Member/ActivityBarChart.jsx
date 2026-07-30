// src/pages/Member/ActivityBarChart.jsx
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const truncate = (text, max = 14) => (text && text.length > max ? `${text.slice(0, max)}...` : text);

/**
 * Gráfica de barras agrupadas: % de avance promedio y horas trabajadas totales, por actividad.
 * @param {Array} notifications - Notificaciones del proyecto seleccionado
 */
export function ActivityBarChart({ notifications }) {
  const data = useMemo(() => {
    const map = new Map();
    notifications.forEach((n) => {
      if (!map.has(n.assignment_name)) {
        map.set(n.assignment_name, { name: n.assignment_name, percentSum: 0, hoursSum: 0, count: 0 });
      }
      const entry = map.get(n.assignment_name);
      entry.percentSum += Number(n.progress_percentage || 0);
      entry.hoursSum += Number(n.total_hours_spent || 0);
      entry.count += 1;
    });
    return Array.from(map.values()).map((e) => ({
      name: truncate(e.name),
      fullName: e.name,
      '% Completado': Math.round(e.percentSum / e.count),
      'Hr de Trabajo': Number(e.hoursSum.toFixed(1)),
    }));
  }, [notifications]);

  if (data.length === 0) {
    return <p className="member-empty-text">No hay datos suficientes para graficar.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 45 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
        <Tooltip
          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="% Completado" fill="#93c5fd" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Hr de Trabajo" fill="#1c2b42" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
