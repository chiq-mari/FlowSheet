import React, { useMemo } from 'react';
import { usePerfiles } from '../../hooks/usePerfiles';
import { getProfileColor } from './profileColors';
import PerfilSummaryCard from './PerfilSummaryCard';
import UsuarioPerfilesTable from './UsuarioPerfilesTable';
import '../../componentes/ui/DataTable.css';
import './MantenimientoPerfiles.css';

// Contenido de la pestaña "Ver Perfiles": tarjetas de resumen + grilla de usuarios.
const ResumenPerfilesTab = () => {
  const { resumen, usuarios, loading, error } = usePerfiles();

  // Mapea profile_id -> índice de color, calculado una sola vez a partir del resumen
  // (mismo orden que usa el backend: profile_de ASC), para que la tabla de abajo
  // pinte cada perfil con el mismo color que su tarjeta.
  const colorIndexByProfileId = useMemo(() => {
    const map = {};
    resumen.forEach((perfil, index) => {
      map[perfil.profile_id] = index;
    });
    return map;
  }, [resumen]);

  if (loading) {
    return <p className="data-table-status">Cargando perfiles...</p>;
  }

  return (
    <div className="perfiles-tab-body">
      {error && <p className="maintenance-load-error">{error}</p>}

      <div className="perfil-summary-grid">
        {resumen.map((perfil, index) => (
          <PerfilSummaryCard
            key={perfil.profile_id}
            color={getProfileColor(index)}
            count={perfil.user_count}
            label={perfil.profile_de}
          />
        ))}
      </div>

      <UsuarioPerfilesTable usuarios={usuarios} loading={false} colorIndexByProfileId={colorIndexByProfileId} />
    </div>
  );
};

export default ResumenPerfilesTab;
