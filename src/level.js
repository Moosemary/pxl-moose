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
//   k   saftig kvist av sälg/vide (10 poäng)
//   g   granskott (15 poäng)
//   b   blåbärsris (25 poäng)
//
//   B   björn (går fram och tillbaka, 150 poäng om man hoppar på den)
//   W   varg  (snabbare, 100 poäng)
//
// Kommer i senare steg (ignoreras än så länge):
//   ~ vatten    = väg
//   H jägare med hund            J jägare i torn
//   C bil       U buss      R tåg
//
// Ett HÅL är bara en lucka i marken.
// =====================================================================

export const LEVEL_ROWS = [
  '                                                                                          ',
  '                                                                                          ',
  '                                                                                          ',
  '                                                                                          ',
  '                                                                                          ',
  '                                                                                          ',
  '                                          kk                                              ',
  '                                    g     SS                                              ',
  '        b                           S    SSS              bb  kk                          ',
  '        S     kkk     kk     b     SS   SSSS          gg      SS                          ',
  ' P  k  SS  W       gggSS          SSS  SSSSS   k kBk  SS      SSS W g g k b     B   G     ',
  '##############   ###########   ##########################    #############################',
  '##############   ###########   ##########################    #############################',
];

// Miljöer anges som kolumnintervall (från och med – till och med).
export const BIOMES = [
  { name: 'granskog', from: 0, to: 29 },
  { name: 'lövskog', from: 30, to: 59 },
  { name: 'kalhygge', from: 60, to: 999 },
];
