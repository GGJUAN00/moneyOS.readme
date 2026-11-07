export const categories = [
  { name: 'Shopping', amount: 7_938_000, color: '#FF4757', icon: '🛍️', budget: 6_300_000 },
  { name: 'Bills', amount: 6_762_000, color: '#9B59B6', icon: '⚡', budget: 7_140_000 },
  { name: 'Food', amount: 5_208_000, color: '#00E87A', icon: '🍜', budget: 4_200_000 },
  { name: 'Transport', amount: 2_856_000, color: '#4F7FFF', icon: '🚇', budget: 2_520_000 },
  { name: 'Entertainment', amount: 1_764_000, color: '#FFB800', icon: '🎬', budget: 2_100_000 },
];

export const totalSpent = 24_528_000;
export const monthlyBudget = 30_240_000;
export const balance = 104_370_000;
export const monthlyIncome = 30_240_000;

export const transactions = [
  { id: 1,  name: 'Whole Foods Market',   category: 'Food',          amount: -375_900,    date: '2026-09-25', icon: '🛒' },
  { id: 2,  name: 'Netflix',              category: 'Entertainment', amount: -67_158,     date: '2026-09-25', icon: '🎬' },
  { id: 3,  name: 'Nómina Septiembre',    category: 'Income',        amount: 30_240_000,  date: '2026-09-24', icon: '💼' },
  { id: 4,  name: 'TransMilenio',         category: 'Transport',     amount: -138_600,    date: '2026-09-24', icon: '🚇' },
  { id: 5,  name: 'Amazon',               category: 'Shopping',      amount: -658_560,    date: '2026-09-23', icon: '📦' },
  { id: 6,  name: 'EPM',                  category: 'Bills',         amount: -504_000,    date: '2026-09-23', icon: '⚡' },
  { id: 7,  name: 'Sweetgreen',           category: 'Food',          amount: -78_750,     date: '2026-09-22', icon: '🥗' },
  { id: 8,  name: 'Uber',                 category: 'Transport',     amount: -102_060,    date: '2026-09-22', icon: '🚗' },
  { id: 9,  name: 'Zara',                 category: 'Shopping',      amount: -1_192_800,  date: '2026-09-21', icon: '👗' },
  { id: 10, name: 'Spotify Premium',      category: 'Entertainment', amount: -46_158,     date: '2026-09-20', icon: '🎵' },
  { id: 11, name: 'Éxito',               category: 'Food',          amount: -304_080,    date: '2026-09-20', icon: '🛒' },
  { id: 12, name: 'ChatGPT Plus',         category: 'Bills',         amount: -84_000,     date: '2026-09-19', icon: '🤖' },
  { id: 13, name: 'Falabella',            category: 'Shopping',      amount: -884_100,    date: '2026-09-18', icon: '🎯' },
  { id: 14, name: 'Cine Colombia',        category: 'Entertainment', amount: -119_700,    date: '2026-09-17', icon: '🎬' },
  { id: 15, name: 'Adobe Creative Cloud', category: 'Bills',         amount: -75_558,     date: '2026-09-16', icon: '🎨' },
  { id: 16, name: 'InDriver',             category: 'Transport',     amount: -79_380,     date: '2026-09-15', icon: '🚗' },
  { id: 17, name: 'El Corral',            category: 'Food',          amount: -59_850,     date: '2026-09-15', icon: '🌯' },
  { id: 18, name: 'Apple iCloud',         category: 'Bills',         amount: -12_558,     date: '2026-09-14', icon: '☁️' },
  { id: 19, name: 'Nike Store',           category: 'Shopping',      amount: -777_000,    date: '2026-09-12', icon: '👟' },
  { id: 20, name: 'Bici Pública',         category: 'Transport',     amount: -63_000,     date: '2026-09-10', icon: '🚲' },
];

export const monthlySpending = [
  { month: 'Abr', spent: 26_964_000, income: 30_240_000 },
  { month: 'May', spent: 25_116_000, income: 30_240_000 },
  { month: 'Jun', spent: 29_820_000, income: 30_240_000 },
  { month: 'Jul', spent: 28_224_000, income: 30_240_000 },
  { month: 'Ago', spent: 23_478_000, income: 30_240_000 },
  { month: 'Sep', spent: 24_528_000, income: 30_240_000 },
];

export const weeklySpending = [
  { day: 'Lun', amount: 882_000 },
  { day: 'Mar', amount: 357_000 },
  { day: 'Mié', amount: 1_428_000 },
  { day: 'Jue', amount: 798_000 },
  { day: 'Vie', amount: 2_184_000 },
  { day: 'Sáb', amount: 1_722_000 },
  { day: 'Dom', amount: 546_000 },
];

export const netWorthTrend = [
  { month: 'Abr', value: 89_040_000 },
  { month: 'May', value: 94_080_000 },
  { month: 'Jun', value: 91_560_000 },
  { month: 'Jul', value: 96_180_000 },
  { month: 'Ago', value: 100_842_000 },
  { month: 'Sep', value: 104_370_000 },
];

export const suggestedQuestions = [
  "¿Cómo va mi gasto en comida?",
  "¿Puedo ahorrar más este mes?",
  "¿Cuáles son mis suscripciones?",
  "¿Estoy sobre el presupuesto?",
  "¿En qué gasto más dinero?",
];

export function formatCOP(amount: number): string {
  return '$ ' + Math.abs(Math.round(amount)).toLocaleString('es-CO')
}

export function formatCOPShort(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000_000) return `$ ${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `$ ${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$ ${(abs / 1_000).toFixed(0)}k`
  return `$ ${abs}`
}

export function getAIResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('comida') || lower.includes('food') || lower.includes('comer') || lower.includes('restaurant') || lower.includes('compra')) {
    return "Tu gasto en comida este mes es **$ 5.208.000** — el 21.2% del total, **$ 1.008.000 por encima** de tu presupuesto de $ 4.200.000. Realizaste 23 transacciones en 8 restaurantes y 3 supermercados. Mayor gasto: Éxito ($ 304.080). Hacer compras quincenales en lugar de semanales podría ahorrarte ~**$ 357.000/mes**.";
  }
  if (lower.includes('suscri') || lower.includes('netflix') || lower.includes('spotify')) {
    return "Tienes **7 suscripciones activas** que suman $ 398.706/mes: Netflix $ 67.158, Spotify $ 46.158, iCloud $ 12.558, ChatGPT Plus $ 84.000, Amazon Prime $ 62.958, Headspace $ 54.558, Adobe CC $ 75.558. Tus suscripciones han crecido un **23%** desde enero. Considera revisar Headspace y Adobe si los usas poco.";
  }
  if (lower.includes('ahorrar') || lower.includes('ahorro') || lower.includes('save') || lower.includes('más')) {
    return "Vas a ahorrar **$ 5.712.000** este mes — una tasa de ahorro del 18.9%, solo **$ 302.400** por debajo de tu meta del 20%. Para lograrlo: evita una salida a comer (~$ 273.000) y una compra por impulso. Tu tendencia: Jun $ 420.000 → Ago $ 6.762.000 → Sep est. $ 5.712.000. Agosto fue tu mejor mes del año.";
  }
  if (lower.includes('presupuesto') || lower.includes('budget') || lower.includes('sobre') || lower.includes('pasé')) {
    return "Estás **$ 5.712.000 por debajo del presupuesto** con 5 días restantes en septiembre. A tu ritmo actual de $ 816.000/día, terminarás el mes en ~$ 24.528.000 — **$ 5.712.000 bajo** tu presupuesto de $ 30.240.000. Shopping es tu única categoría en rojo (+$ 1.638.000). Todo lo demás está dentro de límites.";
  }
  if (lower.includes('shopping') || lower.includes('ropa') || lower.includes('amazon') || lower.includes('gastar') || lower.includes('gasto')) {
    return "Shopping es tu **gasto #1 con $ 7.938.000** este mes — 32.4% del gasto total, $ 1.638.000 sobre presupuesto. Mayores compras: Zara $ 1.192.800, Falabella $ 884.100, Nike $ 777.000. Amazon suma **$ 658.560**. Realizaste 31 transacciones de compras vs. 22 el mes pasado — un salto del 41%.";
  }
  if (lower.includes('transport') || lower.includes('uber') || lower.includes('transmilenio') || lower.includes('indriver')) {
    return "Transporte te costó **$ 2.856.000** este mes: TransMilenio $ 546.000, Uber/InDriver $ 1.848.000, Bici Pública $ 189.000, parqueaderos $ 273.000. Estás un 13% sobre el mes pasado. Usar TransMilenio en lugar de Uber en tus 3 trayectos semanales nocturnos (prom. $ 92.000/viaje) ahorraría ~**$ 369.600/mes**.";
  }
  if (lower.includes('invert') || lower.includes('acciones') || lower.includes('portafolio') || lower.includes('riqueza')) {
    return "Tu saldo en efectivo es **$ 104.370.000**. Con tu excedente mensual de $ 5.712.000, si lo inviertes con un rendimiento anual del 7%, tendrías **~$ 950.000.000 en 10 años**. Te recomiendo invertir al menos $ 2.856.000/mes (50% del excedente) en un fondo de índice de bajo costo. ¿Quieres que modele diferentes escenarios?";
  }
  if (lower.includes('factura') || lower.includes('servicio') || lower.includes('bills') || lower.includes('arriendo')) {
    return "Tus facturas y servicios suman **$ 6.762.000** este mes: arriendo $ 5.040.000, EPM $ 504.000, internet $ 377.958, celular $ 327.600, suscripciones $ 398.706. Esto es **$ 378.000 por debajo** de tu presupuesto de $ 7.140.000. EPM subió un 18% vs. el mes anterior — probablemente el aire acondicionado del verano normalizándose.";
  }

  return "He analizado tus patrones de gasto de **septiembre**. Clave: Shopping ($ 7.938.000), Facturas ($ 6.762.000) y Comida ($ 5.208.000) representan el **80%** de tus $ 24.528.000 de gasto mensual. Tienes $ 5.712.000 de margen antes de alcanzar el presupuesto. Tu patrimonio neto creció **$ 3.528.000** este mes. Pregúntame por cualquier categoría.";
}
