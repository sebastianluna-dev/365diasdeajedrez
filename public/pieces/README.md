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

## `elegida/`

El juego del sistema de diseño nuevo (Material 3 Expressive), el que pinta el
tablero de la lección (`ChessBoard look="material"`). Es dibujo propio del
dueño, en el lienzo de diseño («Pieza», juego «elegida»: el rey y la dama de
corona sola, las demás de la serie «redonda»); no viene de ninguna librería y
no lleva licencia ajena. Cada archivo se exportó desde ese componente con un
margen de 5 unidades por lado (`viewBox="-5 -5 110 110"`), para que la pieza
ocupe el 90 % de la casilla como en el diseño. El alfil y el caballo siguen
abiertos en el lienzo: cuando se elijan, se vuelven a exportar los doce.
