-- ============================================================================
-- Limpieza: elimina la opción de menú duplicada "Mantenimiento de Personas"
-- ------------------------------------------------------------------------
-- Ya existía la sub-opción "Personas" (dentro de "Mantenimiento", desde el
-- seed original) que SÍ funciona (pageRegistry.jsx la resuelve por su llave
-- 'personas'). "Mantenimiento de Personas" fue una opción nueva e
-- independiente que se dio de alta por accidente al aplicar
-- permisos_admin_personas.sql — nunca tuvo ninguna entrada en pageRegistry,
-- así que hacerle clic solo mostraba "en desarrollo".
--
-- Este script borra esa opción duplicada y su permiso asociado. Es seguro
-- correrlo más de una vez (si ya no existe, simplemente no borra nada).
-- ============================================================================

DELETE FROM permission_option
WHERE option_id IN (
    SELECT option_id FROM option WHERE option_de = 'Mantenimiento de Personas'
);

DELETE FROM option
WHERE option_de = 'Mantenimiento de Personas';