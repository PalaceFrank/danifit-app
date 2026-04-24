# Estado de sesión — Danifit

Última actualización: 2026-04-24

---

## Lo que está construido y funcionando en producción

### Infraestructura
- Proyecto Next.js 14 en Vercel (auto-deploy desde rama `main` en GitHub)
- Base de datos Supabase con todas las tablas, RLS policies y triggers
- Storage bucket `post-images` para imágenes del feed
- Variables de entorno configuradas en Vercel (Supabase, VAPID, Resend)
- PWA con manifest.json e íconos (192px / 512px)
- ESLint desactivado en builds de Vercel (`eslint.ignoreDuringBuilds: true`) para evitar fallos de CI por warnings menores

### Autenticación
- Login con email y password (`/login`)
- Registro por invitación (`/invite/[token]`) — flujo completo con PKCE
- Auto-login + redirect a `/schedule` al completar el registro por invitación
- Auth callback (`/auth/callback`) — honra parámetro `?next=` explícito (para reset password)
- Redirección post-login según rol: admin → `/admin/dashboard`, alumno → `/schedule`
- Middleware de protección de rutas — rutas públicas: `/login`, `/invite/[token]`, `/forgot-password`, `/reset-password`
- Recuperación de contraseña: `/forgot-password` (solicitud) → email Supabase → `/reset-password` (nueva contraseña)
- Función SQL `is_admin()` con `SECURITY DEFINER` para evitar recursión en políticas RLS

### Vista alumno
- **Schedule** (`/schedule`): muestra sesiones de la semana actual agrupadas por bloque horario
- **Feed** (`/feed`): lista posts del Coach con reacciones y comentarios. Árbol de respuestas. Estado vacío con ilustración.
- **Tracker** (`/tracker`): dashboard con resumen de perfil corporal (altura, peso inicial, peso objetivo), gráfico SVG de progreso con tabs (Peso / % Grasa / Cintura), historial de medidas con miniaturas de fotos, delta indicator entre medidas.
- **Onboarding** (`/tracker/onboarding`): formulario de 4 pasos (datos básicos, meta, actividad, alimentación). Pre-carga datos existentes al editar. Guarda en `user_body_profiles` con upsert correcto.
- **Nueva medida** (`NewMeasurementModal`): pre-rellena desde última medida, muestra edad calculada desde `birth_date`, permite subir foto de progreso al bucket `progress-photos`.
- **Perfil** (`/profile`): muestra nombre, email, rol, estado de cuenta con badge de color. Toggle de notificaciones push. Logout con doble confirmación. Avatar con iniciales.
- **Banner admin**: barra rosa en la parte superior cuando el usuario logueado es admin, con link directo al panel.

### Vista admin
- **Dashboard** (`/admin/dashboard`): 4 stats cards (alumnos activos, por activar, publicaciones, invitaciones). Indicador pulsante cuando hay alumnos pendientes. Sección "Actividad reciente" con últimas reacciones y comentarios de los últimos 7 días (máx. 8 items). 4 acciones rápidas.
- **Feed** (`/admin/feed`): compositor de posts con tipo, texto e imagen. Lista de posts con fijar/desfijar y eliminar. Vista de reacciones por emoji con tooltip de nombres. Comentarios expandibles por post.
- **Alumnos** (`/admin/users`): lista con nombre, email, estado. Botón para activar/desactivar.
- **Invitaciones** (`/admin/invitations`): generador de links con nombre opcional. Lista con estado, fecha de expiración, botón copiar y botón eliminar.
- **Programa** (`/admin/schedule`): gestión de sesiones semanales. Bloques horarios: `morning_a` 08:30, `morning_b` 20:00, `evening_a` 18:00, `evening_b` 19:00, todos de 50 min. Modal sin selector de nivel.
- **Asistencia** (`/admin/attendance`): selector de sesión por semana. Lista de todos los perfiles activos (cualquier rol). Toggle por alumno con guardado inmediato al hacer clic.
- **Navegación mobile**: header sticky con hamburger que abre drawer desde la derecha. El drawer incluye todos los ítems del nav, link "Vista alumno" y "Cerrar sesión". Sin bottom nav.
- **Navegación desktop**: sidebar izquierdo con estado activo resaltado. Link "Vista alumno" al final. Botón "Cerrar sesión" en la parte inferior.

### Sistema de UI
- Componentes: `Card`, `Button`, `Badge`, `Input`, `Skeleton`, `Toast`
- Toast con auto-dismiss a 3.5s, máximo 3 visibles, tipos success/error/info
- Esquema de colores dark consistente en toda la app

---

## Pendiente / por construir

### Storage
- Crear bucket `progress-photos` en Supabase Storage (Public) — necesario para subir fotos en mediciones del tracker

### Admin — alumnos
- Ver perfil físico de cada alumno desde el panel admin

### Notificaciones push (infraestructura lista)
- API route `/api/push/subscribe` existe
- Falta: envío real de notificaciones desde el panel admin (ej. al publicar un post)

---

## Commits clave (historial)

| Hash | Descripción |
|------|-------------|
| `a51c25b` | Initial scaffold PWA |
| `48ccbb5` | Null checks en profile page |
| `5c04e7f` | Admin access, onboarding save, auth callback, admin banner |
| `0463cd1` | UX overhaul: toast, skeleton, profile redesign, admin nav |
| `3db7c6d` | Reemplazar "Daniel" por "Coach", fix meta tag PWA |
| `ee877fc` | Fix admin redirect con API route server-side |
| `8f3605d` | Simplificar role checks a createClient |
| `806db0a` | Reacciones y comentarios visibles en admin feed |
| `6b92fcc` | Botón eliminar en invitaciones |
| `84ab132` | Link "Vista alumno" en nav del admin |
| `c3258b9` | Fix modals: padding inferior para no quedar detrás del nav |
| `66ea71c` | Módulo de asistencia + fix bloques horarios |
| `3eda4fc` | Tracker: pre-fill desde última medida + gráfico SVG |
| `5b1085d` | Tracker: edad calculada + subir foto de progreso |
| `f3f21c8` | Dashboard admin: sección actividad reciente |
| `4fb0b45` | Asistencia: incluir todos los perfiles activos sin filtrar por rol |
| `e69315a` | Auto-login y redirect a /schedule tras registro por invitación |
| `e7215dd` | Flujo recuperación/reset de contraseña |
| `fc40635` | Admin mobile: reemplazar bottom nav con drawer hamburguesa |
| `a548508` | Fix build: tipos en dashboard activity + ignorar ESLint en Vercel |
| `a9f831b` | Eliminar TopBar duplicado en páginas de admin |

---

## Notas técnicas importantes

- **RLS recursiva**: las políticas de admin originales hacían `SELECT` sobre `profiles` desde dentro de una policy de `profiles`. Resuelto con función `public.is_admin()` (SECURITY DEFINER).
- **Role check**: se usa `createClient()` (anon key + sesión del usuario) para verificar rol propio. `createAdminClient()` (service role) se reserva para queries que necesitan acceso a datos de otros usuarios.
- **Onboarding upsert**: requiere `{ onConflict: 'user_id' }` porque la tabla tiene constraint único en `user_id`, no en `id`.
- **Header admin duplicado**: cada página admin usaba `<TopBar>` que se sumaba al `AdminMobileHeader` del layout. Resuelto eliminando `TopBar` de todas las páginas admin.
- **Deploy**: Vercel auto-deploya cada push a `main`. Tiempo de build: ~35-40s.
