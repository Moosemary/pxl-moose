// =====================================================================
// BANAN – rita om den här filen som du vill!
//
// Varje tecken är en ruta (16x16 pixlar). Raderna läses uppifrån och ned.
// Alla rader bör vara lika långa (korta rader fylls ut med luft).
//
//   (mellanslag) eller .   luft
//   #   mark
//   S   stor sten (man kan stå på den)
//   P   startpunkt
//   G   mål
//
// Kommer i senare steg (ignoreras än så länge):
//   ~ vatten    = väg       k kvist      b blåbärsris   g granskott
//   B björn     W varg      H jägare med hund            J jägare i torn
//   C bil       U buss      R tåg
//
// Ett HÅL är bara en lucka i marken.
// =====================================================================

export const LEVEL_ROWS = [
  '                                                                                ',
  '                                                                                ',
  '                                                                                ',
  '                                                                                ',
  '                                                                                ',
  '                                                                                ',
  '                                                                                ',
  '                                          SS                                    ',
  '                                    S    SSS                                    ',
  '        S                          SS   SSSS                  SS                ',
  ' P     SS             SS          SSS  SSSSS          SS      SSS                 G ',
  '##############   ###########   ##########################    #####################',
  '##############   ###########   ##########################    #####################',
];

// Miljöer anges som kolumnintervall (från och med – till och med).
export const BIOMES = [
  { name: 'granskog', from: 0, to: 29 },
  { name: 'lövskog', from: 30, to: 59 },
  { name: 'kalhygge', from: 60, to: 999 },
];
