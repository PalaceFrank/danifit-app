# CLAUDE.md — Danifit PWA

## Stack
- Next.js 14 (App Router) + TypeScript estricto
- Tailwind CSS (dark mode, mobile-first)
- Supabase (Auth + PostgreSQL + Realtime + Storage)
- Vercel para deploy
- Resend para emails de invitación
- Web Push API (VAPID) para notificaciones push

## Paleta de colores
- Fondo principal: #0a0a0a
- Superficie: #111111
- Acento pink: #E8185A
- Pink hover: #C4144A
- Texto: #ffffff / #888888
- Borde: #1e1e1e

## Estructura de rutas
- (auth): /login, /invite/[token] — públicas
- (student): /schedule, /feed, /tracker, /profile — alumnos activos
- (admin): /admin/* — solo rol admin
- /api: API routes (invitations, push)

## Roles
- admin: Daniel — gestiona todo
- student: alumno — acceso a schedule, feed, tracker, profile
- Status: pending → active → inactive

## Bloques horarios fijos (schedule)
- morning_a: 07:30–08:30
- morning_b: 08:46–09:45
- evening_a: 18:00–18:30
- evening_b: 19:00–21:00
- special: Sábados (actividades especiales)

## Fórmula % grasa
- US Navy method — src/lib/body-calc.ts
- Hombres: cuello + cintura + altura
- Mujeres: cuello + cintura + cadera + altura

## Variables de entorno
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
- NEXT_PUBLIC_VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT
- NEXT_PUBLIC_APP_URL

## Comandos útiles
- npm run dev → desarrollo local
- npm run build → verificar build
- npm run lint → ESLint
- npx tsc --noEmit → verificar TypeScript
- npx web-push generate-vapid-keys → generar VAPID keys

## Convenciones
- Componentes PascalCase
- Variables de entorno desde process.env, nunca hardcodeadas
- Mobile-first siempre: breakpoints md → lg
- Tipos en src/types/database.ts alineados con el schema SQL
