# Arquitectura de Módulos Admin

Este documento describe la arquitectura y convenciones de organización de código para los módulos administrativos.

## Estructura de Carpetas

Cada feature/módulo sigue una estructura consistente:

```
feature-name/
  ├── _components/          # Componentes UI del feature
  │   ├── header/          # Componentes de header/página (primary-buttons, breadcrumb-override)
  │   ├── table/           # Componentes de tabla (table, columns, filters, actions)
  │   ├── create/          # Formularios de creación
  │   ├── edit/            # Formularios de edición
  │   ├── detail/          # Vistas de detalle
  │   ├── overlays/        # Diálogos y modales
  │   ├── common/         # Componentes compartidos dentro del feature
  │   └── search/          # Componentes de búsqueda (opcional)
  ├── _hooks/              # Hooks personalizados (lógica de negocio)
  ├── _types/              # Tipos TypeScript específicos del feature
  ├── _utils/              # Utilidades y helpers
  ├── _schemas/            # Esquemas de validación (Zod)
  └── page.tsx             # Página principal del feature
```

## Convenciones de Nombres

### Archivos
- **Componentes**: `kebab-case.tsx` (ej: `roles-table.tsx`)
- **Hooks**: `kebab-case-hooks.tsx` (ej: `roles-hooks.tsx`)
- **Tipos**: `kebab-case.types.ts` (ej: `roles.types.ts`)
- **Utils**: `kebab-case.tsx` o `kebab-case.ts` (ej: `roles.tsx`)
- **Schemas**: `kebab-case.schema.ts` (ej: `roles.schema.ts`)

### Componentes
- **Nombres**: `PascalCase` (ej: `RolesTable`, `UsersFilters`)
- **Exports**: 
  - Componentes principales: `export default`
  - Componentes auxiliares: `export function` o `export const`

### Carpetas
- **Prefijo `_`**: Indica carpetas internas del módulo (no deben importarse desde fuera)
- **Nombres**: `kebab-case` (ej: `_components`, `_hooks`)

## Organización de Componentes

### `header/`
Componentes relacionados con el header y acciones principales de la página:
- `*-primary-buttons.tsx`: Botones principales (crear, etc.)
- `*-breadcrumb-override.tsx`: Override del breadcrumb

### `table/`
Componentes relacionados con la tabla de datos:
- `*-table.tsx`: Componente principal de la tabla
- `*-columns.tsx`: Definición de columnas
- `*-filters.tsx`: Componentes de filtros
- `*-table-actions.tsx`: Acciones por fila
- `index.ts`: Exports centralizados

### `create/`, `edit/`, `detail/`
Formularios y vistas específicas:
- `*-create-dialog.tsx`: Diálogo de creación
- `*-edit-dialog.tsx`: Diálogo de edición
- `*-detail-dialog.tsx`: Diálogo de detalle

### `overlays/`
Gestión centralizada de diálogos:
- `*-dialogs.tsx`: Componente que maneja todos los diálogos del feature

### `common/`
Componentes compartidos dentro del feature (no entre features):
- Componentes reutilizables solo dentro del mismo feature

## Patrones de Importación

### Imports Relativos
```typescript
// Desde _components/table/
import { rolesColumns } from "./roles-columns";
import RolesTable from "./roles-table";

// Desde _components/header/
import RolesPrimaryButtons from "../header/roles-primary-buttons";

// Desde _hooks/
import { useGetRoles } from "../../_hooks/roles-hooks";

// Desde _types/
import { RoleDetailResponse } from "../../_types/roles.types";
```

### Imports con index.ts
```typescript
// Usar index.ts cuando esté disponible
import { RolesTable, RolesFilters, rolesColumns } from "./table";
```

## Hooks

Los hooks deben:
- Estar en `_hooks/`
- Seguir el patrón `use*` (ej: `useGetRoles`, `useCreateRole`)
- Agrupar hooks relacionados en un archivo (ej: `roles-hooks.tsx`)
- Exportar interfaces de tipos cuando sea necesario

## Tipos

Los tipos deben:
- Estar en `_types/`
- Usar nombres descriptivos
- Exportar tipos compartidos con el backend cuando sea posible

## Utils

Las utilidades deben:
- Estar en `_utils/`
- Ser funciones puras cuando sea posible
- Tener tipado fuerte
- Incluir documentación JSDoc

## Schemas

Los schemas deben:
- Estar en `_schemas/`
- Usar Zod para validación
- Exportar tanto el schema como el tipo inferido

## Código Compartido

### Entre Features (`_shared/`)
Si un componente/hook/util se usa en **múltiples features** dentro del mismo grupo:
- Crear carpeta `_shared/` **al nivel del grupo de features** que comparten el código
- Mover el código compartido allí
- Estructura: `_shared/_components/`, `_shared/_hooks/`, `_shared/_types/`, etc.

**Regla de ubicación:**
- `_shared/` se crea **al nivel del grupo de features** que comparten el código
- Si es compartido entre features de `admin/` (roles, users) → `admin/_shared/`
- Si fuera compartido entre features de `clients/` → `clients/_shared/`
- Si `settings` necesita código de `admin/_shared/`, simplemente lo importa desde ahí
- Esto mantiene la organización por grupos y evita que `_shared/` crezca demasiado

**Ejemplo real:**
```
(admin)/
  ├── admin/
  │   ├── _shared/                # ✅ Código compartido entre features de admin/
  │   │   ├── _components/
  │   │   │   └── common/
  │   │   │       ├── password-field.tsx          # Usado en admin/users y settings/security
  │   │   │       ├── password-generator-popover.tsx
  │   │   │       └── role-badge.tsx              # Usado en admin/roles y admin/users
  │   │   ├── _hooks/
  │   │   │   └── use-generate-password.tsx
  │   │   └── _utils/
  │   │       └── roles.tsx
  │   ├── roles/
  │   └── users/
  └── settings/
      ├── profile/
      └── security/                # Importa desde admin/_shared/ si lo necesita
```

**Ejemplo de estructura `_shared/` en `admin/`:**
```
admin/
  ├── _shared/                    # 🆕 Código compartido entre features de admin
  │   ├── _components/
  │   │   └── common/
  │   │       └── shared-component.tsx
  │   ├── _hooks/
  │   │   └── shared-hook.tsx
  │   ├── _types/
  │   │   └── shared.types.ts
  │   └── _utils/
  │       └── shared-utils.tsx
  ├── roles/
  └── users/
```

**Ejemplo si hubiera `clients/` con su propio `_shared/`:**
```
clients/
  ├── _shared/                    # Código compartido entre features de clients
  │   └── _components/
  ├── client-list/
  └── client-detail/
```

**Cuándo usar `_shared/`:**
- Un componente se usa en 2+ features diferentes del mismo grupo
- Un hook se reutiliza en múltiples features del mismo grupo
- Utilidades comunes entre features del mismo grupo
- Tipos compartidos entre features del mismo grupo

**Cuándo NO usar `_shared/`:**
- Código usado solo en un feature → usar `_components/common/` del feature
- Código específico de un feature → mantenerlo en el feature

### Dentro de un Feature (`common/`)
Si un componente se usa en múltiples lugares del **mismo feature**:
- Colocarlo en `_components/common/` del feature
- Ejemplo: `roles/_components/common/role-badge.tsx`

## Ejemplo Completo

```
admin/
  ├── _docs/
  │   └── ARCHITECTURE.md          # Documentación de arquitectura
  ├── _shared/                      # 🆕 Código compartido entre features
  │   ├── _components/
  │   │   └── common/
  │   │       └── shared-component.tsx
  │   ├── _hooks/
  │   │   └── shared-hook.tsx
  │   ├── _types/
  │   │   └── shared.types.ts
  │   └── _utils/
  │       └── shared-utils.tsx
  ├── roles/
  │   ├── _components/
  │   │   ├── header/
  │   │   │   ├── roles-primary-buttons.tsx
  │   │   │   └── roles-breadcrumb-override.tsx
  │   │   ├── table/
  │   │   │   ├── index.ts
  │   │   │   ├── roles-table.tsx
  │   │   │   ├── roles-columns.tsx
  │   │   │   ├── roles-filters.tsx
  │   │   │   └── roles-table-actions.tsx
  │   │   ├── create/
  │   │   ├── edit/
  │   │   ├── detail/
  │   │   ├── overlays/
  │   │   └── common/               # Componentes compartidos solo dentro de roles
  │   ├── _hooks/
  │   ├── _types/
  │   ├── _utils/
  │   ├── _schemas/
  │   └── page.tsx
  └── users/
      └── (misma estructura)
```

## Mejores Prácticas

1. **Colocation**: Mantener código relacionado junto
2. **Encapsulación**: Usar prefijo `_` para carpetas internas
3. **Consistencia**: Seguir la misma estructura en todos los features
4. **Documentación**: Documentar componentes complejos
5. **Tipado**: Usar TypeScript estricto
6. **Reutilización**: Mover código compartido a `_shared/` cuando sea necesario

