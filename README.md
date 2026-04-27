# To Do List Lizeth

Aplicación móvil de gestión de tareas desarrollada con Ionic + Angular + Cordova,
compatible con Android e iOS.

## 🚀 Tecnologías

- **Ionic 7** — Framework de UI para apps móviles
- **Angular 20** — Framework frontend (componentes standalone)
- **Cordova** — Compilación nativa para Android e iOS
- **Firebase Remote Config** — Feature flags dinámicos
- **@ionic/storage-angular** — Almacenamiento local persistente
- **Tailwind CSS** — Estilos utilitarios

---

## 📋 Prerrequisitos

- Node.js v20+
- npm
- Ionic CLI
- Cordova
- Java JDK 17
- Android Studio + Android SDK (para Android)
- Xcode (para iOS — solo macOS)

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/LizethMartin/ToDoListLizeth.git
cd ToDoListLizeth
git checkout feature/android-ios-config
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

Crea el archivo `src/environments/environment.ts` con tu configuración de Firebase:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  }
};
```

---

## ▶️ Ejecutar la aplicación

### En el navegador (desarrollo)

```bash
ionic serve
```

Abre `http://localhost:8100`

### En Android

```bash
# Compilar Angular
ionic build

# Agregar plataforma (primera vez)
cordova platform add android

# Compilar y correr en emulador
cordova build android
cordova run android
```

El APK debug se genera en:
### En iOS (requiere macOS + Xcode)

```bash
ionic build
cordova platform add ios
cordova build ios --emulator
cordova emulate ios
```

### Build iOS con GitHub Actions (sin Mac)

El proyecto incluye un workflow en `.github/workflows/ios-build.yml` que compila
automáticamente para iOS en cada push a la rama `feature/android-ios-config`.

Para ejecutarlo:
1. Haz push a la rama
2. Ve a **Actions** en GitHub
3. Descarga el artefacto `app-ios-simulator`
