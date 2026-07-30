import MantenimientoPersonas from './MantenimientoPersonas/MantenimientoPersonas';

// Mapea el nombre de la opción de menú (option_de, tal cual viene de la BD)
// al componente de página que debe renderizarse en el área principal del Dashboard.
// Agregar una nueva pantalla es solo agregar una entrada aquí: DashboardLayout
// nunca necesita conocer los componentes concretos de cada feature.
const pageRegistry = {
  'personas': MantenimientoPersonas,
};

export function resolveDashboardPage(optionDe) {
  if (!optionDe) return null;
  return pageRegistry[optionDe.toLowerCase().trim()] || null;
}
