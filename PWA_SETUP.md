# Configuración de GitHub Pages para PWA

Tu PWA está lista para desplegar. Sigue estos pasos:

## 1. Habilitar GitHub Pages

1. Ve a tu repositorio: https://github.com/arturovargas5567/Gastometro
2. Abre **Settings** → **Pages**
3. En "Build and deployment":
   - **Source**: selecciona "Deploy from a branch"
   - **Branch**: selecciona "main" y carpeta "/public"
4. Haz clic en "Save"

## 2. Tu URL PWA será:

```
https://arturovargas5567.github.io/Gastometro/
```

## 3. Cómo compartirla con tus amigos:

### Para iPhone (Safari):
1. Abre el enlace en Safari
2. Toca el botón "Compartir" (cuadro con flecha)
3. Selecciona "Añadir a pantalla de inicio"
4. Toca "Añadir"
5. ¡Listo! La app aparecerá en el home como una app nativa

### Para Android:
1. Abre el enlace en Chrome
2. Toca el menú (⋮) → "Instalar app"
3. ¡Listo!

## 4. Próximos pasos (opcional):

Si quieres que tu app Expo web se sirva automáticamente desde GitHub Pages, necesitas:

1. Ejecutar `yarn web` en la carpeta `frontend/`
2. Los archivos compilados deben estar en `public/`

## Archivos PWA creados:

✅ `public/manifest.json` - Configuración de la app
✅ `public/sw.js` - Service Worker (offline)
✅ `public/index.html` - Página de entrada

¡Tu PWA está lista! 🚀
