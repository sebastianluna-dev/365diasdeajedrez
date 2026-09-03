# Stockfish

El módulo de análisis. Se sirve como programa aparte —corre en su propio Web
Worker, no está enlazado con el código de la plataforma— y conserva su licencia
GPL-3.0 en `LICENSE-stockfish.txt`.

Es la compilación **lite de un solo hilo** a propósito: las multihilo necesitan
`SharedArrayBuffer`, que exige las cabeceras COOP/COEP, y esas romperían las
imágenes de Cloudinary de las portadas de los cursos.

## Actualizarlo

```
npm install stockfish@<versión> --no-save
cp node_modules/stockfish/bin/stockfish-<v>-lite-single.js  public/engine/stockfish.js
cp node_modules/stockfish/bin/stockfish-<v>-lite-single.wasm public/engine/stockfish.wasm
cp node_modules/stockfish/Copying.txt public/engine/LICENSE-stockfish.txt
npm uninstall stockfish
```

Se copia en vez de depender del paquete porque éste pesa 250 MB —trae todas
sus compilaciones— y de él sólo se sirven estos dos archivos.
