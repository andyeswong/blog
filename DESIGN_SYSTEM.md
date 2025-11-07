# AWONG_blog - Sistema de Diseño y Guía de Estilos

## Descripción General
AWONG_blog es una aplicación moderna y elegante de blog de tecnología construida con Node.js y Express, caracterizada por un sofisticado esquema de colores Dracula. El diseño enfatiza claridad, minimalismo y tipografía refinada con elementos geométricos sutiles.

## Paleta de Colores

### Tema Dracula
Toda la aplicación utiliza el esquema de colores Dracula, una paleta cuidadosamente seleccionada diseñada para la legibilidad del código que se traduce hermosamente en diseño de UI.

| Color | Hex | Uso |
|-------|-----|-----|
| **Fondo** | `#282a36` | Fondo primario, tarjetas, secciones |
| **Primer plano** | `#f8f8f2` | Texto principal, titulares |
| **Comentario** | `#6272a4` | Texto secundario, información meta |
| **Rojo** | `#ff5555` | Errores, alertas |
| **Naranja** | `#ffb86c` | Advertencias, resaltes |
| **Amarillo** | `#f1fa8c` | Énfasis especial |
| **Verde** | `#50fa7b` | Éxito, acentos, títulos de artículos |
| **Cian** | `#8be9fd` | Enlaces, elementos interactivos |
| **Azul** | `#bd93f9` | Gradientes, decorativos |
| **Púrpura** | `#b8a6db` | Acento primario, encabezados |
| **Rosa** | `#ff79c6` | Acento secundario (uso mínimo) |

## Tipografía

### Stack de Fuentes
```
font-family: 'Courier New', 'Courier', monospace
```

### Jerarquía Tipográfica

| Elemento | Tamaño | Peso | Espaciado de Letras | Uso |
|---------|--------|------|----------------------|-----|
| **Hero H1** | 3rem-5rem | light (300) | tight | Título principal en hero |
| **Hero Subtítulo** | 2rem-3rem | light (300) | normal | Texto hero secundario |
| **Título Sección** | 2rem-3rem | light (300) | tight | Encabezados de sección |
| **Título Artículo** | 1.125rem | light (300) | tight | Encabezados de artículos |
| **Texto de Cuerpo** | 1rem | light (300) | normal | Contenido principal |
| **Meta/Comentario** | 0.875rem | light (300) | normal | Timestamps, categorías |
| **Enlaces Nav** | 0.875rem | light (300) | más amplio | Elementos de navegación |
| **Texto Terminal** | 0.875rem | light (300) | más amplio | Pie de página, referencias de código |

**Escala de Peso**: Todo el texto utiliza peso light (300) para una apariencia moderna y refinada. El peso de fuente es intencionalmente mínimo para consistencia.

## Disposición y Espaciado

### Secciones
- **Sección Hero**: Altura de viewport completa (100vh) con contenido centrado
- **Navegación**: Top fija, blur de backdrop sutil, bordes mínimos
- **Secciones de Contenido**: Ancho máximo 6xl (1152px), centrado con márgenes auto
- **Relleno**: 
  - Secciones grandes: 24px (py-24) vertical, 32px (px-8) horizontal
  - Tarjetas: 32px (p-8)
  - Elementos compactos: 16px (p-4)

### Sistema de Grid
- **Grid de Artículos**: Columnas responsivas
  - Mobile: 1 columna
  - Tablet (md): 2 columnas
  - Desktop (lg): 3 columnas
  - Separación: 32px (gap-8)

## Elementos Visuales

### Tarjetas
```
Borde: 1px solid rgba(189, 147, 249, 0.2)
Fondo: rgba(40, 42, 54, 0.4) con blur de backdrop
Radio de Borde: 0.5rem (8px)
Relleno: 32px
Transición: 500ms (color, borde, fondo)
```

**Estado Hover**:
- Opacidad del borde aumenta a 0.4
- El fondo se vuelve más opaco
- Transición de color suave

### Gradientes
- **Fondo Hero**: `linear-gradient(135deg, #282a36 0%, transparent, #1a1d18 100%)`
- **Hero Texto Secundario**: Gradiente púrpura a texto normal
- **Imagen Tarjeta Artículo**: `linear-gradient(to bottom-right, #bd93f9, #8be9fd)`
- **Gradiente de Texto**: `linear-gradient(to right, transparent, #b8a6db, transparent)` para divisores

### Bordes
- **Primario**: 1px solid con 20-30% opacidad
- **Sutil**: 1px solid con 10-20% opacidad
- **Navegación**: Solo borde inferior, opacidad mínima
- **Secciones**: Borde superior con opacidad sutil

### Efecto Backdrop y Glass
- **Blur**: backdrop-blur-md a backdrop-blur-xl
- **Opacidad**: bg-opacity 40-60% para profundidad
- **Efecto**: Crea profundidad de capas sin sombras pesadas

## Elementos Interactivos

### Enlaces de Navegación
- Color: `#b8a6db` (Púrpura)
- Hover: Se aclara a `#c4b5e0` con transición suave
- Duración: 300ms
- Interacción: Solo cambio de color (sin subrayado o sombra)

### Botones y Enlaces
- Color de Enlace Primario: `#8be9fd` (Cian)
- Color Hover: `#a0f2ff` (Cian más brillante)
- Transición: 300-500ms ease-out
- Sin sombras, confía en color y opacidad

### Tarjetas de Artículos
- Opacidad de borde por defecto: 20%
- Opacidad de borde hover: 40%
- Opacidad de imagen: 20% → 30% on hover
- Transición de fondo: Aumento de opacidad sutil

## Animación y Movimiento

### Solo Sección Hero
- Desvanecimiento entrada palabra por palabra con retraso escalonado (200ms intervalos)
- Elementos geométricos flotantes con movimiento vertical sutil
- Líneas de grid con animación de dibujo
- El gradiente del mouse sigue el cursor con 500ms ease-out

**Importante**: Todas las otras secciones NO tienen animaciones. Son estáticas y elegantes.

### Estándares de Duración
- Transiciones rápidas: 300ms (estado hover, cambios de color)
- Transiciones medianas: 500ms (tarjetas, cambios de fondo)
- Animaciones: 800ms-3s (solo sección hero)

### Easing
- Ease-out: Usado para entradas, interacciones del mouse
- Ease-in-out: Usado para animaciones continuas
- Linear: Animaciones de grid

## Fondo y Profundidad

### Fondo de Página
```
Gradiente: from-[#282a36] via-black to-[#1a1d18]
Capas de Opacidad: Las secciones de contenido utilizan fondos semi-transparentes
Efecto: Crea profundidad visual sin sombras
```

### Fondos de Sección
- Sección de Artículos: `bg-gradient-to-br from-[#1a1d18]/20 to-[#282a36]/20`
- Pie de página: `bg-[#282a36]/30`
- Tarjetas: `bg-[#282a36]/40` → `bg-[#282a36]/60` on hover

## Responsividad

### Breakpoints (Tailwind)
- **sm**: 640px (mobile landscape)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (desktop grande)

### Escala Responsiva
- La tipografía se escala con el tamaño del dispositivo
- El relleno se ajusta: px-4 (mobile) → px-8 (desktop)
- El grid cambia: 1 columna (mobile) → 2 (tablet) → 3 (desktop)
- El espaciado aumenta proporcionalmente en pantallas más grandes

## Accesibilidad

- Contraste de color suficiente entre texto y fondo
- Todos los elementos interactivos tienen estados hover claros
- Sin animación impide la interacción del usuario
- Tamaño de fuente mínimo 14px para texto de cuerpo
- El espaciado de letras mejora la legibilidad

## Estándares de Código

### Estructura HTML
- Elementos HTML semánticos (nav, section, article, footer)
- Atributos de datos para animaciones: `data-delay`
- Las clases siguen BEM donde es aplicable

### CSS/Tailwind
- Usa utilidades de Tailwind para espaciado, colores, tamaño
- Estilos inline solo para gradientes dinámicos o complejos
- El archivo CSS contiene animaciones keyframe
- Los valores de opacidad utilizan notación /20, /30, /40, /60

### JavaScript
- Sin animaciones en secciones que no sean hero
- Solo características interactivas: gradiente del mouse, animaciones de palabras (hero), efectos de ripple
- Preocupaciones separadas y limpias (diferentes funciones init)

## Filosofía de Diseño

1. **Elegancia sobre Complejidad**: Animaciones mínimas, máxima claridad
2. **Armonía Dracula**: Uso consistente de colores en toda la aplicación
3. **Enfoque Tipográfico**: Tipo light como elemento de diseño primario
4. **Sutileza Geométrica**: Fondo de grid, elementos flotantes realzan sin abrumar
5. **Fluidez Responsiva**: El contenido se adapta gracefully a todos los tamaños de pantalla
6. **Refinamiento Interactivo**: Transiciones suaves, sin efectos abruptos
7. **Minimalismo Moderno**: Espacio en blanco, espacio de respiración, ritmo deliberado

## Consideraciones Futuras

- Mantener la paleta Dracula en todas las páginas nuevas
- Mantener consistencia en la jerarquía tipográfica
- Seguir los estándares de duración de transiciones
- Reservar animaciones solo para secciones hero
- Probar todos los cambios en mobile, tablet y desktop
- Mantener rendimiento de 60fps en todas las animaciones
