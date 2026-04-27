---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments: ["docs/danifit-overview.md", "docs/session-state.md", "CLAUDE.md"]
lastStep: 14
completedAt: 2026-04-25
---

# Especificación de Diseño UX/UI — Danifit App

**Autor:** Francisco (sintetizado por Sally — UX Designer)
**Fecha:** 2026-04-25
**Versión:** 1.0

---

## Resumen Ejecutivo

### Visión del Proyecto

Danifit es una PWA privada para el Coach Daniel y sus alumnos. No compite en un mercado abierto — es una herramienta de relación: el Coach publica, guía y hace seguimiento; el alumno consume, registra y se mantiene comprometido. Su UX debe reflejar esa intimidad y exclusividad. Una app de primera clase en fitness no se parece a un dashboard corporativo — se parece a Strava, Nike Training Club o Whoop: **oscura, rápida, visual, con datos que motivan**.

### Usuarios Objetivo

**Alumno (student):**
- Usa la app principalmente en el teléfono, antes o después de entrenar
- Quiere saber rápido qué toca hoy, ver si el Coach publicó algo y registrar su progreso
- Tiene motivación variable — la app debe mantenerlo enganchado sin fricción
- Nivel técnico: intermedio (sabe usar apps móviles sociales)

**Coach (admin — Daniel):**
- Usa la app en desktop y móvil para gestionar
- Quiere eficiencia: publicar rápido, ver quién asistió, activar alumnos nuevos
- Es el único admin; la app debe darle control total sin complejidad

### Desafíos Clave de Diseño

1. **Engagement del alumno:** La app debe verse y sentirse premium para que los alumnos la abran por gusto, no solo por obligación.
2. **Velocidad de administración:** El Coach tiene poco tiempo — cada acción admin debe tomar máximo 2 taps/clicks.
3. **Motivación visual:** El tracker debe mostrar el progreso de forma que el alumno se sienta orgulloso de verlo.
4. **Consistencia multi-vista:** Dos experiencias muy distintas (student vs. admin) deben verse como un mismo producto.

### Oportunidades de Diseño

1. **Microinteracciones:** Pequeñas animaciones en reacciones, toggles de asistencia, guardado de medidas — hacen la app sentirse viva.
2. **Datos que cuentan una historia:** El tracker no es solo números — es una narrativa de progreso del alumno.
3. **Feed como hilo conductor:** El feed puede ser la pantalla más visitada si se diseña bien — como un Instagram privado del Coach.

---

## Experiencia de Usuario Central

### Definición de Experiencia

**Para el alumno:** *"Entrar, saber qué toca hoy, ver qué publicó el Coach, y en 30 segundos estar listo para entrenar."*

**Para el Coach:** *"En 2 minutos: publicar un post, marcar asistencia de la clase de hoy, y saber quién está activo."*

### Estrategia de Plataforma

- **Primario:** Mobile web / PWA instalable (iPhone y Android)
- **Secundario:** Desktop para el Coach (panel admin)
- **Touch-first:** Todos los targets mínimo 44×44px, gestos naturales
- **Offline consideration:** Schedule y última medida del tracker deben funcionar sin conexión (future)
- **PWA:** Instalable, pantalla completa, sin barra de navegador

### Interacciones Sin Fricción (deben sentirse automáticas)

- Ver el programa de la semana actual (debe cargarse instantáneo con skeleton)
- Reaccionar a un post (1 tap, animación inmediata)
- El Coach fija un post (1 tap, sin confirmación)
- Marcar asistencia de un alumno (toggle inmediato, sin "Guardar")
- Ver el último % de grasa registrado (visible en la pantalla principal del tracker)

### Momentos Críticos de Éxito

1. **Primera apertura tras registro:** El alumno llega a `/schedule` y ve su clase — ese momento debe "wow"
2. **Primera reacción al feed:** Toca el emoji y la animación lo hace querer hacerlo de nuevo
3. **Primera medida registrada:** Ve el gráfico con su primer punto — comprende que esto va a contar una historia
4. **Coach publica un post:** Ve los emojis acumularse en el dashboard — siente que sus alumnos están conectados

### Principios de Experiencia

1. **Velocidad percibida > velocidad real** — Skeletons, optimistic updates, animaciones de feedback
2. **Datos con significado** — Nunca mostrar un número sin contexto (vs. qué, vs. cuándo)
3. **Jerarquía clara** — Una acción primaria por pantalla; lo demás es secundario
4. **Dark = premium** — El dark mode no es una preferencia, es la identidad de la app
5. **Mobile-first sin concesiones** — Si algo no funciona bien con el pulgar, no está terminado

---

## Respuesta Emocional Deseada

### Objetivos Emocionales Primarios

**Alumno:**
- **Pertenencia:** "Soy parte del grupo de Daniel, tenemos nuestra propia app"
- **Motivación:** "Ver mi progreso me dan ganas de seguir"
- **Confianza:** "Sé exactamente qué tengo que hacer esta semana"

**Coach:**
- **Control:** "Tengo todo bajo control desde mi teléfono"
- **Conexión:** "Puedo ver que mis alumnos están enganchados"
- **Eficiencia:** "Administrar esto no me quita tiempo de entrenar"

### Mapa Emocional del Alumno

| Momento | Emoción Deseada | Emoción a Evitar |
|---------|----------------|-----------------|
| Abrir la app | Anticipación, facilidad | Confusión, lentitud |
| Ver el schedule | Claridad, seguridad | Sobrecarga de info |
| Leer el feed | Inspiración, comunidad | Indiferencia |
| Registrar medida | Orgullo, motivación | Vergüenza, complejidad |
| Ver el gráfico | Satisfacción, proyección | Desmotivación |

### Implicaciones de Diseño

- **Pertenencia →** Logo "DF" consistente, tono warm en los textos, nombre del Coach siempre presente
- **Motivación →** Gráficos con tendencia ascendente resaltada en pink, delta positivo en verde
- **Confianza →** Información clara, estados visuales inequívocos (activo/pendiente/pasado)
- **Orgullo →** Foto de progreso prominent, comparación antes/después visible
- **Eficiencia admin →** Acciones en 1-2 taps, sin confirmaciones para acciones reversibles

### Emociones a Evitar

- Confusión por información redundante o mal jerarquizada
- Frustración por formularios largos sin progreso visible
- Vergüenza por datos de salud expuestos sin contexto positivo
- Ansiedad por estados de error sin instrucción clara de qué hacer

---

## Análisis de Patrones UX e Inspiración

### Productos Inspiradores Analizados

**Strava (referencia principal para el Tracker)**
- Progreso en anillos/líneas con contexto temporal
- Célula de stat: número grande + label pequeño + comparación
- Feed social de actividades con reacciones rápidas
- **Adoptar:** Card de stat, gráfico de línea, feed de actividad

**Nike Training Club (referencia para Schedule y Feed)**
- Cards de sesión oscuras con imagen, título bold, metadata pequeña
- Estado de sesión claro: PRÓXIMA / EN CURSO / COMPLETADA
- Categorías coloreadas por tipo de entrenamiento
- **Adoptar:** Session card, estado visual, categoría badge

**Whoop (referencia para el Dashboard del Coach)**
- Stats grandes y legibles en cards oscuras
- Comparación "hoy vs. promedio" inmediata
- Colores semafóricos: rojo/amarillo/verde para estados
- **Adoptar:** Stat card con comparación, color semafórico

**Instagram (referencia para el Feed)**
- Reacciones inmediatas con microanimación
- Comentarios en sheet modal, no en página nueva
- Posts pinnados visibles al tope
- **Adoptar:** Sheet de comentarios, animación de reacción, pin visual

### Patrones Transferibles

**Navegación:**
- Bottom nav fija con 4 ítems máximo (student) — proven en fitness apps
- Admin: sidebar en desktop, drawer en mobile — patrón establecido

**Cards de contenido:**
- Fondo `surface` (#111111), borde sutil, `border-radius: 16px`
- Contenido con padding generoso (16px), sin texto cortado
- Tap target full-width para navegación

**Feedback de acciones:**
- Optimistic UI: mostrar resultado antes de confirmar con servidor
- Toast para confirmaciones no críticas (éxito silencioso)
- Shake animation para errores de validación

### Anti-patrones a Evitar

- Modales encima de modales (sheet → alert → confirm: no)
- Formularios de una columna en desktop con mucho espacio vacío
- Iconos sin label en navegación mobile
- Mensajes de error genéricos ("Algo salió mal")
- Loading spinners globales que bloquean toda la UI

---

## Fundación del Sistema de Diseño

### Elección del Sistema

**Sistema:** Custom Tailwind CSS — mantener y elevar el sistema existente.

**Rationale:**
- Ya existe y está integrado en Next.js 14 + App Router
- Dark mode por defecto — no requiere adaptar un sistema light-first
- Tailwind JIT permite diseño preciso sin overhead
- Stack del equipo ya lo domina
- Customización total para la identidad Danifit

### Tokens de Diseño — Estado Actual y Mejoras

#### Paleta de Colores (mantener, extender)

```
/* Existentes — mantener */
--color-bg:          #0a0a0a   /* background */
--color-surface:     #111111   /* cards, inputs */
--color-surface-2:   #1a1a1a   /* NUEVO: hover states, nested cards */
--color-pink:        #E8185A   /* acento principal */
--color-pink-hover:  #C4144A   /* hover del acento */
--color-pink-muted:  rgba(232,24,90,0.10)  /* fondos suaves pink */
--color-border:      #1e1e1e   /* bordes */
--color-border-light:#2a2a2a   /* NUEVO: separadores internos */
--color-text:        #ffffff   /* texto primario */
--color-text-muted:  #888888   /* texto secundario */
--color-text-subtle: #555555   /* NUEVO: texto terciario/placeholder */

/* Semánticos — NUEVOS */
--color-success:     #22c55e   /* verde: métricas positivas, activo */
--color-warning:     #f59e0b   /* amarillo: pendiente, atención */
--color-error:       #ef4444   /* rojo: error, desactivado */
--color-info:        #3b82f6   /* azul: info, invitaciones */
```

#### Tipografía — Sistema Claro

```
/* Escala tipográfica — Tailwind classes */
--text-xs:    12px / 1.4  (metadata, timestamps, labels)
--text-sm:    14px / 1.5  (body secundario, descripciones)
--text-base:  16px / 1.5  (body principal)
--text-lg:    18px / 1.4  (subtítulos de sección)
--text-xl:    20px / 1.3  (títulos de página)
--text-2xl:   24px / 1.2  (valores de stats)
--text-3xl:   30px / 1.1  (valores de stats grandes)
--text-4xl:   36px / 1.0  (número hero en dashboard)

/* Pesos */
font-normal:   400  (body text)
font-medium:   500  (labels activos, nombres)
font-semibold: 600  (subtítulos, valores)
font-bold:     700  (títulos de sección)
font-black:    900  (valores hero, stats prominentes)

/* Fuente: Inter (ya en uso vía Tailwind) — no cambiar */
```

#### Espaciado — Grid de 4px

```
/* Escala 4px — Tailwind spacing */
1  =  4px   (gap mínimo entre elementos relacionados)
2  =  8px   (padding interno de badges, gap entre icono+label)
3  = 12px   (gap entre items de lista)
4  = 16px   (padding estándar de cards)
5  = 20px   (padding de sección)
6  = 24px   (margin entre secciones)
8  = 32px   (separación entre bloques mayores)
```

#### Border Radius — Consistencia

```
rounded-lg:    8px   (badges, botones pequeños, inputs)
rounded-xl:    12px  (botones principales, chips)
rounded-2xl:   16px  (cards estándar)  ← estándar de la app
rounded-3xl:   24px  (modales, bottom sheets)
rounded-full:  9999px (avatares, toggles)
```

#### Sombras y Elevación

```
/* Sombras sutiles para dark mode */
shadow-sm:   0 1px 2px rgba(0,0,0,0.4)       (inputs focused)
shadow:      0 2px 8px rgba(0,0,0,0.5)        (cards hover)
shadow-lg:   0 8px 24px rgba(0,0,0,0.6)       (modales, drawers)
shadow-pink: 0 4px 16px rgba(232,24,90,0.25)  (CTA buttons)
```

---

## Dirección de Diseño

### Dirección Seleccionada: "Premium Dark Fitness"

**Concepto:** Una app que se siente como herramienta profesional, no como formulario web. Inspirada en Strava/Whoop en cuanto a presentación de datos, en Instagram en cuanto al feed, en Nike Training Club en cuanto a las sesiones.

**Características visuales:**
- Fondo muy oscuro (#0a0a0a) con cards en superficie (#111111) — no flat, hay jerarquía
- El pink (#E8185A) se usa con disciplina: solo en acciones primarias y datos clave
- Tipografía bold y grande para los números que importan
- Imágenes/emojis como elementos visuales anchor (no solo texto)
- Microinteracciones suaves: scale, opacity, color transitions a 200ms

**Qué NO es esta app:**
- No es un dashboard de analytics corporativo
- No usa colores pasteles ni modo claro
- No tiene tablas densas ni formularios de 10 campos
- No tiene navegación de 6+ niveles de profundidad

---

## Journeys de Usuario

### Journey 1: Alumno — "Ver mi semana y prepararme"

```mermaid
flowchart TD
    A[Abrir app / Login] --> B[/schedule - Vista semanal]
    B --> C{¿Hay sesión hoy?}
    C -->|Sí| D[Session Card expandida con detalles]
    C -->|No| E[Estado: Sin sesión hoy + próxima sesión]
    D --> F[Tap para ver descripción completa]
    F --> G[Bottom sheet con info completa]
    G --> H[Cerrar → volver al schedule]
```

**Optimizaciones UX:**
- La sesión MÁS PRÓXIMA debe aparecer highlighted automáticamente
- Scroll horizontal entre días de la semana — no scroll vertical largo
- Si no hay sesión hoy, mostrar "Próxima sesión" con countdown

### Journey 2: Alumno — "Interactuar con el feed"

```mermaid
flowchart TD
    A[/feed] --> B[Lista de posts]
    B --> C[Post card visible]
    C --> D{¿Quiere reaccionar?}
    D -->|Sí| E[Tap en emoji → animación bounce → contador +1]
    D -->|No| F{¿Quiere comentar?}
    F -->|Sí| G[Tap en comentar → bottom sheet]
    G --> H[Escribir + enviar]
    H --> I[Comentario aparece en lista sin reload]
```

**Optimizaciones UX:**
- Barra de emojis siempre visible en el post card (no hidden tras botón)
- Comentarios en bottom sheet (no navegación a nueva página)
- Long-press en emoji para ver lista de quién reaccionó

### Journey 3: Alumno — "Registrar medidas"

```mermaid
flowchart TD
    A[/tracker] --> B[Dashboard con última medida]
    B --> C[CTA: + Nueva medida]
    C --> D[Bottom sheet del formulario]
    D --> E[Campos pre-rellenos desde última medida]
    E --> F[Modificar los que cambiaron]
    F --> G[Subir foto opcional]
    G --> H[Guardar]
    H --> I[Gráfico actualizado con nueva línea]
    I --> J[Toast: Medida guardada + delta vs. anterior]
```

**Optimizaciones UX:**
- Solo pedir los campos que cambian habitualmente (peso, cintura)
- Los demás colapsados en "Más medidas" expandible
- Foto: camera/gallery con preview antes de guardar

### Journey 4: Coach — "Publicar un post rápido"

```mermaid
flowchart TD
    A[/admin/feed] --> B[Compositor en top de página]
    B --> C[Escribir texto + seleccionar tipo]
    C --> D{¿Agregar imagen?}
    D -->|Sí| E[Tap en ícono imagen → picker]
    D -->|No| F[Tap Publicar]
    E --> F
    F --> G[Optimistic: post aparece al tope de la lista]
    G --> H[Toast: Publicado ✓]
```

### Journey 5: Coach — "Marcar asistencia"

```mermaid
flowchart TD
    A[/admin/attendance] --> B[Semana actual + sesiones]
    B --> C[Seleccionar sesión del día]
    C --> D[Lista de alumnos con toggle]
    D --> E[Tap en alumno → toggle inmediato]
    E --> F[Guardado automático sin botón]
    F --> G[Resumen: X/Y asistieron]
```

### Patrones de Journey Comunes

**Navegación:** Tab bar fixed en bottom (student) / sidebar (admin desktop)
**Feedback:** Optimistic UI + toast de confirmación
**Errores:** Inline, en rojo, sin perder el contenido del formulario
**Vacío:** Illustrated empty states con CTA claro

---

## Estrategia de Componentes

### Componentes Existentes — Mejoras

#### `Card` — Elevar

**Actual:** `bg-surface border border-border rounded-2xl`
**Mejorado:**
```tsx
// Variantes:
<Card>              // default: surface + border
<Card elevated>     // + shadow sutil en hover
<Card interactive>  // + hover:border-pink/30 + active:scale-[0.98]
<Card glass>        // NUEVO: bg-white/5 backdrop-blur (para overlays)
```

#### `Button` — Jerarquía clara

```tsx
// Primario — acción principal de pantalla
<Button variant="primary">   // bg-pink text-white shadow-pink hover:bg-pink-hover
// Secundario — acción complementaria
<Button variant="secondary"> // bg-white/10 text-white hover:bg-white/15
// Ghost — acción terciaria
<Button variant="ghost">     // text-text-muted hover:text-white hover:bg-white/5
// Danger — destructivo
<Button variant="danger">    // text-red-400 hover:bg-red-900/20
// Tamaños:
<Button size="sm">  // h-8 px-3 text-xs
<Button size="md">  // h-10 px-4 text-sm  ← default
<Button size="lg">  // h-12 px-6 text-base
<Button fullWidth>  // w-full
```

#### `Input` — Mejorar estados

```tsx
// Estado: default, focused, error, disabled
// focused: border-pink/60 + ring-1 ring-pink/20
// error: border-red-500/60 + mensaje inline debajo
// disabled: opacity-50 cursor-not-allowed
// Siempre: label flotante o label encima (no placeholder-only)
```

#### `Badge` — Ampliar semántica

```tsx
<Badge variant="active">    // bg-green-900/30 text-green-400 border-green-800/40
<Badge variant="pending">   // bg-yellow-900/30 text-yellow-400 border-yellow-800/40
<Badge variant="inactive">  // bg-white/5 text-text-muted border-white/10
<Badge variant="pink">      // bg-pink/10 text-pink border-pink/20
<Badge variant="info">      // bg-blue-900/30 text-blue-400 border-blue-800/40
```

### Componentes Nuevos Requeridos

#### `StatCard` — Dashboard y Tracker

```tsx
// Props: label, value, delta?, icon?, href?, color?, urgent?
// Layout:
// ┌─────────────────┐
// │ [icon]          │
// │                 │
// │ 42              │  ← text-4xl font-black text-{color}
// │ Alumnos activos │  ← text-xs text-text-muted
// │ ↑ +3 este mes   │  ← NUEVO: delta indicator (opcional)
// └─────────────────┘
// Animación: número animado al cargar (countup de 0 → valor en 600ms)
```

#### `SessionCard` — Schedule (alumno y admin)

```tsx
// Estados: upcoming, today, past, cancelled
// ┌──────────────────────────────────┐
// │ [BADGE: HOY / PRÓXIMA / PASADA]  │
// │ 08:30 — 09:20                    │  ← horario bold
// │ Fuerza + Cardio                  │  ← título
// │ 📍 Sala Principal · Intermedio   │  ← meta inline
// │                                  │
// │ [Detalles →]                     │  ← expandible
// └──────────────────────────────────┘
// Estado "today": borde pink, fondo pink/5
// Estado "past": opacity-60, grayscale sutil
```

#### `PostCard` — Feed

```tsx
// ┌──────────────────────────────────┐
// │ [📌 FIJADO]  (si pinnado)        │
// │ [Badge tipo: MOTIVACIÓN]         │
// │                                  │
// │ Texto del post...                │
// │                                  │
// │ [imagen si existe]               │
// │                                  │
// │ hace 2h                          │
// ├──────────────────────────────────┤
// │ 💪 3  🔥 2  ❤️ 1  👏 1         │  ← emojis siempre visibles
// │               [💬 Comentar]      │
// └──────────────────────────────────┘
// Tap en emoji: bounce animation + optimistic counter
// Tap en "Comentar": bottom sheet con thread
```

#### `ProgressRing` — Tracker dashboard

```tsx
// SVG circular progress
// Props: value (0-100), label, sublabel, color
// Centro: número grande + unidad
// Outer ring: color semántico (verde si mejora, pink si neutral)
// Uso: % grasa, progreso hacia objetivo de peso
```

#### `BottomSheet` — Modal móvil

```tsx
// Reemplaza modales centrados en mobile
// Slide up desde abajo, backdrop oscuro
// Handle visible en top (drag para cerrar)
// max-h: 90dvh con scroll interno
// Uso: comentarios, detalle de sesión, nueva medida, editar post
```

#### `EmptyState` — Estados vacíos

```tsx
// Props: icon, title, description, action?
// Layout: centrado vertical, icono grande (48px), texto, CTA
// Variantes: feed vacío, sin medidas, sin alumnos, sin sesiones
// Tono: amigable y con dirección ("Publica tu primer post →")
```

#### `AvatarStack` — Lista de asistencia resumida

```tsx
// Stack de avatares con iniciales superpuestos
// +N si hay más de 4
// Uso: en SessionCard del admin para mostrar quién asistió
```

#### `ToggleSwitch` — Asistencia y estados

```tsx
// Animated toggle: off (bg-white/10) → on (bg-pink)
// Thumb: circle blanco, transition 200ms
// Tamaño: 44px × 24px (touch compliant)
// Con label a la derecha
```

#### `ChartLine` — Gráfico de progreso (mejorar el SVG actual)

```tsx
// Mejoras sobre el SVG actual:
// - Área de gradiente con fade hacia el fondo
// - Puntos interactivos: tap para ver tooltip con valor + fecha
// - Línea suavizada (cubic bezier, no lineal)
// - Eje Y con valores cada 25% de altura
// - Si solo 1 punto: mostrar punto solo + mensaje "Agrega otra medida"
// - Animación de entrada: línea se dibuja de izquierda a derecha (1s)
```

---

## Especificaciones por Pantalla

### Vista Alumno

#### `/schedule` — Programa semanal

**Problemas actuales:** Layout estático, sin énfasis en la sesión de hoy, sin interacción en las cards.

**Mejoras:**
1. **Header de semana:** Navegación `← semana anterior | semana actual | semana siguiente →` con el rango de fechas. La semana actual es el default.
2. **Indicador de día actual:** El día de hoy va highlighted en la fila de días.
3. **SessionCard con estado:**
   - `today`: borde izquierdo pink de 3px, fondo `bg-pink/5`
   - `upcoming`: normal
   - `past`: `opacity-50`
   - `cancelled`: `line-through text-text-muted`
4. **Expandible:** Tap en card → bottom sheet con descripción completa, nivel, ubicación, materiales
5. **Empty day:** "Sin sesión hoy — descansa y recupérate 💪" con ilustración mínima

**Layout:**
```
┌─ sticky header ──────────────────────┐
│  ← Abr 21–27, 2026 →                │
│  L  M  X  J  V  S  D                │  ← días con dot si hay sesión
│     [hoy]                            │
└──────────────────────────────────────┘
┌─ bloque: MAÑANA ─────────────────────┐
│  SessionCard (08:30)                 │
│  SessionCard (20:00)                 │
└──────────────────────────────────────┘
┌─ bloque: TARDE ──────────────────────┐
│  SessionCard (18:00)                 │
│  SessionCard (19:00)                 │
└──────────────────────────────────────┘
```

---

#### `/feed` — Feed del Coach

**Problemas actuales:** Emojis como botones pequeños, comentarios en página separada, sin distinción visual de posts pinnados.

**Mejoras:**
1. **Posts pinnados:** Badge "📌 Fijado" en top del card + `border-pink/30`
2. **Reacciones siempre visibles:** Fila de emojis con contador debajo del post, no tras un botón
3. **Animación de reacción:** Al tocar emoji → scale 1.4 → 1.0 (bounce, 300ms) + contador incrementa
4. **"Ya reaccioné":** El emoji seleccionado tiene `bg-pink/10 border-pink/30` y está `font-bold`
5. **Comentarios en bottom sheet:** No navegar a otra página — sheet desliza desde abajo
6. **Tipo de post visible:** Badge de color por tipo (Motivación=pink, Aviso=yellow, Nutrición=green, General=gray)
7. **Imágenes:** `aspect-video` (16:9), `object-cover`, `rounded-xl` debajo del texto

**PostCard mejorado:**
```
┌──────────────────────────────────────┐
│ [📌 FIJADO]  [MOTIVACIÓN]           │
│                                      │
│ "Hoy es día de fuerza. Recuerden..." │
│                                      │
│ [imagen 16:9]                        │
│                                      │
│ hace 2 horas                         │
├──────────────────────────────────────┤
│  💪 3   🔥 2   ❤️ 1   👏 1          │
│                    [💬 5 comentarios]│
└──────────────────────────────────────┘
```

---

#### `/tracker` — Seguimiento de progreso

**Problemas actuales:** Dashboard aún básico, gráfico SVG funcional pero sin interactividad, historial sin fotos prominentes.

**Mejoras — Dashboard:**
```
┌─ hero card ──────────────────────────┐
│  Tu progreso                         │
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │ 78.5 │  │ 22.4%│  │ 82cm │      │
│  │ Peso │  │% Gras│  │Cintur│      │
│  │↓1.5kg│  │↓0.8% │  │↓2cm  │      │  ← delta desde primer registro
│  └──────┘  └──────┘  └──────┘      │
└──────────────────────────────────────┘
┌─ gráfico ────────────────────────────┐
│  [Peso] [% Grasa] [Cintura]  ← tabs │
│                                      │
│  [ChartLine mejorado]               │
│                                      │
└──────────────────────────────────────┘
┌─ acciones ───────────────────────────┐
│  [+ Nueva medida]  [Ver historial]  │
└──────────────────────────────────────┘
┌─ historial ──────────────────────────┐
│  25 Abr 2026                         │
│  Peso: 78.5 · Cintura: 82 · 22.4%  │
│  [foto miniatura si existe]          │
│  ─────────────────────────────────  │
│  15 Abr 2026                         │
│  ...                                 │
└──────────────────────────────────────┘
```

**Mejoras — Nueva medida (bottom sheet):**
- Campos esenciales visibles: Peso, Cintura
- "Más medidas" expandible: Cuello, Cadera, Bícep, Muslo
- Altura y edad auto-calculados (read-only con icono de info)
- % grasa calculado en tiempo real mientras se tipea (aparece debajo)
- Foto: botón grande con ícono cámara, preview circular si ya hay foto

---

#### `/profile` — Perfil del alumno

**Problemas actuales:** Layout básico, poca personalidad visual.

**Mejoras:**
```
┌─ header ─────────────────────────────┐
│         [Avatar grande 80px]         │
│         Francisco Palacios           │
│         [badge: Alumno Activo]       │
└──────────────────────────────────────┘
┌─ stats rápidos ──────────────────────┐
│  5 medidas · Desde ene 2026          │
└──────────────────────────────────────┘
┌─ sección: Cuenta ────────────────────┐
│  📧 email@ejemplo.com               │
│  🔔 Notificaciones push [toggle]    │
└──────────────────────────────────────┘
┌─ sección: Acciones ──────────────────┐
│  Editar perfil físico               │
│  Cambiar contraseña                 │
└──────────────────────────────────────┘
┌─ peligro ────────────────────────────┐
│  [Cerrar sesión]                    │
└──────────────────────────────────────┘
```

---

### Vista Admin (Coach)

#### `/admin/dashboard` — Panel principal

**Problemas actuales:** Stats cards bien pero números sin tendencia, actividad reciente funcional pero texto se corta.

**Mejoras:**
1. **StatCards mejorados:** Agregar delta vs. semana anterior ("↑ 2 vs. semana pasada")
2. **Actividad reciente:** Separar nombre en línea 1, acción + snippet en línea 2 (ya fixed el truncate)
3. **Quick actions:** Agregar descripción de estado actual ("3 sesiones esta semana")
4. **Greeting:** "Hola, Coach. Tienes X alumnos activos hoy." en top

---

#### `/admin/feed` — Gestión del feed

**Problemas actuales:** Compositor funcional, engagement visible pero mejorable.

**Mejoras:**
1. **Compositor más visual:** Preview del post mientras se escribe, tipo con ícono de color
2. **Post list:** PostCard admin con botones de acción en hover (pin/unpin, delete)
3. **Engagement summary en card:** "💪3 🔥2 · 💬4 comentarios" — tap para expandir
4. **Imagen:** Preview con botón de remover antes de publicar
5. **Filtro por tipo:** Tabs o chips para filtrar la lista (Todos / Avisos / Motivación / etc.)

---

#### `/admin/attendance` — Asistencia

**Problemas actuales:** UI funcional pero poco informativa (no se ve el total de asistentes de un vistazo).

**Mejoras:**
1. **Summary header:** "Sesión: Fuerza A · Hoy 08:30 · 3/8 asistieron" en top del card
2. **Alumno card con avatar + nombre:** No solo texto plano
3. **Toggle animado:** Más visible el estado on/off
4. **Guardar feedback:** Flash verde en el row cuando se guarda (ya es instant pero necesita feedback visual)
5. **Historial de sesiones:** Dropdown de semana + sesión, con tabs por bloque

---

#### `/admin/users` — Gestión de alumnos

**Problemas actuales:** Lista simple sin info extra útil.

**Mejoras:**
1. **User card expandida:** Avatar con iniciales, nombre, email, fecha de registro, estado badge
2. **Acciones inline:** Activar/Desactivar con toggle (no botón de texto)
3. **Búsqueda:** Input de filtro por nombre en el top
4. **Click para perfil:** Tap en el card → vista del perfil físico del alumno (si tiene onboarding)
5. **Contadores en header:** "8 activos · 2 pendientes · 1 inactivo"

---

#### `/admin/invitations` — Invitaciones

**Problemas actuales:** Funcional, mejorable visualmente.

**Mejoras:**
1. **Link de copia mejorado:** Mostrar URL truncada + botón "Copiar" más visible
2. **Estado visual claro:** Badge pending/used/expired con iconografía
3. **Expiración:** Countdown si quedan < 24h ("Expira en 3h")
4. **Input de nombre:** Placeholder más descriptivo ("Nombre del alumno (opcional)")

---

## Patrones de Consistencia UX

### Jerarquía de Botones

```
Por pantalla: máximo 1 botón primario visible
Primario: bg-pink, texto blanco, shadow-pink — la acción más importante
Secundario: bg-white/10, texto blanco — acción alternativa
Ghost: solo texto, sin fondo — acción terciaria o destructiva
FAB (mobile): botón circular flotante para la acción principal de creación
```

### Patrones de Feedback

| Situación | Patrón |
|-----------|--------|
| Guardado exitoso silencioso | Toast verde bottom, auto-dismiss 3s |
| Acción destructiva | Toast rojo con opción "Deshacer" (cuando aplique) |
| Error de red | Toast rojo + botón "Reintentar" |
| Cargando | Skeleton screens (no spinner global) |
| Sin conexión | Banner amarillo sticky en top |
| Validación de form | Error inline debajo del campo, en rojo, texto descriptivo |

### Patrones de Formulario

```
Label: siempre visible encima del input (no placeholder-only)
Placeholder: texto de ayuda, no el nombre del campo
Error: debajo del input, text-red-400, text-sm
Success: borde green/60 cuando el campo es válido
Required: asterisco (*) en el label, no en el placeholder
Submit: siempre al fondo del formulario o sticky en bottom sheets
```

### Patrones de Navegación

**Alumno (mobile-first):**
```
Bottom nav: 4 ítems (Schedule, Feed, Tracker, Profile)
Activo: ícono + label en pink
Inactivo: ícono + label en text-muted
Nuevo badge: dot rosado sobre el ícono de feed si hay posts nuevos
```

**Admin (dual):**
```
Mobile: hamburger drawer desde la derecha (ya implementado)
Desktop: sidebar izquierdo 240px
Ambos: indicador activo en pink, logout al fondo
```

### Patrones de Modales y Sheets

```
Mobile (< md): siempre usar BottomSheet (slide up)
Desktop (≥ md): Dialog centrado con overlay
Cierre: X en top-right + tap en backdrop + swipe down (bottom sheets)
Profundidad máxima: 1 nivel (no sheets dentro de sheets)
```

### Estados Vacíos

```
Icono: 48px, color text-text-muted
Título: text-lg font-semibold text-white
Descripción: text-sm text-text-muted, 1-2 líneas
CTA: Button primario si hay acción posible

Variantes:
- Feed vacío: "El Coach aún no ha publicado nada. ¡Muy pronto!"
- Tracker sin medidas: "Registra tu primera medida y empieza a ver tu progreso"
- Sin sesiones esta semana: "El Coach no ha programado sesiones esta semana"
- Sin alumnos: "Invita a tus primeros alumnos para comenzar"
```

### Loading / Skeleton

```
Skeleton: bg-white/5 animate-pulse rounded
Siempre mostrar la estructura de la pantalla mientras carga
Nunca spinner que bloquee toda la pantalla
Tiempo mínimo de skeleton: 300ms (evitar flash si es rápido)
```

---

## Diseño Responsive y Accesibilidad

### Estrategia Responsive

**Mobile (< 768px) — Primario:**
- Stack vertical de todo el contenido
- Bottom nav fija
- Cards a full-width con padding px-4
- Formularios en bottom sheets
- Texto mínimo 14px (legible sin zoom)

**Tablet (768px–1023px):**
- Grid de 2 columnas para cards de stats
- Feed puede mostrar 2 columnas
- Bottom nav o sidebar colapsado (icono-only)

**Desktop (≥ 1024px):**
- Admin: sidebar fijo, contenido max-w-4xl centrado
- Student: max-w-2xl centrado (es una app mobile, no usar toda la pantalla)
- Cards de stats en grid 4 columnas
- Modales en lugar de bottom sheets

### Breakpoints (Tailwind defaults)

```
sm:  640px   (teléfonos grandes)
md:  768px   (tablet / admin layout change)
lg:  1024px  (desktop)
xl:  1280px  (solo para ajustes menores de admin)
```

### Estrategia de Accesibilidad (WCAG AA)

**Contraste de color:**
- Texto sobre fondo: blanco (#fff) sobre #0a0a0a → 21:1 ✅
- Texto muted (#888) sobre #0a0a0a → 5.3:1 ✅
- Pink (#E8185A) sobre #0a0a0a → verificar con texto grande
- Nunca usar text-subtle (#555) para texto de lectura, solo decorativo

**Touch targets:**
- Mínimo 44×44px para todos los elementos interactivos
- Bottom nav items: min-h-14 con área táctil completa
- Toggles: min 44px de altura
- Emojis de reacción: min 44×44px cada uno

**Navegación por teclado:**
- Focus ring visible: `focus-visible:ring-2 ring-pink/50 ring-offset-2 ring-offset-background`
- Skip link al contenido principal
- Orden lógico de tab en formularios

**Screen readers:**
- Imágenes: `alt` descriptivo siempre
- Iconos sin texto: `aria-label` en el botón padre
- Estados dinámicos: `aria-live="polite"` en toasts y contadores
- Roles semánticos correctos (nav, main, header, button, etc.)

### Guías de Implementación para el Desarrollador

```tsx
// Focus ring estándar (agregar a tailwind.config o como clase utilitaria)
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background'

// Animaciones: respetar prefers-reduced-motion
'motion-safe:transition-all motion-safe:duration-200'

// Touch target wrapper si el elemento es pequeño
<div className="p-3 -m-3 cursor-pointer"> {/* extiende área táctil sin cambiar visual */}

// Lazy loading de imágenes
<Image loading="lazy" />  // Next.js lo maneja

// Optimistic UI pattern:
// 1. Actualizar estado local inmediatamente
// 2. Enviar request al servidor
// 3. Si error: revertir estado + mostrar toast de error
```

---

## Guía de Microinteracciones

### Animaciones Requeridas

| Elemento | Animación | Duración | Easing |
|----------|-----------|----------|--------|
| Reacción emoji | Scale 1→1.4→1.0 + color change | 300ms | spring |
| Toggle de asistencia | Slide thumb + color bg | 200ms | ease-out |
| Card hover | scale(1.01) + shadow | 150ms | ease-out |
| Card active/press | scale(0.98) | 100ms | ease-in |
| Bottom sheet open | translateY(100%→0) | 250ms | ease-out |
| Toast entry | translateY(20px→0) + opacity | 200ms | ease-out |
| Toast exit | opacity 1→0 | 150ms | ease-in |
| Número en stat | count up 0→valor | 600ms | ease-out |
| Gráfico dibujarse | stroke-dashoffset | 1000ms | ease-in-out |

### Clases Tailwind para Animaciones

```tsx
// Ya disponibles en Tailwind:
'transition-all duration-200 ease-out'
'hover:scale-[1.01] active:scale-[0.98]'
'animate-pulse'  // skeletons
'animate-bounce' // notificaciones

// Agregar a tailwind.config.js:
animation: {
  'bounce-once': 'bounce 0.3s ease-out 1',
  'count-up': 'countUp 0.6s ease-out forwards',
  'draw-line': 'drawLine 1s ease-in-out forwards',
  'slide-up': 'slideUp 0.25s ease-out',
}
```

---

## Priorización de Implementación

### Fase 1 — Alto impacto, relativamente rápido (1–2 sesiones)

1. **PostCard mejorado:** Emojis siempre visibles, animación de reacción, badge de tipo
2. **SessionCard con estados:** Highlight de sesión de hoy, badge de estado
3. **BottomSheet component:** Base reutilizable para comentarios, medidas, detalles
4. **Jerarquía de botones:** Aplicar variantes consistentes en toda la app
5. **EmptyState component:** Aplicar en feed, tracker, schedule, users
6. **Focus rings:** Aplicar en todos los elementos interactivos
7. **Tokens de color semánticos:** success/warning/error en Tailwind config

### Fase 2 — Impacto medio, requiere más trabajo (2–3 sesiones)

1. **Tracker dashboard:** Hero con 3 stats, ProgressRing opcional, historial con fotos
2. **Admin users:** Search + perfil físico al hacer click + toggles animados
3. **Admin attendance:** Summary header + animación de toggle + avatar en lista
4. **Feed comments → BottomSheet:** Mover de página a sheet
5. **Gráfico de progreso mejorado:** Tooltips, animación de entrada, bezier curves
6. **StatCards con delta:** En admin dashboard

### Fase 3 — Pulido visual (1–2 sesiones)

1. **Microinteracciones:** Count-up en stats, draw-line en gráfico, bounce en emojis
2. **Navegación alumno:** Dot de "nuevo" en tab de feed
3. **Schedule:** Navegación entre semanas
4. **Profile:** Rediseño con stats de resumen
5. **PWA UX:** Banner de instalación, pantalla offline friendly

---

*Especificación generada por Sally — UX Designer Agent*
*Lista para implementación por el equipo de desarrollo*
*Archivo: `_bmad-output/planning-artifacts/ux-design-specification.md`*
