# Gastómetro - PRD

## Producto
App móvil (React Native / Expo) para registrar y analizar gastos personales. Idioma español. 100% local (AsyncStorage), sin backend ni autenticación.

## Stack
- Expo Router (file-based routing) con tabs y modal
- AsyncStorage para persistencia local
- react-native-svg para gráficos
- expo-blur, expo-linear-gradient, expo-haptics, expo-image
- Tema claro/oscuro con ThemeContext custom

## Estructura de navegación
- `(tabs)/index.tsx` - **Inicio** (Dashboard)
- `(tabs)/stats.tsx` - **Estadísticas**
- `(tabs)/goals.tsx` - **Objetivos** (límites por categoría + logros)
- `(tabs)/settings.tsx` - **Ajustes**
- `add-expense.tsx` - Modal para registrar gasto

## Funcionalidades implementadas
1. **Dashboard**: gasto del mes, presupuesto opcional con barra de progreso (verde/naranja/rojo según consumo), disponible y %, racha de días, contador de gastos, lista agrupada por fecha, empty state con imagen
2. **Registro de gastos**: FAB violeta con haptics, importe grande, chips de categoría horizontales (8 categorías), strip de fechas (14 días), descripción opcional, validación
3. **Estadísticas**: segmented Categorías/Semanal, donut chart por categoría con porcentajes, barras de evolución semanal (8 semanas), barras por día de semana, comparación mes vs mes anterior, "Análisis de hábitos" con mensajes motivadores
4. **Objetivos**: límites mensuales por categoría editables inline con barras de progreso (warn/error si >80%/100%), grid de 6 logros (first_expense, streak_7, under_budget, saver, explorer, fifty_expenses)
5. **Logros**: toast animado al desbloquear, evaluación automática al añadir gastos, persistencia
6. **Análisis de hábitos**: categoría top, diferencia % vs mes anterior, mensajes motivadores
7. **Ajustes**: presupuesto modal, moneda (EUR/USD/GBP/MXN/ARS), toggle tema oscuro, contador de gastos, borrar todos los datos con confirmación, marca de agua **"by appsthur"**
8. **Persistencia local** via AsyncStorage (expenses, settings, streak, achievements)

## Categorías
food (Comida), transport (Transporte), housing (Vivienda), shopping (Compras), leisure (Ocio), health (Salud), subscriptions (Suscripciones), other (Otros)

## Sin backend
No hay servidor ni endpoints API. La app funciona 100% en el dispositivo.
