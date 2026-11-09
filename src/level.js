// =====================================================================
// BANAN – rita om den här filen som du vill!
//
// Varje tecken är en ruta (16x16 pixlar). Raderna läses uppifrån och ned.
// Alla rader bör vara lika långa (korta rader fylls ut med luft).
//
//   (mellanslag) eller .   luft
//   #   mark
//   S   stor sten (man kan stå på den)
//   =   väg (mark att gå på, med bilar och bussar). Gör den minst 10 rutor lång.
//   -   räls (mark att gå på, med tåg). Gör den minst 10 rutor lång.
//   ~   vatten (älgen kan simma: håll hoppknappen för att simma uppåt).
//       Gör en sjö genom att fylla rutor med ~ och ha mark (#) under.
//   P   startpunkt
//   F   kontrollpunkt (ett röse). Rör älgen det börjar den om där efter att ha ramlat
//       i ett hål, i stället för vid starten.
//   G   mål
//
//   k   saftig kvist av sälg/vide (10 poäng)
//   g   granskott (15 poäng)
//   b   blåbärsris (25 poäng)
//
//   B   björn (går fram och tillbaka, 150 poäng om man hoppar på den)
//   W   varg  (snabbare, 100 poäng)
//   H   jakthund med jägare efter sig. Hunden går först; går älgen in i den skäller
//       den och älgen blir förlamad en stund, då kan jägaren skjuta. Hoppa på hunden!
//       (jägaren placeras automatiskt 3 rutor till höger om hunden)
//   J   jägare i jakttorn (står stilla, siktar och skjuter när älgen kommer nära)
//   U   buss, C   bil: skriv dem på rutan OVANFÖR en väg (=). De kör åt vänster genom
//       hela vägen och kommer in från högerkanten igen. Alla fordon är farliga.
//   R   tåg: skriv på rutan OVANFÖR en räls (-). Varningsljus blinkar innan tåget kommer.
//
// Ett HÅL är bara en lucka i marken.
// =====================================================================

export const LEVEL_ROWS = [
  '                                                                                                                                                                                                                                                                      ',
  '                                                                                                                                                                                                                                                                      ',
  '                                                                                                                                                                                                                                                                      ',
  '                                                                                                                                                                                                                                                                      ',
  '                                                                                                                                                                                                                                                                      ',
  '                                                                                                                                                                                                                                                                      ',
  '                                                                                                                                                                                                                                                                      ',
  '                                        b                                                                                                                                       b                                                                                     ',
  '         b     k               k        S     k                                                        k          bb   b                  b    k         b             k     b  S              b     b                                                                ',
  '         S    k k        SS   k k      SSS   k k       S                      k k k   S              Sk k         SS   S    S             SS  k k        S            k k   SS  S           k  k  k  k  k                                                             ',
  ' P      SS        gg  W  SS J      B  SSSSS     b F W  S    J gg kkg      gS        k S   H  g g b  kS    F k B  SSSS WSk J Sgbk k  J   g SSk     F g W bS  b B     J     F SSkkS J  kb                     k  F b  SW          U    C    F        R            G     ',
  '##############   #############   ############   #############################~~~~~~~##################   #####################################   #####################   #################~~~~~S~~~~~S~~~~~~##############==============######------------############',
  '##############   #############   ############   #############################~~~~~~~##################   #####################################   #####################   #################~~~~~S~~~~~S~~~~~~##########################################################',
  '##############   #############   ############   ######################################################   #####################################   #####################   #############################################################################################',
];

// Miljöer anges som kolumnintervall (från och med – till och med).
// sight = hur långt (i pixlar, 16 per ruta) en jägare ser älgen i den miljön.
// På kalhygget finns inga träd som skymmer, så där syns älgen från långt håll.
// Namnen styr också hur landskapet ser ut: granskog, lövskog, kalhygge, vattendrag, vägen.
export const BIOMES = [
  { name: 'granskog', from: 0, to: 64, sight: 110 },
  { name: 'lövskog', from: 65, to: 124, sight: 130 },
  { name: 'kalhygge', from: 125, to: 184, sight: 240 },
  { name: 'vattendrag', from: 185, to: 209, sight: 200 },
  { name: 'vägen', from: 210, to: 999, sight: 220 },
];
