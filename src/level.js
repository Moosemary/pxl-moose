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
  '                                                                                                                                  ',
  '                                                                                                                                  ',
  '                                                                                                                                  ',
  '                                                                                                                                  ',
  '                                                                                                                                  ',
  '                                                                                                                                  ',
  '                                          kk                                                                                      ',
  '                                    g     SS                                                         b                            ',
  '        b                           S    SSS              bb  kk                                                                  ',
  '        S     kkk     kk     b     SS   SSSS          gg      SS                          S                   g                   ',
  ' P  k  SS  W       gggSS J        SSS  SSSSS   k kBk  SS      SSS W g g kJb   H           S kk     U    C    gg      R       kGk  ',
  '##############   ###########   #########################~~~~~#################################==============####------------######',
  '##############   ###########   #########################~~~~~#####################################################################',
  '##############   ###########   ###################################################################################################',
];

// Miljöer anges som kolumnintervall (från och med – till och med).
// sight = hur långt (i pixlar, 16 per ruta) en jägare ser älgen i den miljön.
// På kalhygget finns inga träd som skymmer, så där syns älgen från långt håll.
export const BIOMES = [
  { name: 'granskog', from: 0, to: 29, sight: 110 },
  { name: 'lövskog', from: 30, to: 59, sight: 130 },
  { name: 'kalhygge', from: 60, to: 89, sight: 240 },
  { name: 'vägen', from: 90, to: 999, sight: 220 },
];
