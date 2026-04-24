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

### Autenticación
- Login con email y password (`/login`)
- Registro por invitación (`/invite/[token]`) — flujo completo con PKCE
- Auth callback (`/auth/callback`) para exchange de sesión
- Redirección post-login según rol: admin → `/admin/dashboard`, alumno → `/schedule`
- Middleware de protección de rutas (redirige a `/login` si no hay sesión)
- Función SQL `is_admin()` con `SECURITY DEFINER` para evitar recursión en políticas RLS

### Vista alumno
- **Schedule** (`/schedule`): muestra sesiones de la semana actual agrupadas por bloque horario
- **Feed** (`/feed`): lista posts del Coach con reacciones y comentarios. Árbol de respuestas. Estado vacío con ilustración.
- **Tracker** (`/tracker`): estructura base (en desarrollo)
- **Onboarding** (`/tracker/onboarding`): formulario de 4 pasos (datos básicos, meta, actividad, alimentación). Guarda en `user_body_profiles` con upsert correcto.
- **Perfil** (`/profile`): muestra nombre, email, rol, estado de cuenta con badge de color. Toggle de notificaciones push. Logout con doble confirmación. Avatar con iniciales.
- **Banner admin**: barra rosa en la parte superior cuando el usuario logueado es admin, con link directo al panel.

### Vista admin
- **Dashboard** (`/admin/dashboard`): 4 stats cards (alumnos activos, por activar, publicaciones, invitaciones). Indicador pulsante cuando hay alumnos pendientes. 4 acciones rápidas.
- **Feed** (`/admin/feed`): compositor de posts con tipo, texto e imagen. Lista de posts con fijar/desfijar y eliminar. Vista de reacciones por emoji con tooltip de nombres. Comentarios expandibles por post.
- **Alumnos** (`/admin/users`): lista con nombre, email, estado. Botón para activar/desactivar.
- **Invitaciones** (`/admin/invitations`): generador de links con nombre opcional. Lista con estado, fecha de expiración, botón copiar y botón eliminar.
- **Programa** (`/admin/schedule`): gestión de sesiones (estructura base implementada)
- **Navegación**: sidebar en desktop con estado activo resaltado. Bottom nav en mobile. Link "Vista alumno" al final del sidebar y en el bottom nav para volver a la vista de alumno.

### Sistema de UI
- Componentes: `Card`, `Button`, `Badge`, `Input`, `Skeleton`, `Toast`
- Toast con auto-dismiss a 3.5s, máximo 3 visibles, tipos success/error/info
- Esquema de colores dark consistente en toda la app

---

## Pendiente / por construir

### Tracker (prioridad media)
- Pantalla principal del tracker: mostrar última medida, % grasa calculado, historial en gráfico
- Formulario de nueva medida corporal
- Cálculo de % grasa con método US Navy (`src/lib/body-calc.ts`)

### Schedule (funcionalidad de alumno)
- Asistencia: el alumno debería poder confirmar o registrar asistencia a una clase

### Notificaciones push (infraestructura lista)
- API route `/api/push/subscribe` existe
- Falta: envío real de notificaciones desde el panel admin (ej. al publicar un post)

### Admin — mejoras menores
- Dashboard: hacer clic en "Publicaciones" y llevar al feed con los posts, no solo al número
- Alumnos: ver perfil físico de cada alumno desde el panel admin

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

---

## Notas técnicas importantes

- **RLS recursiva**: las políticas de admin originales hacían `SELECT` sobre `profiles` desde dentro de una policy de `profiles`. Resuelto con función `public.is_admin()` (SECURITY DEFINER).
- **Role check**: se usa `createClient()` (anon key + sesión del usuario) para verificar rol propio. `createAdminClient()` (service role) se reserva para queries que necesitan acceso a datos de otros usuarios.
- **Onboarding upsert**: requiere `{ onConflict: 'user_id' }` porque la tabla tiene constraint único en `user_id`, no en `id`.
- **Deploy**: Vercel auto-deploya cada push a `main`. Tiempo de build: ~35-40s.
