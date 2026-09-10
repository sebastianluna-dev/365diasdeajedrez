# Piezas

El juego «cburnett» que pinta el tablero (chessground), copiado a archivos
sueltos para que el selector de coronación, los figurines de las listas de
jugadas, los diagramas de las clases y del blog y la exportación a imagen
muestren exactamente las mismas piezas que el tablero.

Son obra de Colin M. L. Burnett y, según Wikimedia Commons, se publican bajo
CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0/). Llegan al
proyecto dentro de `@lichess-org/chessground` (`assets/chessground.cburnett.css`),
que las lleva incrustadas en base64. **No se editan a mano.**

## Regenerarlas

```
npm run pieces:sync
```

`scripts/sync-pieces.ts` lee esa hoja de `node_modules`, decodifica cada pieza
y la escribe aquí con el nombre que usan las hojas de la app (`w-knight.svg`,
`b-queen.svg`, …), añadiendo el `viewBox` que a los originales les falta y sin
el cual no escalan fuera del tablero.
