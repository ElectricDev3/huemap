# Huemap (CPProject)

Utilidad de generación y validación de paletas de color accesibles. Genera una paleta categórica o valida la tuya con contraste WCAG y separación bajo simulación de daltonismo, calculado en tiempo real — sin backend.

> Nombre comercial: **Huemap** · Identificador técnico: `CPProject` · Grado 3 (utilidad)

## Propuesta

Los generadores de paletas genéricos no dicen si la paleta es legible para daltonismo ni si cumple contraste — hay que adivinar o usar varias herramientas distintas. Huemap resuelve eso integrando la misma metodología de validación de color que se usa para las gráficas de este portafolio (basada en OKLab/OKLCH, contraste WCAG, y simulación de daltonismo de Machado-Oliveira-Fernandes): genera paletas y las valida al instante, o valida cualquier paleta que ya tengas.

## Funciones

- **Generar**: crea una paleta categórica de 2 a 8 colores a partir de un tono base, con espaciado de matiz uniforme en el espacio OKLCH.
- **Búsqueda de tono accesible**: al generar o pedir "Aleatorio", el tono base se busca automáticamente (hasta 24 candidatos) para maximizar la probabilidad de que la paleta pase la validación — no es solo un tono aleatorio sin verificar.
- **Validar la mía**: pega cualquier lista de colores hexadecimales y se validan con el mismo método.
- **5 checks de accesibilidad en tiempo real**: banda de luminosidad, piso de croma, separación bajo daltonismo (protanopía/deuteranopía), piso de visión normal, y contraste contra la superficie — cada uno con su valor numérico real, no solo un semáforo.
- **Simulación visual de daltonismo**: la paleta completa renderizada bajo protanopía, deuteranopía y tritanopía simuladas.
- **Exportar** como CSS custom properties, JSON, o un objeto de colores de Tailwind.
- Superficie clara/oscura intercambiable (afecta la banda de luminosidad válida y el contraste calculado).

## Por qué es honesto, no una demo

El motor de color (`lib/color.ts`) es un port directo del validador de paletas del skill de data-viz usado en el resto del portafolio (mismo OKLab, mismas matrices de simulación CVD, mismos umbrales) — no una aproximación inventada. Se verificó pegando la paleta de referencia documentada de 8 tonos y confirmando que Huemap reporta exactamente los mismos valores documentados (ΔE 9.1 bajo daltonismo, ΔE 19.6 en visión normal, y los mismos 3 colores con contraste bajo).

A partir de 7 colores, es matemáticamente difícil que un espaciado de matiz uniforme separe todos los pares bajo simulación de daltonismo — la herramienta lo dice explícitamente en vez de fingir que siempre encuentra una paleta perfecta.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- `lucide-react` para iconografía
- Sin backend, sin base de datos, sin dependencias de color: toda la conversión OKLab/OKLCH, simulación CVD, y contraste WCAG están escritos a mano en `lib/color.ts`

## Estructura relevante

```
app/                  Rutas de Next.js (app de una sola página)
components/
  HuemapView.tsx           Orquesta modo generar/validar, controles, y resultados
  PaletteSwatches.tsx        Swatches con hex y contraste, copiables al hacer clic
  ValidationPanel.tsx          Los 5 checks de accesibilidad con su detalle numérico
  CvdPreview.tsx                  Simulación visual de protan/deutan/tritanopía
  ExportPanel.tsx                   Exportar como CSS/JSON/Tailwind
lib/
  color.ts               Motor de color: OKLab/OKLCH, contraste WCAG, simulación CVD,
                          generación de paleta, y validate() — port del validador
                          del skill de data-viz de este workspace
  types.ts                 Tipos de dominio
```

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de producción
npm run lint    # eslint
```

## Variables de entorno

Ninguna. Sin APIs externas ni base de datos.

## Despliegue

Preparado para Vercel: `npm run build` sin pasos adicionales, sin variables de entorno requeridas.

## Estado

MVP funcional y probado localmente (build, lint, y verificación con Playwright: modo generar con búsqueda de tono accesible funcionando 5/5 veces en pruebas aleatorias a 5 colores, modo validar con la paleta de referencia del skill de data-viz coincidiendo exactamente con los valores documentados, alternar superficie clara/oscura, exportación, sin errores de consola).

## Pendientes / posibles siguientes pasos

- Guardar paletas favoritas (requeriría persistencia, aunque sea solo local).
- Exportar como imagen PNG de la tira de swatches.
- Modo "escala secuencial" y "divergente" (actualmente solo genera categórica).
