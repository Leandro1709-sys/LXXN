# 🔴 LXXN STATION V2

> **Sintetizador de Bolsillo Experimental & Manipulador de Ruido**
> *Creado con React Native & Expo*

![Estado del Proyecto](https://img.shields.io/badge/Status-Estable_v2.1-red) ![Licencia](https://img.shields.io/badge/License-MIT-black) ![Plataforma](https://img.shields.io/badge/Platform-Android-green)

---

## 📜 El Manifiesto: Software para Humanos

> "Vivimos rodeados de algoritmos que deciden qué vemos y qué escuchamos. LXXN LABS nace de una idea simple: Crear por el placer de crear. No buscamos el éxito de mercado. Buscamos cubrir una necesidad: hacer ruido, deformar la realidad y jugar."
>
> — **Leandro Martinez**, Creador.

---

## 🎛 Sobre el Proyecto

**LXXN STATION** no es solo una app; es un *Kaoss Pad* de bolsillo diseñado para la deconstrucción sónica. Rechaza las interfaces limpias y estandarizadas en favor de una estética **Cyberpunk Industrial**.

Permite manipular muestras de audio en tiempo real usando gestos táctiles y sensores de hardware. Sin publicidad. Sin rastreo de datos. Solo audio crudo.

### ✨ Características Clave

* **Síntesis XY Pad:** Arrastra el dedo para manipular el Tono (Eje X) y el Volumen (Eje Y) en tiempo real usando `react-native-reanimated`.
* **Sampling en Vivo:** Graba sonidos de tu entorno (micrófono) y cárgalos inmediatamente en el motor de audio.
* **Carga de Samples Propios:** Importa tus propios archivos `.mp3` o `.wav` desde el almacenamiento del dispositivo.
* **👁️ Theremin Óptico (Nuevo en V2):** Utiliza la cámara frontal y el sensor de luz ambiental para controlar el "Pitch" del audio basándose en la luminosidad (Lux).
* **Modo Loop:** Doble toque en cualquier slot para bloquear el sample en un bucle continuo.
* **Kill Switch:** Botón de silencio instantáneo para efectos de corte o pánico.

---

## 📸 Capturas de Pantalla

| Interfaz Principal | Manual / Data | Sensor Óptico |
|:---:|:---:|:---:|
| *(Agrega tu captura aquí)* | *(Agrega tu captura aquí)* | *(Agrega tu captura aquí)* |

---

## 🛠 Stack Tecnológico

* **Core:** React Native, Expo SDK 50+
* **Lenguaje:** TypeScript
* **Motor de Audio:** `expo-av`
* **Animaciones:** `react-native-reanimated 3` & `react-native-gesture-handler`
* **Sensores & Hardware:** `expo-sensors` (Luz), `expo-camera` (Visión), `expo-haptics` (Vibración)
* **Gestión de Archivos:** `expo-document-picker`, `expo-file-system`

---

## 🚀 Instalación y Configuración

Si quieres correr este proyecto localmente o contribuir:

1.  **Clonar el repositorio**
    ```bash
    git clone [https://github.com/tu-usuario/lxxn-station.git](https://github.com/tu-usuario/lxxn-station.git)
    cd lxxn-station
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    ```

3.  **Correr el proyecto**
    ```bash
    npx expo start
    ```

4.  **Probar en Dispositivo**
    * Descarga la app **Expo Go** en Android.
    * Escanea el código QR desde la terminal.

---

## 🕹 Controles

* **PADS (Grilla):** Toca para reproducir. Mantén y arrastra para deformar el audio.
* **RED PADS:** Bases rítmicas / Atmósferas.
* **BOTÓN MIC:** Mantén presionado para grabar. Suelta para guardar en el Slot U1.
* **BOTÓN CARPETA:** Carga un archivo de audio externo al Slot U1.
* **KILL ALL:** Detiene todos los sonidos activos inmediatamente.
* **BOTÓN OPTIC:** Activa el Modo Sensor de Luz (Controla el sonido con la luz ambiental).

---

## 🛣 Roadmap (Hoja de Ruta)

* [x] **V1.0:** Motor de Audio Core & XY Pad.
* [x] **V2.0:** Rediseño de UI (Cyberpunk) & Grabación de Micrófono.
* [x] **V2.1:** Theremin Óptico (Integración de Sensor de Luz).
* [ ] **Próximamente:** Secuenciador por Pasos (Step Sequencer).
* [ ] **Próximamente:** Visualizador de Audio en Tiempo Real (Skia).

---

## 👤 Autor

**Leandro Martinez**
* *Full Stack Developer | Audio Experimenter*
* [LinkedIn](Tu-URL-de-LinkedIn)
* [Portfolio](Tu-URL-de-Portfolio)

---

*Hecho con pasión desde el underground.* 🌑
