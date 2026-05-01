# Liga Deportiva — React + Supabase

Versión React de la app de gestión de liga deportiva con base de datos online en Supabase.

## Configuración rápida

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) → New Project
2. Anota tu **Project URL** y **anon/public key** (en Settings → API)

### 2. Crear las tablas
En el **SQL Editor** de Supabase, ejecuta el contenido de [`supabase-schema.sql`](./supabase-schema.sql)

### 3. Variables de entorno
```bash
cp .env.example .env
```
Edita `.env` con tus credenciales:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

### 4. Instalar y ejecutar
```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## Estructura del proyecto
```
src/
├── context/AppContext.jsx   # Estado global + operaciones Supabase
├── lib/supabase.js          # Cliente Supabase
├── utils/helpers.js         # Utilidades de fechas y constantes
├── components/              # Header, Nav, Toast
├── panels/                  # Un componente por pestaña
│   ├── IntegrantesPanel.jsx
│   ├── PagosPanel.jsx
│   ├── DeudasPanel.jsx
│   ├── GastosPanel.jsx
│   ├── ResumenPanel.jsx
│   ├── TurnosPanel.jsx
│   └── DatosPanel.jsx
└── index.css                # Estilos globales (tema oscuro)
```

## Tablas Supabase
| Tabla | Descripción |
|---|---|
| `integrantes` | Jugadores de la liga |
| `pagos` | Pagos por sesión ($25 · lunes o miércoles) |
| `gastos` | Gastos de la liga (cancha, árbitro, etc.) |
| `turnos` | Cola de llegada del día |
| `configuracion` | Fecha base y otros ajustes |

## Build producción
```bash
npm run build
npm run preview
```
