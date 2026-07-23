# 🥫 Cuéntalo - PWA para el control de tu despensa

**Cuéntalo** es una Progressive Web App (PWA) para llevar el control de los productos de tu despensa desde el celular. Puedes agregar productos manualmente o escaneando el código de barras, modificar cantidades, filtrar por categoría y fecha de vencimiento, y mucho más.

> 🚀 Demo: [https://cuentalo-app.vercel.app](https://cuentalo-app.vercel.app)

---

## ✨ Características

- ➕ Agregar productos manualmente o escaneando el código de barras.
- 📷 Ver nombre, marca e imagen del producto gracias a la API de [Open Food Facts](https://world.openfoodfacts.org/).
- 🔢 Modificar cantidades con botones rápidos (+/-).
- 🗑️ Eliminar productos fácilmente.
- 🔍 Filtrar por categoría y fecha de vencimiento.
- 🔎 Buscador incorporado.
- 📲 Instalable como app en el celular.
- ☁️ Datos sincronizados en la nube.

---

## 🛠️ Stack tecnológico

| Área | Tecnología |
|------|------------|
| Frontend | HTML, CSS, JavaScript vanilla, PWA |
| Backend | Node.js, Express |
| Base de datos | MongoDB Atlas |
| API externa | Open Food Facts |
| Deploy | Render (backend) + Vercel (frontend) |

---

## 📋 Requisitos previos

Antes de empezar necesitas:

- [Node.js](https://nodejs.org/) instalado (versión 18 o superior).
- Una cuenta en [GitHub](https://github.com/).
- Una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas).
- Una cuenta en [Render](https://render.com/).
- Una cuenta en [Vercel](https://vercel.com/).

---

## 🖥️ Instalación local

1. Clona el repositorio:

```bash
git clone https://github.com/k0oz29/CuentaloAPP-public.git
cd CuentaloAPP-public
```

2. Instala las dependencias del backend:

```bash
npm install
```

3. Crea el archivo de variables de entorno:

```bash
cp Backend/.env.example Backend/.env
```

4. Completa `Backend/.env` con tu URI de MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5500
NODE_ENV=development
```

5. Inicia el servidor:

```bash
npm run dev
```

6. Abre el frontend con Live Server (u otro servidor estático) en:

```txt
http://localhost:5500
```

---

## 🚀 Deploy propio

### 1. Crear la base de datos en MongoDB Atlas

1. Crea un cluster gratuito.
2. Crea un usuario y contraseña para la base de datos.
3. En **Network Access**, agrega la IP `0.0.0.0/0`.
4. Copia la **connection string** (URI).

---

### 2. Subir el backend a Render

1. Ve a [Render](https://render.com) y crea una cuenta.
2. Haz click en **New → Web Service**.
3. Conecta tu repositorio de GitHub.
4. Completa la configuración:

| Campo | Valor |
|-------|-------|
| Name | `cuentalo-backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Root Directory | `./` |

5. En **Environment Variables**, agrega:

| Variable | Valor |
|----------|-------|
| `MONGODB_URI` | tu URI de MongoDB Atlas |
| `FRONTEND_URL` | `https://tu-url-vercel.vercel.app` |
| `NODE_ENV` | `production` |

6. Haz click en **Create Web Service**.

7. Copia la URL que te da Render, ejemplo:

```txt
https://cuentalo-backend-xxx.onrender.com
```

---

### 3. Actualizar la URL del backend en el frontend

Abre `Frontend/js/api.js` y reemplaza:

```js
: 'https://TU-URL-RENDER/api'
```

por la URL real de Render:

```js
: 'https://cuentalo-backend-xxx.onrender.com/api'
```

---

### 4. Subir el frontend a Vercel

1. Ve a [Vercel](https://vercel.com) y crea una cuenta.
2. Haz click en **Add New Project**.
3. Conecta tu repositorio de GitHub.
4. Configura el proyecto:

| Campo | Valor |
|-------|-------|
| Framework Preset | Other |
| Root Directory | `Frontend` |
| Build Command | (vacío) |
| Output Directory | `.` |

5. Haz click en **Deploy**.

6. Copia la URL que te da Vercel, ejemplo:

```txt
https://cuentalo-xxx.vercel.app
```

---

### 5. Actualizar el CORS del backend

Abre `app.js` y reemplaza:

```js
'https://TU-URL-VERCEL'
```

por la URL real de Vercel:

```js
'https://cuentalo-xxx.vercel.app'
```

Luego actualiza también la variable `FRONTEND_URL` en Render y haz un redeploy.

---

### 6. Mantener el backend activo (opcional)

El plan gratuito de Render se duerme después de inactividad. Si quieres evitarlo, configura un monitor en [UptimeRobot](https://uptimerobot.com):

| Campo | Valor |
|-------|-------|
| URL | `https://cuentalo-backend-xxx.onrender.com/api/productos` |
| Interval | 5 minutes |

---

## 🔧 Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGODB_URI` | URI de conexión a MongoDB Atlas | `mongodb+srv://...` |
| `FRONTEND_URL` | URL del frontend en Vercel | `https://cuentalo-xxx.vercel.app` |
| `NODE_ENV` | Modo de ejecución | `development` o `production` |

---

## ⚠️ Notas importantes

- La app **requiere internet** para funcionar.
- **No tiene autenticación de usuarios**: cualquiera con la URL del backend puede ver y modificar los datos. Es ideal para uso personal o familiar.
- El service worker está configurado para no cachear, así que las actualizaciones se reflejan inmediatamente.

---

## 🐛 Solución de problemas comunes

### "Cannot GET /"
La URL base del backend no tiene contenido. Prueba con:

```txt
https://tu-backend.onrender.com/api/productos
```

### Error de CORS
Asegúrate de que la URL de Vercel esté en `allowedOrigins` de `app.js` y en la variable `FRONTEND_URL` de Render.

### La app no se actualiza en el celular
Como no usa caché de PWA, borra la caché del navegador o prueba en modo incógnito.

### El backend se duerme
Configura UptimeRobot para hacer ping cada 5 minutos, o acepta que tarde unos segundos en despertar al entrar a la app.

---

## 📬 Contacto

Si tienes ideas, feedback o quieres charlar sobre el proyecto:

- 🔗 LinkedIn: [Benjamín Olivares](https://www.linkedin.com/in/benjaminolivares)
- 💬 Discord: `k0oz`

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo, modificarlo y adaptarlo libremente.
