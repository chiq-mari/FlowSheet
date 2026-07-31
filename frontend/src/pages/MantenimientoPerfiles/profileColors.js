// Paleta de colores para distinguir perfiles visualmente (tarjetas resumen + pills),
// asignada por posición (índice) y no por nombre de perfil — así no queda hardcoded
// a "Administrador"/"Líder de Proyecto"/"Miembro de Equipo": si mañana se agrega un
// perfil nuevo, simplemente toma el siguiente color del ciclo.
const PALETTE = ['blue', 'green', 'purple'];

export function getProfileColor(index) {
  return PALETTE[index % PALETTE.length];
}
