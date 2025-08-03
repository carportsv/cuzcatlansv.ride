# 📱 Comandos de Dispositivos - Taxi ZKT

## 🎯 **Comandos Principales de Ejecución**

### **📱 Dispositivo Samsung SM_T220 (Tablet)**
```bash
npx expo run:android --device SM_T220
```

### **📱 Dispositivo Samsung SM_A236U (Teléfono)**
```bash
npx expo run:android --device SM_A236U
```

---

## 🚀 **Comandos Adicionales Útiles**

### **📋 Ver dispositivos conectados**
```bash
adb devices
```

### **📱 Ejecutar en cualquier dispositivo Android**
```bash
npx expo run:android
```

### **📱 Ejecutar en emulador**
```bash
npx expo run:android --device emulator-5554
```

### **🔄 Limpiar cache y reinstalar**
```bash
npx expo run:android --clear
```

---

## 📋 **Comandos de Desarrollo**

### **🔧 Iniciar servidor de desarrollo**
```bash
npm start
```

### **📱 Abrir en Expo Go**
```bash
npx expo start
```

### **🔍 Debug mode**
```bash
npx expo start --dev-client
```

---

## ⚡ **Comandos Rápidos**

### **🚀 Ejecutar en SM_T220 (Tablet)**
```bash
npx expo run:android --device SM_T220
```

### **🚀 Ejecutar en SM_A236U (Teléfono)**
```bash
npx expo run:android --device SM_A236U
```

---

## 📝 **Notas Importantes**

- **SM_T220**: Dispositivo tablet Samsung
- **SM_A236U**: Dispositivo teléfono Samsung
- Asegúrate de tener los dispositivos conectados via USB
- Habilita la depuración USB en los dispositivos
- Los dispositivos deben estar autorizados en ADB

---

## 🔧 **Troubleshooting**

### **Si el dispositivo no aparece:**
```bash
adb kill-server
adb start-server
adb devices
```

### **Si hay problemas de conexión:**
```bash
npx expo start --tunnel
```

---

**📱 Estos comandos están siempre disponibles para ejecutar la aplicación Taxi ZKT en los dispositivos específicos.** 