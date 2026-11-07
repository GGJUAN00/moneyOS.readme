# MoneyOS

App de finanzas personales, construida a partir del diseño de Figma Make
**MoneyOS Personal Finance App**.

Es una **app web instalable (PWA)**: se instala en el iPhone desde Safari, sin App Store,
se abre a pantalla completa con su propio icono y funciona sin internet.
Está completamente en español y todos los montos están en pesos colombianos (COP).

## Registro

La primera vez que alguien abre la app en un dispositivo, se le pide registrarse con sus datos
(nombres, apellidos, tipo y número de documento, fecha de nacimiento, celular, correo, ciudad y
ocupación) y aceptar el tratamiento de datos (Ley 1581 de 2012). Desde entonces la app entra
directo. Los datos se guardan **solo en ese dispositivo** (no se envían a ningún servidor) y se
pueden ver o borrar tocando las iniciales arriba a la derecha.

> En iPhone, la app instalada en la pantalla de inicio guarda sus datos aparte de Safari: si te
> registras en Safari y luego la instalas, te pedirá el registro una vez más dentro de la app.

## Pantallas

- **Inicio**: saludo con tu nombre, saldo total, ingresos/gastos/ahorro, presupuesto mensual, gastos por categoría y últimos movimientos.
- **Gráficas**: gasto mensual, semanal y patrimonio, con desglose por categoría y metas.
- **Movimientos**: todas las transacciones agrupadas por día, con filtro por categoría.
- **Asistente**: chat de preguntas sobre tus finanzas (respuestas de ejemplo, todavía sin IA real).

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
