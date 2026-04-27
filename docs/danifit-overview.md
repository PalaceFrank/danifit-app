# Danifit — Descripción general

## Concepto

Danifit es una aplicación web progresiva (PWA) diseñada exclusivamente para el entrenador personal Daniel y sus alumnos. Funciona como plataforma privada de gestión: Daniel administra clases, publica contenido y hace seguimiento de sus alumnos; los alumnos consultan su programa, interactúan con el feed y registran su progreso físico.

No es una plataforma pública ni un marketplace — es una herramienta de uso cerrado para un único Coach y su grupo de alumnos activos.

---

## Aplicaciones (vistas)

### Vista Alumno
Accesible desde `/schedule`, `/feed`, `/tracker`, `/profile`.

Los alumnos acceden tras recibir una invitación del Coach y activar su cuenta.

### Vista Admin (Coach)
Accesible desde `/admin/*`.

Solo el usuario con rol `admin` puede acceder. Desde aquí el Coach gestiona todo el sistema.

---

## Funcionalidades

### Para el alumno
- **Programa de clases** (`/schedule`): visualiza las sesiones de la semana agrupadas por bloque horario (mañana A/B, tarde A/B, especial). Puede ver título, descripción, nivel y ubicación de cada clase.
- **Feed** (`/feed`): consume publicaciones del Coach (rutinas, avisos, motivación, resultados, nutrición). Puede reaccionar con emojis (💪 🔥 ❤️ 👏) y comentar.
- **Tracker** (`/tracker`): registra medidas corporales (peso, cuello, cintura, cadera, bícep, muslo). Visualiza progreso con cálculo de % grasa (método US Navy). Accede al onboarding de perfil físico.
- **Onboarding** (`/tracker/onboarding`): configura sexo biológico, fecha de nacimiento, altura, peso actual/objetivo, meta (bajar grasa / ganar músculo / mantener / resistencia), nivel de actividad y preferencias alimentarias.
- **Perfil** (`/profile`): ve su información, estado de cuenta, activa notificaciones push y cierra sesión.

### Para el Coach (admin)
- **Dashboard** (`/admin/dashboard`): resumen de alumnos activos, pendientes de activar, publicaciones e invitaciones pendientes. Sección de actividad reciente (últimas reacciones y comentarios, 7 días). Accesos rápidos a las secciones principales.
- **Programa** (`/admin/schedule`): crea, edita y cancela sesiones de entrenamiento para cualquier semana. Cada sesión tiene día, bloque horario, título, descripción, nivel, materiales y ubicación.
- **Asistencia** (`/admin/attendance`): selecciona sesión por semana y registra asistencia de cada alumno con toggle. Guardado inmediato al hacer clic.
- **Feed** (`/admin/feed`): redacta y publica posts con tipo (general, aviso, motivación, resultado, nutrición) e imagen opcional. Puede fijar posts destacados, eliminarlos, y ver las reacciones y comentarios de los alumnos por post.
- **Alumnos** (`/admin/users`): lista todos los alumnos con estado y búsqueda. Puede activar, desactivar o reactivar cuentas. Click en un alumno abre su perfil completo.
- **Perfil de alumno** (`/admin/users/[id]`): vista de seguimiento para el coach — perfil físico (altura, peso, objetivo, sexo, edad, actividad), stats actuales (peso / % grasa / cintura con delta total desde inicio), gráfico de progreso y historial completo de mediciones con fotos.
- **Invitaciones** (`/admin/invitations`): genera links de invitación únicos (expiran a 7 días) para que nuevos alumnos se registren. Puede copiar el link y eliminar invitaciones.

### Sistema de acceso
- **Registro por invitación**: los alumnos solo pueden registrarse a través de un link generado por el Coach (`/invite/[token]`).
- **Roles**: `admin` (Coach) y `student` (alumno). Los alumnos con estado `pending` ven el sistema pero el Coach debe activarlos manualmente.
- **Notificaciones push**: los alumnos pueden activar notificaciones web push (VAPID) para recibir avisos de clases y publicaciones.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS (dark mode, mobile-first) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (PKCE flow) |
| Storage | Supabase Storage (`post-images`, `progress-photos`) |
| Emails | Resend (invitaciones) |
| Push notifications | Web Push API + VAPID |
| Deploy | Vercel (auto-deploy desde `main`) |
| PWA | next-pwa + manifest.json |

### Estructura de base de datos (tablas principales)
- `profiles` — datos del usuario (nombre, email, rol, estado)
- `invitations` — links de invitación con token único
- `user_body_profiles` — perfil físico del alumno (onboarding)
- `body_measurements` — registros de medidas corporales
- `schedule_sessions` — sesiones de entrenamiento por semana
- `posts` — publicaciones del feed
- `post_reactions` — reacciones emoji a posts
- `post_comments` — comentarios en posts
- `attendance` — asistencia por sesión y alumno
- `push_subscriptions` — suscripciones push por usuario
- `notifications` — log de notificaciones enviadas

### Paleta de colores
- Fondo: `#0a0a0a`
- Superficie: `#111111`
- Acento: `#E8185A` (pink)
- Texto principal: `#ffffff`
- Texto secundario: `#888888`
- Borde: `#1e1e1e`
