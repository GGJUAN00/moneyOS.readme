# MoneyOS

App de finanzas personales, construida a partir del diseño de Figma Make
**MoneyOS Personal Finance App**.

Es una **app web instalable (PWA)**: se instala en el iPhone desde Safari, sin App Store,
se abre a pantalla completa con su propio icono y funciona sin internet.

## Pantallas

- **Home**: saldo total, ingresos/gastos/ahorro, presupuesto mensual, gráfico de gastos por categoría y últimas transacciones.
- **Charts**: gasto mensual, semanal y patrimonio neto, con desglose por categoría y metas.
- **Activity**: todas las transacciones agrupadas por día, con filtro por categoría.
- **AI**: chat de preguntas sobre tus finanzas (respuestas de ejemplo, todavía sin IA real).

> Los datos son de ejemplo (`src/data/mockData.ts`), tal como venían en el diseño.

## Instalar en el iPhone

1. Abre en **Safari** la dirección de la app: `https://ggjuan00.github.io/moneyOS.readme/`
2. Pulsa el botón **Compartir** (el cuadrado con la flecha hacia arriba).
3. Elige **"Agregar a pantalla de inicio"** y luego **Agregar**.

Tiene que ser Safari; desde Chrome en iPhone no aparece esa opción.

## Publicación

Cada vez que se sube un cambio a la rama `main`, GitHub Actions compila la app y deja el
resultado en la rama `gh-pages`, desde donde GitHub Pages la publica
(`.github/workflows/deploy.yml`). No hace falta configurar nada más.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # compila a dist/
```

Tecnologías: React 19, TypeScript, Vite, Tailwind CSS 4 y Recharts.
