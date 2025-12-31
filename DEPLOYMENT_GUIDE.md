# Guía de Despliegue y Uso Móvil

Esta guía explica cómo poner en línea la aplicación "Atérmicos Celina" y cómo instalarla en dispositivos iOS y Android para un acceso rápido.

## 1. Despliegue en Internet (Vercel)

La forma más fácil y gratuita de alojar esta aplicación Next.js es usando **Vercel**.

### Requisitos Previos
- Una cuenta en [Vercel](https://vercel.com/) (puedes usar tu cuenta de GitHub).
- El código fuente subido a un repositorio de **GitHub**.

### Pasos
1. **Subir a GitHub**: Asegúrate de que tu proyecto esté en un repositorio de GitHub.
2. **Importar en Vercel**:
   - Ve a tu dashboard de Vercel y haz clic en "Add New Project".
   - Selecciona "Import" junto a tu repositorio de GitHub.
   - En la configuración del proyecto ("Configure Project"), deja todo por defecto. Next.js es detectado automáticamente.
   - Haz clic en **Deploy**.
3. **URL Final**: Una vez termine el proceso, Vercel te dará una URL (ej: `atermicos-celina.vercel.app`). Esta es la dirección que compartirás o abrirás en los celulares.

---

## 2. Uso en iOS (iPhone/iPad)

Para usar la aplicación como si fuese una App nativa (pantalla completa, sin barra de navegación):

1. **Abrir Safari**: Ingresa a la URL de tu aplicación (la que obtuviste en el paso anterior).
2. **Botón Compartir**: Toca el ícono de "Compartir" (el cuadrado con una flecha hacia arriba) en la barra inferior.
3. **Agregar a Inicio**: Busca y selecciona la opción **"Agregar al inicio"** (Add to Home Screen).
4. **Confirmar**: Escribe el nombre que quieras (ej: "Atérmicos") y toca "Agregar".
5. **Listo**: Ahora verás el ícono de la app en tu pantalla de inicio. Al abrirla, se verá sin las barras del navegador.

---

## 3. Uso en Android

Similar a iOS, puedes instalarla como una Web App.

1. **Abrir Chrome**: Ingresa a la URL de la aplicación.
2. **Menú**: Toca los tres puntos verticales en la esquina superior derecha.
3. **Instalar**: Selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
4. **Confirmar**: Sigue las instrucciones para confirmar.
5. **Listo**: La app aparecerá en tu cajón de aplicaciones y en el inicio, funcionando a pantalla completa.

---

## Notas Adicionales

- **Actualizaciones**: Cuando hagas cambios en el código y los subas a GitHub, Vercel actualizará la aplicación automáticamente. Los usuarios solo necesitan cerrar y abrir la app (o refrescar) para ver los cambios.
- **Offline**: Esta aplicación depende de internet para cargar inicialmente, pero muchas funciones (como la calculadora una vez cargada) pueden funcionar si la conexión es intermitente, aunque para generar PDFs y guardar historial se recomienda conexión estable.
