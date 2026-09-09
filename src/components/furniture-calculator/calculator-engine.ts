// @ts-nocheck
import { ROBOTO_LIGHT_B64, ROBOTO_MEDIUM_B64 } from './pdf-fonts';

export function initCalculatorEngine(container: HTMLElement) {
  if (typeof window === 'undefined') return;


  let lastCalc = null;
  // Kontrola ekonomiki wyceny — ustawienia wewnętrzne Yamury
  const minMarginControlEl = document.getElementById('minMarginControl');
  const riskReserveEl = document.getElementById('riskReserve');
  const designerCommissionEl = document.getElementById('designerCommission');


  // Fonty Roboto (wsparcie polskich znaków) do generowania PDF
  // ROBOTO_LIGHT_B64 imported from pdf-fonts

  // ROBOTO_MEDIUM_B64 imported from pdf-fonts

  const projectNameEl = document.getElementById('projectName');
  const clientNameEl = document.getElementById('clientName');
  const clientContactEl = document.getElementById('clientContact');
  const quoteDateEl = document.getElementById('quoteDate');
  const downloadDetailedPdfBtn = document.getElementById('downloadDetailedPdfBtn');
  const downloadClientPdfBtn = document.getElementById('downloadClientPdfBtn');
  const projectNameDisplay = document.getElementById('projectNameDisplay');
  const sheetWidthEl = document.getElementById('sheetWidth');
  const sheetHeightEl = document.getElementById('sheetHeight');
  const carcassBoardTypeEl = document.getElementById('carcassBoardType');
  const carcassPriceEl = document.getElementById('carcassPrice');
  const hdfTypeEl = document.getElementById('hdfType');
  const hdfPriceEl = document.getElementById('hdfPrice');
  const hdfManufacturerEl = document.getElementById('hdfManufacturer');
  const hdfSymbolEl = document.getElementById('hdfSymbol');
  const carcassManufacturerEl = document.getElementById('carcassManufacturer');
  const carcassSymbolEl = document.getElementById('carcassSymbol');
  const decorPresetEl = document.getElementById('decorPreset');
  const wasteFactorEl = document.getElementById('wasteFactor');
  const grainDirectionEl = document.getElementById('grainDirection');
  const edgingPriceThinEl = document.getElementById('edgingPriceThin');
  const edgingPriceThickEl = document.getElementById('edgingPriceThick');
  const edgingPriceLaserEl = document.getElementById('edgingPriceLaser');
  const doublingPriceEl = document.getElementById('doublingPrice');
  const cuttingPriceEl = document.getElementById('cuttingPrice');
  const furnitureTypeEl = document.getElementById('furnitureType');
  const projectFileInput = document.getElementById('projectFileInput');
  const projectUploadBtn = document.getElementById('projectUploadBtn');
  const projectFileName = document.getElementById('projectFileName');
  const projectAnalyzeStatus = document.getElementById('projectAnalyzeStatus');
  const agdSectionLabel = document.getElementById('agdSectionLabel');
  const agdSection = document.getElementById('agdSection');
  const agdBody = document.getElementById('agdBody');
  const addAgdBtn = document.getElementById('addAgdBtn');
  const agdMarginEl = document.getElementById('agdMargin');
  const elementsBody = document.getElementById('elementsBody');
  const addElementBtn = document.getElementById('addElementBtn');
  const frontTypeEl = document.getElementById('frontType');
  const frontAreaEl = document.getElementById('frontArea');
  const frontPriceEl = document.getElementById('frontPrice');
  const countertopFields = document.getElementById('countertopFields');
  const countertopTypeEl = document.getElementById('countertopType');
  const countertopLengthEl = document.getElementById('countertopLength');
  const countertopPriceEl = document.getElementById('countertopPrice');
  const countertopManufacturerEl = document.getElementById('countertopManufacturer');
  const countertopModelEl = document.getElementById('countertopModel');
  const assemblyCostEl = document.getElementById('assemblyCost');
  const transportCostEl = document.getElementById('transportCost');
  const designCostEl = document.getElementById('designCost');
  const marginEl = document.getElementById('margin');
  const vatRateEl = document.getElementById('vatRate');
  const accBody = document.getElementById('accBody');
  const addRowBtn = document.getElementById('addRowBtn');
  const otherBody = document.getElementById('otherBody');
  const addOtherBtn = document.getElementById('addOtherBtn');

  // Popularne dekory wg producentów, z orientacyjnymi średnimi cenami rynkowymi za m² (2026)
  const decorCatalog = {
    'Egger': [
      { code: 'H1180 ST37', name: 'Dąb Halifax naturalny', price: 125 },
      { code: 'H1385 ST40', name: 'Dąb Casella naturalny', price: 106 },
      { code: 'H1386 ST40', name: 'Dąb Casella brązowy', price: 106 },
      { code: 'H1367 ST40', name: 'Dąb Casella naturalny jasny', price: 106 },
      { code: 'H1714 ST19', name: 'Orzech Lincoln', price: 89 },
      { code: 'U750 ST9', name: 'Szary Taupe', price: 75 },
      { code: 'H3730 ST10', name: 'Hikora naturalna', price: 71 },
      { code: 'W1100 ST9', name: 'Biały alpejski', price: 71 },
      { code: 'H3157 ST12', name: 'Dąb Vicenza', price: 69 },
      { code: 'U705 ST9', name: 'Szary Angora', price: 69 },
      { code: 'H3303 ST10', name: 'Dąb Hamilton naturalny', price: 69 },
      { code: 'U899 ST9', name: 'Czerń aksamitna', price: 69 },
      { code: 'H3395 ST12', name: 'Dąb Corbridge naturalny', price: 64 },
      { code: 'U156 ST9', name: 'Beż piaskowy', price: 64 },
      { code: 'U763 ST9', name: 'Szary perłowy', price: 64 },
      { code: 'W1000 ST9', name: 'Biały premium', price: 61 },
      { code: 'H1318 ST10', name: 'Dąb dziki naturalny', price: 57 },
      { code: 'U702 ST9', name: 'Kaszmir', price: 57 },
      { code: 'H1145 ST10', name: 'Dąb Bardolino naturalny', price: 49 },
      { code: 'U708 ST9', name: 'Szary jasny', price: 45 },
      { code: 'U999 ST7', name: 'Czarny', price: 43 },
      { code: '5981 BS', name: 'Kaszmir (struktura BS)', price: 36 },
      { code: 'W960 ST7', name: 'Biały klasyczny', price: 39 },
    ],
    'Kronospan': [
      { code: 'K001 PW', name: 'Dąb Craft biały', price: 64 },
      { code: 'K002 PW', name: 'Dąb Craft szary', price: 64 },
      { code: 'K003 PW', name: 'Dąb Craft złoty', price: 61 },
      { code: 'K004 PW', name: 'Dąb Craft tobacco', price: 64 },
      { code: 'K005 PW', name: 'Dąb Urban Oyster', price: 64 },
      { code: 'K006 SN', name: 'Dąb Urban bursztynowy', price: 60 },
      { code: 'K007 PW', name: 'Dąb Urban kawowy', price: 64 },
      { code: 'K008 PW', name: 'Orzech Select jasny', price: 64 },
      { code: 'K009 PW', name: 'Orzech Select ciemny', price: 64 },
      { code: 'K010 SN', name: 'Sosna Loft biała', price: 55 },
      { code: 'K011 SN', name: 'Sosna Loft kremowa', price: 55 },
      { code: 'K012 SU', name: 'Buk Artisan perłowy', price: 58 },
      { code: 'K013 SU', name: 'Buk Artisan piaskowy', price: 58 },
      { code: 'K014 SU', name: 'Buk Artisan truflowy', price: 58 },
      { code: 'K015 PW', name: 'Vintage Marine Wood', price: 64 },
      { code: 'K016 PW', name: 'Carbon Marine Wood', price: 50 },
      { code: 'K017 PW', name: 'Wiąz Liberty jasny', price: 64 },
      { code: 'K018 PW', name: 'Wiąz Liberty dymiony', price: 64 },
      { code: 'K019 PW', name: 'Wiąz Liberty srebrny', price: 64 },
      { code: 'K020 PW', name: 'Orzech Select ciepły', price: 64 },
      { code: 'K021 SN', name: 'Blackwood jęczmienny', price: 60 },
      { code: 'K022 SN', name: 'Blackwood satynowy', price: 60 },
      { code: 'K076 PW', name: 'Dąb piaskowany', price: 64 },
      { code: 'K077 PW', name: 'Wiśnia Riverside jasna', price: 64 },
      { code: 'K078 PW', name: 'Wiśnia Riverside ciemna', price: 64 },
      { code: 'K079 PW', name: 'Dąb Clubhouse szary', price: 64 },
      { code: 'K080 PW', name: 'Dąb Coastland biały', price: 64 },
      { code: 'K081 PW', name: 'Dąb Coastland szampański', price: 64 },
      { code: 'K082 PW', name: 'Dąb Burbon', price: 64 },
      { code: '854 BS', name: 'Wenge', price: 50 },
      { code: '8681 SU', name: 'Biały brylantowy', price: 46 },
      { code: '8100 SM', name: 'Biały perłowy', price: 46 },
    ],
    'Pfleiderer': [
      { code: 'W2200', name: 'Biały', price: 50 },
      { code: 'W2201', name: 'Biały strukturalny', price: 52 },
      { code: 'W1027', name: 'Biel arktyczna', price: 58 },
      { code: 'U2101', name: 'Szary', price: 52 },
      { code: 'U1290', name: 'Antracyt', price: 58 },
      { code: 'U2200', name: 'Czarny', price: 55 },
      { code: 'R3102', name: 'Orzech Persja', price: 78 },
      { code: 'R3181', name: 'Dąb Sonoma', price: 65 },
      { code: 'R3197', name: 'Sonoma trufel', price: 68 },
      { code: 'R3215', name: 'Sonoma czekolada', price: 68 },
      { code: 'R3201', name: 'Dąb Windsor', price: 65 },
      { code: 'R3080', name: 'Legno ciemne', price: 68 },
      { code: 'R3025', name: 'Zebrano Negro', price: 68 },
      { code: 'R4121', name: 'Kasztan Wenge', price: 70 },
      { code: 'R4634', name: 'Olcha górska', price: 60 },
      { code: 'R4835', name: 'Orzech', price: 62 },
      { code: 'R4964', name: 'Grusza dzika', price: 58 },
      { code: 'R4966', name: 'Calvados', price: 60 },
      { code: 'R4968', name: 'Wiśnia Oxford', price: 60 },
      { code: 'R5111', name: 'Buk Bawaria', price: 55 },
    ],
    'Swiss Krono': [
      { code: 'D3025 OW', name: 'Dąb Sonoma', price: 45 },
      { code: 'U108 BS', name: 'Biały Alaska', price: 45 },
    ],
    'Kronopol': [
      { code: 'D3025 OW', name: 'Dąb Sonoma', price: 42 },
    ],
    'Falco (Fabryka Mebli)': [
      { code: '—', name: 'Ceny wg indywidualnego wzornika Falco', price: 55 },
    ],
    'Inny': []
  };

  const furniturePresets = {
    kuchnia: [
      { name: 'Bok szafki dolnej', w: 560, h: 720, qty: 6, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Wieniec górny szafki dolnej', w: 564, h: 560, qty: 3, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Dno szafki dolnej', w: 564, h: 560, qty: 3, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Plecy HDF szafki dolnej', w: 564, h: 720, qty: 3, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Półka szafki dolnej', w: 560, h: 500, qty: 3, edgesW: 1, edgesH: 0, edgeType: 'thick' },
      // Szafka z szufladami na systemie Blum (TANDEMBOX/LEGRABOX) — korpus + dna szuflad (metalowe boki dostarcza Blum, dno tnie się z płyty)
      { name: 'Bok szafki szufladowej (Blum)', w: 560, h: 720, qty: 2, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Wieniec górny/dno szafki szufladowej', w: 564, h: 560, qty: 2, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Plecy HDF szafki szufladowej', w: 564, h: 720, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Dno szuflady Blum (górna)', w: 500, h: 450, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Dno szuflady Blum (środkowa)', w: 500, h: 450, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Dno szuflady Blum (dolna)', w: 500, h: 450, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Bok szafki wiszącej', w: 300, h: 720, qty: 4, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Wieniec szafki wiszącej', w: 564, h: 300, qty: 4, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Plecy HDF szafki wiszącej', w: 564, h: 720, qty: 2, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Półka szafki wiszącej', w: 300, h: 500, qty: 2, edgesW: 1, edgesH: 0, edgeType: 'thick' },
      { name: 'Listwa cokołowa', w: 2400, h: 100, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thick' },
    ],
    szafa: [
      { name: 'Bok lewy szafy (2500 wys.)', w: 600, h: 2500, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Bok prawy szafy (2500 wys.)', w: 600, h: 2500, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Wieniec górny', w: 864, h: 600, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Wieniec dolny', w: 864, h: 600, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Przegroda pionowa', w: 600, h: 2464, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'thin' },
      { name: 'Plecy HDF', w: 864, h: 2500, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Półka', w: 420, h: 560, qty: 4, edgesW: 1, edgesH: 0, edgeType: 'thick' },
      { name: 'Półka na bieliznę (szuflady - dno)', w: 420, h: 500, qty: 3, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Listwa cokołowa', w: 900, h: 100, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thick' },
    ],
    kontenerek: [
      { name: 'Bok lewy kontenerka', w: 500, h: 600, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Bok prawy kontenerka', w: 500, h: 600, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Wieniec górny', w: 364, h: 500, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Wieniec dolny', w: 364, h: 500, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Plecy HDF', w: 364, h: 600, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Dno szuflady', w: 340, h: 450, qty: 3, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Bok szuflady', w: 450, h: 120, qty: 6, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Tył szuflady', w: 340, h: 120, qty: 3, edgesW: 0, edgesH: 0, edgeType: 'thin' },
    ],
    regal: [
      { name: 'Bok lewy regału', w: 350, h: 2000, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Bok prawy regału', w: 350, h: 2000, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Wieniec górny', w: 764, h: 350, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Wieniec dolny', w: 764, h: 350, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Przegroda pionowa', w: 350, h: 1964, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'thin' },
      { name: 'Plecy HDF', w: 764, h: 2000, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Półka', w: 372, h: 330, qty: 5, edgesW: 1, edgesH: 0, edgeType: 'thick' },
    ],
    biurko: [
      { name: 'Blat biurka (zdwojony)', w: 1200, h: 600, qty: 1, edgesW: 2, edgesH: 2, edgeType: 'laser', doubled: true },
      { name: 'Bok lewy (noga panelowa)', w: 600, h: 700, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Bok prawy (noga panelowa)', w: 600, h: 700, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Panel modesty (osłona tylna)', w: 1128, h: 400, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Wieniec wzmacniający dolny', w: 1128, h: 100, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Półka pod klawiaturę', w: 700, h: 300, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
    ],
    lazienka: [
      { name: 'Bok szafki pod umywalkę', w: 500, h: 600, qty: 2, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Wieniec górny szafki pod umywalkę', w: 464, h: 500, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Dno szafki pod umywalkę', w: 464, h: 500, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Plecy HDF wodoodporne (umywalka)', w: 464, h: 600, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Półka wewnętrzna (umywalka)', w: 464, h: 480, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thick' },
      { name: 'Bok słupka wysokiego', w: 300, h: 1800, qty: 2, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Wieniec słupka wysokiego', w: 264, h: 300, qty: 2, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Plecy HDF wodoodporne (słupek)', w: 264, h: 1800, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Półka słupka wysokiego', w: 264, h: 280, qty: 3, edgesW: 1, edgesH: 0, edgeType: 'thick' },
    ],
    biuro: [
      { name: 'Bok szafy aktowej', w: 400, h: 2000, qty: 2, edgesW: 0, edgesH: 1, edgeType: 'laser' },
      { name: 'Wieniec górny szafy aktowej', w: 764, h: 400, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Wieniec dolny szafy aktowej', w: 764, h: 400, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thin' },
      { name: 'Plecy HDF szafy aktowej', w: 764, h: 2000, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
      { name: 'Przegroda pionowa', w: 400, h: 1964, qty: 1, edgesW: 0, edgesH: 1, edgeType: 'thin' },
      { name: 'Półka szafy aktowej', w: 372, h: 380, qty: 5, edgesW: 1, edgesH: 0, edgeType: 'thick' },
      { name: 'Listwa cokołowa', w: 800, h: 100, qty: 1, edgesW: 1, edgesH: 0, edgeType: 'thick' },
    ],
    nietypowe: [
      { name: 'Element 1 (uzupełnij wymiary)', w: 0, h: 0, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' },
    ],
  };

  const agdItems = [
    { name: 'Piekarnik do zabudowy', price: 1800, cost: 150 },
    { name: 'Płyta indukcyjna', price: 1600, cost: 120 },
    { name: 'Płyta gazowa', price: 900, cost: 120 },
    { name: 'Zmywarka do zabudowy', price: 1700, cost: 180 },
    { name: 'Lodówka do zabudowy', price: 2900, cost: 200 },
    { name: 'Okap podszafkowy', price: 700, cost: 130 },
    { name: 'Okap do zabudowy (teleskopowy)', price: 1100, cost: 150 },
    { name: 'Mikrofalówka do zabudowy', price: 900, cost: 100 },
    { name: 'Zestaw piekarnik + mikrofalówka (kolumna)', price: 3200, cost: 250 },
    { name: 'Ekspres do kawy do zabudowy', price: 3500, cost: 150 },
  ];

  const defaultAccessories = [
    { name: 'Zawiasy', qty: 16, price: 12 },
    { name: 'Prowadnice do szuflad (komplet)', qty: 4, price: 60 },
    { name: 'Uchwyty meblowe', qty: 10, price: 15 },
    { name: 'Nóżki meblowe', qty: 8, price: 8 },
    { name: 'Siłowniki / podnośniki gazowe', qty: 2, price: 45 },
    { name: 'Oświetlenie LED (komplet)', qty: 1, price: 250 },
    { name: 'Kosze / cargo do szafek', qty: 2, price: 180 },
    { name: 'Cargo wysokie (słupek)', qty: 1, price: 450 },
    { name: 'System szuflad (np. Blum, Grass)', qty: 4, price: 120 },
    { name: 'Listwy maskujące / cokołowe', qty: 6, step: 1, price: 25 },
    { name: 'Śruby, konfirmaty, kołki montażowe', qty: 1, price: 150 },
  ];

  function formatPLN(value) {
    if (!isFinite(value)) value = 0;
    return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
  }

  function formatM2(value) {
    if (!isFinite(value)) value = 0;
    return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m²';
  }

  function enableExpandOnFocus(input, td) {
    input.addEventListener('focus', () => {
      td.style.position = 'relative';
      input.style.position = 'absolute';
      input.style.left = '0';
      input.style.top = '0';
      input.style.width = '280px';
      input.style.maxWidth = 'none';
      input.style.zIndex = '50';
      input.style.background = 'white';
      input.style.boxShadow = '0 4px 14px rgba(0,0,0,0.22)';
      input.style.border = '1.5px solid #a9714a';
      input.style.borderRadius = '5px';
    });
    input.addEventListener('blur', () => {
      input.style.position = '';
      input.style.left = '';
      input.style.top = '';
      input.style.width = '';
      input.style.maxWidth = '';
      input.style.zIndex = '';
      input.style.background = '';
      input.style.boxShadow = '';
      input.style.border = '';
      input.style.borderRadius = '';
    });
  }

  function createElementRow(item) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.className = 'acc-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = item.name || '';
    nameInput.placeholder = 'Nazwa elementu';
    nameInput.title = nameInput.value;
    nameInput.addEventListener('input', () => { nameInput.title = nameInput.value; calculate(); });
    enableExpandOnFocus(nameInput, tdName);
    tdName.appendChild(nameInput);

    const tdW = document.createElement('td');
    tdW.className = 'acc-dim';
    const wInput = document.createElement('input');
    wInput.type = 'number';
    wInput.min = '0';
    wInput.step = '1';
    wInput.value = item.w !== undefined ? item.w : 0;
    wInput.addEventListener('input', calculate);
    tdW.appendChild(wInput);

    const tdH = document.createElement('td');
    tdH.className = 'acc-dim';
    const hInput = document.createElement('input');
    hInput.type = 'number';
    hInput.min = '0';
    hInput.step = '1';
    hInput.value = item.h !== undefined ? item.h : 0;
    hInput.addEventListener('input', calculate);
    tdH.appendChild(hInput);

    const tdQty = document.createElement('td');
    tdQty.className = 'acc-qty-main';
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.step = '1';
    qtyInput.value = item.qty !== undefined ? item.qty : 0;
    qtyInput.addEventListener('input', calculate);
    tdQty.appendChild(qtyInput);

    const tdEdgesW = document.createElement('td');
    tdEdgesW.className = 'acc-qty';
    const edgesWInput = document.createElement('input');
    edgesWInput.type = 'number';
    edgesWInput.min = '0';
    edgesWInput.max = '2';
    edgesWInput.step = '1';
    edgesWInput.value = item.edgesW !== undefined ? item.edgesW : 0;
    edgesWInput.addEventListener('input', calculate);
    tdEdgesW.appendChild(edgesWInput);

    const tdEdgesH = document.createElement('td');
    tdEdgesH.className = 'acc-qty';
    const edgesHInput = document.createElement('input');
    edgesHInput.type = 'number';
    edgesHInput.min = '0';
    edgesHInput.max = '2';
    edgesHInput.step = '1';
    edgesHInput.value = item.edgesH !== undefined ? item.edgesH : 0;
    edgesHInput.addEventListener('input', calculate);
    tdEdgesH.appendChild(edgesHInput);

    const tdEdgeType = document.createElement('td');
    tdEdgeType.className = 'acc-edgetype';
    const edgeTypeSelect = document.createElement('select');
    edgeTypeSelect.style.fontSize = '11.5px';
    edgeTypeSelect.style.padding = '6px 4px';
    const optThin = document.createElement('option');
    optThin.value = 'thin';
    optThin.textContent = 'Cienka';
    const optThick = document.createElement('option');
    optThick.value = 'thick';
    optThick.textContent = 'Gruba (2mm)';
    const optLaser = document.createElement('option');
    optLaser.value = 'laser';
    optLaser.textContent = 'Laserowa';
    edgeTypeSelect.appendChild(optThin);
    edgeTypeSelect.appendChild(optThick);
    edgeTypeSelect.appendChild(optLaser);
    edgeTypeSelect.value = item.edgeType || 'thin';
    edgeTypeSelect.addEventListener('change', calculate);
    tdEdgeType.appendChild(edgeTypeSelect);

    const tdDouble = document.createElement('td');
    tdDouble.className = 'acc-double';
    const doubleCheckbox = document.createElement('input');
    doubleCheckbox.type = 'checkbox';
    doubleCheckbox.checked = !!item.doubled;
    doubleCheckbox.addEventListener('change', calculate);
    tdDouble.appendChild(doubleCheckbox);

    const tdMaterial = document.createElement('td');
    tdMaterial.className = 'acc-material';
    const materialSelect = document.createElement('select');
    materialSelect.style.fontSize = '11.5px';
    materialSelect.style.padding = '6px 4px';
    const optBoard = document.createElement('option');
    optBoard.value = 'board';
    optBoard.textContent = 'Płyta meblowa';
    const optHdf = document.createElement('option');
    optHdf.value = 'hdf';
    optHdf.textContent = 'HDF (plecy)';
    materialSelect.appendChild(optBoard);
    materialSelect.appendChild(optHdf);
    const defaultMaterial = item.material || (/HDF/i.test(item.name || '') ? 'hdf' : 'board');
    materialSelect.value = defaultMaterial;
    materialSelect.addEventListener('change', calculate);
    tdMaterial.appendChild(materialSelect);

    const tdArea = document.createElement('td');
    tdArea.className = 'acc-sum';
    tdArea.textContent = '0,00 m²';

    const tdRemove = document.createElement('td');
    tdRemove.className = 'acc-remove';
    tdRemove.textContent = '✕';
    tdRemove.title = 'Usuń element';
    tdRemove.addEventListener('click', () => {
      tr.remove();
      calculate();
    });

    tr.appendChild(tdName);
    tr.appendChild(tdW);
    tr.appendChild(tdH);
    tr.appendChild(tdQty);
    tr.appendChild(tdEdgesW);
    tr.appendChild(tdEdgesH);
    tr.appendChild(tdEdgeType);
    tr.appendChild(tdDouble);
    tr.appendChild(tdMaterial);
    tr.appendChild(tdArea);
    tr.appendChild(tdRemove);

    tr._nameInput = nameInput;
    tr._wInput = wInput;
    tr._hInput = hInput;
    tr._qtyInput = qtyInput;
    tr._edgesWInput = edgesWInput;
    tr._edgesHInput = edgesHInput;
    tr._edgeTypeSelect = edgeTypeSelect;
    tr._doubleCheckbox = doubleCheckbox;
    tr._materialSelect = materialSelect;
    tr._areaCell = tdArea;

    return tr;
  }

  function initElementRows(type) {
    const preset = furniturePresets[type] || furniturePresets.kuchnia;
    elementsBody.innerHTML = '';
    preset.forEach(item => {
      elementsBody.appendChild(createElementRow(item));
    });
  }

  function createAgdRow(item) {
    const tr = document.createElement('tr');

    const tdCheck = document.createElement('td');
    tdCheck.className = 'acc-remove';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.width = 'auto';
    checkbox.checked = !!item.checked;
    checkbox.addEventListener('change', calculate);
    tdCheck.appendChild(checkbox);

    const tdName = document.createElement('td');
    tdName.className = 'acc-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = item.name || '';
    nameInput.placeholder = 'Nazwa sprzętu';
    nameInput.title = nameInput.value;
    nameInput.addEventListener('input', () => { nameInput.title = nameInput.value; calculate(); });
    enableExpandOnFocus(nameInput, tdName);
    tdName.appendChild(nameInput);

    const tdManufacturer = document.createElement('td');
    tdManufacturer.className = 'acc-name';
    const manufacturerInput = document.createElement('input');
    manufacturerInput.type = 'text';
    manufacturerInput.value = item.manufacturer || '';
    manufacturerInput.placeholder = 'np. Bosch';
    manufacturerInput.addEventListener('input', calculate);
    tdManufacturer.appendChild(manufacturerInput);

    const tdModel = document.createElement('td');
    tdModel.className = 'acc-name';
    const modelInput = document.createElement('input');
    modelInput.type = 'text';
    modelInput.value = item.model || '';
    modelInput.placeholder = 'np. HBA574BS0';
    modelInput.addEventListener('input', calculate);
    tdModel.appendChild(modelInput);

    const tdPrice = document.createElement('td');
    tdPrice.className = 'acc-price';
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '10';
    priceInput.value = item.price !== undefined ? item.price : 0;
    priceInput.addEventListener('input', calculate);
    tdPrice.appendChild(priceInput);

    const tdCost = document.createElement('td');
    tdCost.className = 'acc-price';
    const costInput = document.createElement('input');
    costInput.type = 'number';
    costInput.min = '0';
    costInput.step = '5';
    costInput.value = item.cost !== undefined ? item.cost : 0;
    costInput.addEventListener('input', calculate);
    tdCost.appendChild(costInput);

    tr.appendChild(tdCheck);
    tr.appendChild(tdName);
    tr.appendChild(tdManufacturer);
    tr.appendChild(tdModel);
    tr.appendChild(tdPrice);
    tr.appendChild(tdCost);

    tr._checkbox = checkbox;
    tr._manufacturerInput = manufacturerInput;
    tr._modelInput = modelInput;
    tr._priceInput = priceInput;
    tr._costInput = costInput;

    return tr;
  }

  function initAgdRows() {
    agdBody.innerHTML = '';
    agdItems.forEach(item => {
      agdBody.appendChild(createAgdRow(item));
    });
  }

  addAgdBtn.addEventListener('click', () => {
    agdBody.appendChild(createAgdRow({ name: '', price: 0, cost: 0, checked: true }));
    calculate();
  });

  function updateAgdVisibility() {
    const extraHasKitchen = typeof extraFurnitureBlocks !== 'undefined' && extraFurnitureBlocks.some(b => b.typeSelect.value === 'kuchnia');
    const isKitchen = furnitureTypeEl.value === 'kuchnia' || extraHasKitchen;
    agdSectionLabel.style.display = isKitchen ? 'block' : 'none';
    agdSection.style.display = isKitchen ? 'block' : 'none';
    if (isKitchen) {
      const accOtherEl = document.getElementById('accOther');
      if (accOtherEl) accOtherEl.open = true;
    }
  }

  const nietypoweNameEl = document.getElementById('nietypoweName');
  nietypoweNameEl.addEventListener('input', calculate);

  const roomTypeEl = document.getElementById('roomType');
  const roomTypeOtherEl = document.getElementById('roomTypeOther');
  roomTypeEl.addEventListener('change', () => {
    document.getElementById('roomTypeOtherWrap').style.display = roomTypeEl.value === 'inne' ? 'block' : 'none';
    calculate();
  });
  roomTypeOtherEl.addEventListener('input', calculate);

  furnitureTypeEl.addEventListener('change', () => {
    initElementRows(furnitureTypeEl.value);
    updateAgdVisibility();
    if (furnitureTypeEl.value === 'lazienka') {
      carcassBoardTypeEl.value = '140';
      carcassPriceEl.value = '140';
    }
    document.getElementById('nietypoweHint').style.display = furnitureTypeEl.value === 'nietypowe' ? 'block' : 'none';
    document.getElementById('nietypoweNameWrap').style.display = furnitureTypeEl.value === 'nietypowe' ? 'block' : 'none';
    calculate();
  });

  const FURNITURE_TYPE_OPTIONS = [
    { value: 'kuchnia', label: 'Kuchnia' },
    { value: 'szafa', label: 'Szafa' },
    { value: 'kontenerek', label: 'Kontenerek' },
    { value: 'regal', label: 'Regał' },
    { value: 'biurko', label: 'Biurko' },
    { value: 'lazienka', label: 'Meble łazienkowe' },
    { value: 'biuro', label: 'Meble biurowe' },
    { value: 'nietypowe', label: 'Nietypowe zabudowy / inne' },
  ];

  function buildFurnitureTypeSelect(selectedValue) {
    const sel = document.createElement('select');
    FURNITURE_TYPE_OPTIONS.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      sel.appendChild(o);
    });
    sel.value = selectedValue;
    return sel;
  }

  const extraFurnitureContainer = document.getElementById('extraFurnitureContainer');
  const extraFurnitureBlocks = []; // { tbody, wrapper, typeSelect }
  let extraBlockCounter = 0;

  function getAllElementRows() {
    let rows = Array.from(elementsBody.children);
    extraFurnitureBlocks.forEach(b => { rows = rows.concat(Array.from(b.tbody.children)); });
    return rows;
  }

  function buildPieceSubsections(container) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-top:10px; padding:10px 10px 4px; background:var(--parchment-deep); border-radius:8px; border:1px solid var(--line);';

    wrap.innerHTML =
      '<div class="section-label" style="margin-top:0;">Płyta korpusowa (tego mebla)</div>' +
      '<div class="row"><div>' +
      '<label>Rodzaj płyty</label>' +
      '<select class="blk-boardType">' +
      '<option value="90">Płyta laminowana (melaminowana) — ~90 zł/m²</option>' +
      '<option value="120">Płyta MDF surowa — ~120 zł/m²</option>' +
      '<option value="180">Sklejka meblowa — ~180 zł/m²</option>' +
      '<option value="140">Płyta wodoodporna (do łazienek/kuchni) — ~140 zł/m²</option>' +
      '<option value="0">Inna / własna cena</option>' +
      '</select></div></div>' +
      '<div class="row">' +
      '<div><label>Producent płyty</label>' +
      '<select class="blk-boardManufacturer">' +
      '<option value="Egger">Egger</option>' +
      '<option value="Kronospan">Kronospan</option>' +
      '<option value="Pfleiderer">Pfleiderer</option>' +
      '<option value="Swiss Krono">Swiss Krono</option>' +
      '<option value="Falco (Fabryka Mebli)">Falco</option>' +
      '<option value="Kronopol">Kronopol</option>' +
      '<option value="Inny">Inny</option>' +
      '</select></div>' +
      '<div><label>Symbol / dekor płyty</label><input type="text" class="blk-boardSymbol" placeholder="np. H1180 ST37, U702 ST9"></div>' +
      '</div>' +
      '<div class="row">' +
      '<div><label>Cena płyty za m² (zł)</label><input type="number" class="blk-boardPrice" value="90" min="0" step="1"></div>' +
      '</div>' +
      '<div class="section-label">Płyta HDF — plecy (tego mebla)</div>' +
      '<div class="row"><div>' +
      '<label>Rodzaj HDF</label>' +
      '<select class="blk-hdfType">' +
      '<option value="25">HDF biały 3mm — ~25 zł/m²</option>' +
      '<option value="30">HDF biały 3,2mm — ~30 zł/m²</option>' +
      '<option value="35">HDF lakierowany (kolor) 3mm — ~35 zł/m²</option>' +
      '<option value="45">HDF wodoodporny — ~45 zł/m²</option>' +
      '<option value="0">Inny / własna cena</option>' +
      '</select></div>' +
      '<div><label>Cena HDF za m² (zł)</label><input type="number" class="blk-hdfPrice" value="25" min="0" step="1"></div>' +
      '</div>' +
      '<div class="row">' +
      '<div><label>Producent HDF</label><input type="text" class="blk-hdfManufacturer" placeholder="np. Egger, Kronospan"></div>' +
      '<div><label>Symbol / grubość HDF</label><input type="text" class="blk-hdfSymbol" placeholder="np. 3mm biały połysk"></div>' +
      '</div>' +
      '<div class="section-label">Fronty (tego mebla)</div>' +
      '<div class="row"><div>' +
      '<label>Rodzaj frontu</label>' +
      '<select class="blk-frontType">' +
      '<option value="150">Laminat — ~150 zł/m²</option>' +
      '<option value="320">MDF frezowany, malowany — ~320 zł/m²</option>' +
      '<option value="380">MDF lakierowany na wysoki połysk — ~380 zł/m²</option>' +
      '<option value="420">Fornir naturalny — ~420 zł/m²</option>' +
      '<option value="450">Szkło lakierowane — ~450 zł/m²</option>' +
      '<option value="400">Akryl — ~400 zł/m²</option>' +
      '<option value="0">Inny / własna cena</option>' +
      '</select></div></div>' +
      '<div class="row">' +
      '<div><label>Ilość m² frontów</label><input type="number" class="blk-frontArea" value="0" min="0" step="0.1"></div>' +
      '<div><label>Cena za m² (zł)</label><input type="number" class="blk-frontPrice" value="150" min="0" step="1"></div>' +
      '</div>' +
      '<div class="section-label">Blat (tego mebla)</div>' +
      '<div class="hint" style="margin-top:-4px; margin-bottom:6px;">Jeśli ten mebel nie ma blatu, zostaw długość na 0.</div>' +
      '<div class="row"><div>' +
      '<label>Rodzaj blatu</label>' +
      '<select class="blk-countertopType">' +
      '<option value="150">Blat laminowany — 150 zł/mb</option>' +
      '<option value="1400">Blat marmurowy — 1400 zł/mb</option>' +
      '<option value="1600">Blat ze spieku kwarcowego — 1600 zł/mb</option>' +
      '<option value="1400">Blat z konglomeratu kwarcowego — 1400 zł/mb</option>' +
      '<option value="650">Blat drewniany (dąb, buk) — 650 zł/mb</option>' +
      '<option value="900">Blat stalowy (stal nierdzewna) — 900 zł/mb</option>' +
      '<option value="1300">Blat Corian (solid surface) — 1300 zł/mb</option>' +
      '<option value="0">Inny / własna cena</option>' +
      '</select></div></div>' +
      '<div class="row">' +
      '<div><label>Długość blatu (mb)</label><input type="number" class="blk-countertopLength" value="0" min="0" step="0.1"></div>' +
      '<div><label>Cena za mb (zł)</label><input type="number" class="blk-countertopPrice" value="150" min="0" step="1"></div>' +
      '</div>' +
      '<div class="row">' +
      '<div><label>Producent blatu</label><input type="text" class="blk-countertopManufacturer" placeholder="np. Cosentino, Egger"></div>' +
      '<div><label>Model / kolor</label><input type="text" class="blk-countertopModel" placeholder="np. Calacatta Nuvo"></div>' +
      '</div>' +
      '<div class="section-label">Akcesoria i okucia (tego mebla)</div>' +
      '<div class="hint" style="margin-top:-4px; margin-bottom:6px;">Lista poniżej wypełniła się typowym zestawem startowym — dowolnie edytuj, usuwaj lub dodawaj pozycje pod ten konkretny mebel.</div>' +
      '<table class="acc-table"><thead><tr>' +
      '<th class="acc-name" style="width:22%;">Nazwa</th>' +
      '<th class="acc-name" style="width:16%;">Producent</th>' +
      '<th class="acc-name" style="width:18%;">Model</th>' +
      '<th class="acc-qty" style="width:10%;">Ilość</th>' +
      '<th class="acc-price" style="width:17%;">Cena jedn. (zł)</th>' +
      '<th class="acc-sum" style="width:13%;">Suma</th>' +
      '<th class="acc-remove"></th>' +
      '</tr></thead><tbody class="blk-accBody"></tbody></table>' +
      '<div class="add-row-btn blk-addAccBtn">+ Dodaj pozycję</div>' +
      '<div class="section-label">Inne składniki (tego mebla)</div>' +
      '<div class="hint" style="margin-top:-4px; margin-bottom:6px;">Dopisz dodatkowe pozycje dotyczące tylko tego mebla — np. malowanie na kolor RAL, nietypowy dojazd, demontaż.</div>' +
      '<table class="acc-table"><thead><tr>' +
      '<th class="acc-name">Nazwa</th>' +
      '<th class="acc-qty">Ilość</th>' +
      '<th class="acc-price">Cena jedn. (zł)</th>' +
      '<th class="acc-sum">Suma</th>' +
      '<th class="acc-remove"></th>' +
      '</tr></thead><tbody class="blk-otherBody"></tbody></table>' +
      '<div class="add-row-btn blk-addOtherBtn">+ Dodaj składnik wyceny</div>';

    container.appendChild(wrap);

    const refs = {
      boardTypeEl: wrap.querySelector('.blk-boardType'),
      boardManufacturerEl: wrap.querySelector('.blk-boardManufacturer'),
      boardSymbolEl: wrap.querySelector('.blk-boardSymbol'),
      boardPriceEl: wrap.querySelector('.blk-boardPrice'),
      hdfTypeEl: wrap.querySelector('.blk-hdfType'),
      hdfManufacturerEl: wrap.querySelector('.blk-hdfManufacturer'),
      hdfSymbolEl: wrap.querySelector('.blk-hdfSymbol'),
      hdfPriceEl: wrap.querySelector('.blk-hdfPrice'),
      frontTypeEl: wrap.querySelector('.blk-frontType'),
      frontAreaEl: wrap.querySelector('.blk-frontArea'),
      frontPriceEl: wrap.querySelector('.blk-frontPrice'),
      countertopTypeEl: wrap.querySelector('.blk-countertopType'),
      countertopLengthEl: wrap.querySelector('.blk-countertopLength'),
      countertopPriceEl: wrap.querySelector('.blk-countertopPrice'),
      countertopManufacturerEl: wrap.querySelector('.blk-countertopManufacturer'),
      countertopModelEl: wrap.querySelector('.blk-countertopModel'),
      accBody: wrap.querySelector('.blk-accBody'),
      otherBody: wrap.querySelector('.blk-otherBody')
    };

    refs.boardTypeEl.addEventListener('change', () => {
      const val = parseFloat(refs.boardTypeEl.value) || 0;
      if (val > 0) refs.boardPriceEl.value = val;
      calculate();
    });
    [refs.boardManufacturerEl, refs.boardSymbolEl, refs.boardPriceEl].forEach(el => {
      el.addEventListener('input', calculate);
      el.addEventListener('change', calculate);
    });

    refs.hdfTypeEl.addEventListener('change', () => {
      const val = parseFloat(refs.hdfTypeEl.value) || 0;
      if (val > 0) refs.hdfPriceEl.value = val;
      calculate();
    });
    [refs.hdfManufacturerEl, refs.hdfSymbolEl, refs.hdfPriceEl].forEach(el => {
      el.addEventListener('input', calculate);
      el.addEventListener('change', calculate);
    });

    refs.frontTypeEl.addEventListener('change', () => {
      const val = parseFloat(refs.frontTypeEl.value) || 0;
      if (val > 0) refs.frontPriceEl.value = val;
      calculate();
    });
    refs.countertopTypeEl.addEventListener('change', () => {
      const val = parseFloat(refs.countertopTypeEl.value) || 0;
      if (val > 0) refs.countertopPriceEl.value = val;
      calculate();
    });
    [refs.frontAreaEl, refs.frontPriceEl, refs.countertopLengthEl, refs.countertopPriceEl, refs.countertopManufacturerEl, refs.countertopModelEl].forEach(el => {
      el.addEventListener('input', calculate);
    });

    const addAccBtn = wrap.querySelector('.blk-addAccBtn');
    addAccBtn.addEventListener('click', () => {
      refs.accBody.appendChild(createAccessoryRowBrand({ name: '', qty: 1, price: 0 }));
      calculate();
    });
    defaultAccessories.forEach(item => {
      refs.accBody.appendChild(createAccessoryRowBrand(item));
    });

    const addOtherBtn = wrap.querySelector('.blk-addOtherBtn');
    addOtherBtn.addEventListener('click', () => {
      refs.otherBody.appendChild(createAccessoryRow({ name: '', qty: 1, price: 0 }));
      calculate();
    });

    return refs;
  }

  function createFurnitureBlock(initialType) {
    extraBlockCounter++;
    const label = 'Mebel #' + (extraBlockCounter + 1);

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'border:1.5px solid var(--line); border-radius:10px; margin-top:14px; overflow:hidden;';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; align-items:center; gap:10px; padding:10px 12px; background:var(--parchment); flex-wrap:wrap;';

    const title = document.createElement('div');
    title.textContent = label;
    title.style.cssText = 'font-weight:700; font-size:13px; color:var(--ink); white-space:nowrap;';
    header.appendChild(title);

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.textContent = '▲ Zwiń';
    toggleBtn.style.cssText = 'margin-left:auto; padding:6px 10px; font-size:12px; border:1px solid var(--bark); border-radius:6px; background:white; cursor:pointer; white-space:nowrap;';
    header.appendChild(toggleBtn);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '✕ Usuń mebel';
    removeBtn.style.cssText = 'padding:6px 10px; font-size:12px; border:1px solid var(--warn); color:var(--warn); border-radius:6px; background:white; cursor:pointer; white-space:nowrap;';
    header.appendChild(removeBtn);

    wrapper.appendChild(header);

    const typeRow = document.createElement('div');
    typeRow.style.cssText = 'padding:10px 12px; background:var(--parchment-deep); border-top:1px solid var(--line); border-bottom:1px solid var(--line);';

    const roomLabel = document.createElement('label');
    roomLabel.textContent = 'Pomieszczenie (gdzie wyceniamy ten mebel)';
    roomLabel.style.cssText = 'display:block; font-size:12px; font-weight:700; color:var(--ink); margin-bottom:5px;';
    typeRow.appendChild(roomLabel);

    const roomSelect = document.createElement('select');
    const ROOM_OPTIONS = ['Kuchnia', 'Sypialnia', 'Łazienka', 'Salon', 'Pokój syna', 'Pokój córki', 'Pokój dziecięcy', 'Pralnia', 'Pokój gościnny', 'Przedpokój / hol', 'Gabinet / biuro', 'Garaż', 'inne'];
    ROOM_OPTIONS.forEach(r => {
      const o = document.createElement('option');
      o.value = r;
      o.textContent = r === 'inne' ? 'Inne (wpisz jakie)' : r;
      roomSelect.appendChild(o);
    });
    roomSelect.style.cssText = 'width:100%; padding:8px 10px; font-size:13px; border:1px solid var(--bark); border-radius:6px; margin-bottom:8px;';
    typeRow.appendChild(roomSelect);

    const roomOtherWrap = document.createElement('div');
    roomOtherWrap.style.cssText = 'display:none; margin-bottom:8px;';
    const roomOtherInput = document.createElement('input');
    roomOtherInput.type = 'text';
    roomOtherInput.placeholder = 'Jakie to pomieszczenie? np. Spiżarnia, garderoba, taras';
    roomOtherInput.style.cssText = 'width:100%; box-sizing:border-box; padding:8px 10px; font-size:13px; border:1px solid var(--bark); border-radius:6px;';
    roomOtherInput.addEventListener('input', calculate);
    roomOtherWrap.appendChild(roomOtherInput);
    typeRow.appendChild(roomOtherWrap);

    roomSelect.addEventListener('change', () => {
      roomOtherWrap.style.display = roomSelect.value === 'inne' ? 'block' : 'none';
      calculate();
    });

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Jaki to mebel?';
    typeLabel.style.cssText = 'display:block; font-size:12px; font-weight:700; color:var(--ink); margin-bottom:5px;';
    typeRow.appendChild(typeLabel);

    const typeSelect = buildFurnitureTypeSelect(initialType);
    typeSelect.style.cssText = 'width:100%; padding:9px 10px; font-size:14px; font-weight:600; border:1.5px solid var(--clay); border-radius:8px; background:white; color:var(--ink);';
    typeRow.appendChild(typeSelect);

    const customNameWrap = document.createElement('div');
    customNameWrap.style.cssText = 'display:none; margin-top:8px;';
    const customNameLabel = document.createElement('label');
    customNameLabel.textContent = 'Jaki to mebel? (nazwa własna)';
    customNameLabel.style.cssText = 'display:block; font-size:12px; font-weight:700; color:var(--ink); margin-bottom:5px;';
    customNameWrap.appendChild(customNameLabel);
    const customNameInput = document.createElement('input');
    customNameInput.type = 'text';
    customNameInput.placeholder = 'np. Zabudowa wnęki pod schodami, ławka z siedziskiem';
    customNameInput.style.cssText = 'width:100%; box-sizing:border-box; padding:8px 10px; font-size:13px; border:1px solid var(--bark); border-radius:6px;';
    customNameInput.addEventListener('input', calculate);
    customNameWrap.appendChild(customNameInput);
    typeRow.appendChild(customNameWrap);

    wrapper.appendChild(typeRow);

    const body = document.createElement('div');
    body.style.cssText = 'padding:12px 4px;';

    const table = document.createElement('table');
    table.className = 'acc-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr>' +
      '<th class="acc-name">Nazwa elementu</th>' +
      '<th class="acc-dim">Szerokość<br>(mm)</th>' +
      '<th class="acc-dim">Wysokość<br>(mm)</th>' +
      '<th class="acc-qty-main">Ilość<br>(szt.)</th>' +
      '<th class="acc-qty">Kraw. na<br>szerokości<br>(0–2 szt.)</th>' +
      '<th class="acc-qty">Kraw. na<br>wysokości<br>(0–2 szt.)</th>' +
      '<th class="acc-edgetype">Rodzaj<br>oklejania</th>' +
      '<th class="acc-double">Zdwojona<br>(36mm)</th>' +
      '<th class="acc-material">Materiał</th>' +
      '<th class="acc-sum">Powierzchnia<br>(m²)</th>' +
      '<th class="acc-remove"></th>' +
      '</tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    body.appendChild(table);

    const addElBtn = document.createElement('div');
    addElBtn.className = 'add-row-btn';
    addElBtn.textContent = '+ Dodaj element';
    addElBtn.style.marginTop = '8px';
    addElBtn.addEventListener('click', () => {
      tbody.appendChild(createElementRow({ name: '', w: 0, h: 0, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' }));
      calculate();
    });
    body.appendChild(addElBtn);

    const pieceRefs = buildPieceSubsections(body);

    wrapper.appendChild(body);

    function loadPreset(type) {
      tbody.innerHTML = '';
      const preset = furniturePresets[type] || furniturePresets.kuchnia;
      preset.forEach(item => tbody.appendChild(createElementRow(item)));
    }
    loadPreset(initialType);

    typeSelect.addEventListener('change', () => {
      loadPreset(typeSelect.value);
      updateAgdVisibility();
      customNameWrap.style.display = typeSelect.value === 'nietypowe' ? 'block' : 'none';
      calculate();
    });

    let collapsed = false;
    toggleBtn.addEventListener('click', () => {
      collapsed = !collapsed;
      body.style.display = collapsed ? 'none' : 'block';
      toggleBtn.textContent = collapsed ? '▼ Rozwiń' : '▲ Zwiń';
    });

    removeBtn.addEventListener('click', () => {
      const idx = extraFurnitureBlocks.findIndex(b => b.wrapper === wrapper);
      if (idx !== -1) extraFurnitureBlocks.splice(idx, 1);
      wrapper.remove();
      updateAgdVisibility();
      calculate();
    });

    extraFurnitureContainer.appendChild(wrapper);
    extraFurnitureBlocks.push(Object.assign({ tbody, wrapper, typeSelect, customNameInput, roomSelect, roomOtherInput }, pieceRefs));
    updateAgdVisibility();
    calculate();

    if (typeof wrapper.scrollIntoView === 'function') {
      wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  addElementBtn.addEventListener('click', () => {
    elementsBody.appendChild(createElementRow({ name: '', w: 0, h: 0, qty: 1, edgesW: 0, edgesH: 0, edgeType: 'thin' }));
    calculate();
  });

  const addFurnitureBtn = document.getElementById('addFurnitureBtn');
  addFurnitureBtn.addEventListener('click', () => {
    createFurnitureBlock('kuchnia');
  });

  function createAccessoryRow(item) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.className = 'acc-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = item.name || '';
    nameInput.placeholder = 'Nazwa akcesorium';
    nameInput.title = nameInput.value;
    nameInput.addEventListener('input', () => { nameInput.title = nameInput.value; calculate(); });
    enableExpandOnFocus(nameInput, tdName);
    tdName.appendChild(nameInput);

    const tdQty = document.createElement('td');
    tdQty.className = 'acc-qty';
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.step = '1';
    qtyInput.value = item.qty !== undefined ? item.qty : 0;
    qtyInput.addEventListener('input', calculate);
    tdQty.appendChild(qtyInput);

    const tdPrice = document.createElement('td');
    tdPrice.className = 'acc-price';
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.5';
    priceInput.value = item.price !== undefined ? item.price : 0;
    priceInput.addEventListener('input', calculate);
    tdPrice.appendChild(priceInput);

    const tdSum = document.createElement('td');
    tdSum.className = 'acc-sum';
    tdSum.textContent = '0,00 zł';

    const tdRemove = document.createElement('td');
    tdRemove.className = 'acc-remove';
    tdRemove.textContent = '✕';
    tdRemove.title = 'Usuń pozycję';
    tdRemove.addEventListener('click', () => {
      tr.remove();
      calculate();
    });

    tr.appendChild(tdName);
    tr.appendChild(tdQty);
    tr.appendChild(tdPrice);
    tr.appendChild(tdSum);
    tr.appendChild(tdRemove);

    tr._qtyInput = qtyInput;
    tr._priceInput = priceInput;
    tr._sumCell = tdSum;

    return tr;
  }

  function createAccessoryRowBrand(item) {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.className = 'acc-name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = item.name || '';
    nameInput.placeholder = 'Nazwa akcesorium';
    nameInput.title = nameInput.value;
    nameInput.addEventListener('input', () => { nameInput.title = nameInput.value; calculate(); });
    enableExpandOnFocus(nameInput, tdName);
    tdName.appendChild(nameInput);

    const tdManufacturer = document.createElement('td');
    tdManufacturer.className = 'acc-name';
    const manufacturerInput = document.createElement('input');
    manufacturerInput.type = 'text';
    manufacturerInput.value = item.manufacturer || '';
    manufacturerInput.placeholder = 'np. Blum';
    manufacturerInput.addEventListener('input', calculate);
    tdManufacturer.appendChild(manufacturerInput);

    const tdModel = document.createElement('td');
    tdModel.className = 'acc-name';
    const modelInput = document.createElement('input');
    modelInput.type = 'text';
    modelInput.value = item.model || '';
    modelInput.placeholder = 'np. CLIP top BLUMOTION';
    modelInput.addEventListener('input', calculate);
    tdModel.appendChild(modelInput);

    const tdQty = document.createElement('td');
    tdQty.className = 'acc-qty';
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = '0';
    qtyInput.step = '1';
    qtyInput.value = item.qty !== undefined ? item.qty : 0;
    qtyInput.addEventListener('input', calculate);
    tdQty.appendChild(qtyInput);

    const tdPrice = document.createElement('td');
    tdPrice.className = 'acc-price';
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.min = '0';
    priceInput.step = '0.5';
    priceInput.value = item.price !== undefined ? item.price : 0;
    priceInput.addEventListener('input', calculate);
    tdPrice.appendChild(priceInput);

    const tdSum = document.createElement('td');
    tdSum.className = 'acc-sum';
    tdSum.textContent = '0,00 zł';

    const tdRemove = document.createElement('td');
    tdRemove.className = 'acc-remove';
    tdRemove.textContent = '✕';
    tdRemove.title = 'Usuń pozycję';
    tdRemove.addEventListener('click', () => {
      tr.remove();
      calculate();
    });

    tr.appendChild(tdName);
    tr.appendChild(tdManufacturer);
    tr.appendChild(tdModel);
    tr.appendChild(tdQty);
    tr.appendChild(tdPrice);
    tr.appendChild(tdSum);
    tr.appendChild(tdRemove);

    tr._manufacturerInput = manufacturerInput;
    tr._modelInput = modelInput;
    tr._qtyInput = qtyInput;
    tr._priceInput = priceInput;
    tr._sumCell = tdSum;

    return tr;
  }

  function initAccessoryRows() {
    accBody.innerHTML = '';
    defaultAccessories.forEach(item => {
      accBody.appendChild(createAccessoryRowBrand(item));
    });
  }

  addRowBtn.addEventListener('click', () => {
    accBody.appendChild(createAccessoryRowBrand({ name: '', qty: 1, price: 0 }));
    calculate();
  });

  function initOtherRows() {
    otherBody.innerHTML = '';
    // kilka pustych wierszy na start - do uzupełnienia wg konkretnej wyceny
    for (let i = 0; i < 3; i++) {
      otherBody.appendChild(createAccessoryRow({ name: '', qty: 1, price: 0 }));
    }
  }

  addOtherBtn.addEventListener('click', () => {
    otherBody.appendChild(createAccessoryRow({ name: '', qty: 1, price: 0 }));
    calculate();
  });

  function calculate() {
    const projectName = projectNameEl.value.trim();
    const quoteDate = quoteDateEl.value;
    const dateFormatted = quoteDate ? new Date(quoteDate).toLocaleDateString('pl-PL') : '';
    const headerParts = [projectName, dateFormatted].filter(Boolean);
    if (headerParts.length) {
      projectNameDisplay.textContent = headerParts.join(' — ');
      projectNameDisplay.style.display = 'block';
    } else {
      projectNameDisplay.style.display = 'none';
    }

    const sheetWidth = parseFloat(sheetWidthEl.value) || 0;
    const sheetHeight = parseFloat(sheetHeightEl.value) || 0;
    const sheetArea = (sheetWidth / 1000) * (sheetHeight / 1000);

    let rawArea = 0;
    let doubledArea = 0;
    let edgingLength = 0;
    let edgingCost = 0;
    const edgingPrices = {
      thin: parseFloat(edgingPriceThinEl.value) || 0,
      thick: parseFloat(edgingPriceThickEl.value) || 0,
      laser: parseFloat(edgingPriceLaserEl.value) || 0
    };

    const wasteFactor = parseFloat(wasteFactorEl.value) || 0;
    const carcassBoardPrice = parseFloat(carcassPriceEl.value) || 0;
    const hdfPrice = parseFloat(hdfPriceEl.value) || 0;
    const doublingPrice = parseFloat(doublingPriceEl.value) || 0;

    // Każdy mebel (główny + każdy dodany blok) ma własne fronty, blat i akcesoria —
    // liczymy każdy osobno, a potem sumujemy do wspólnych, zagregowanych kwot poniżej.
    function resolveRoom(select, otherInput) {
      return select.value === 'inne' ? (otherInput.value.trim() || 'Inne pomieszczenie') : select.value;
    }

    const pieces = [{
      label: (furnitureTypeEl.value === 'nietypowe' && nietypoweNameEl.value.trim()) ? nietypoweNameEl.value.trim() : furnitureTypeEl.options[furnitureTypeEl.selectedIndex].text,
      room: resolveRoom(roomTypeEl, roomTypeOtherEl),
      rowsEl: elementsBody,
      boardTypeEl: carcassBoardTypeEl, boardManufacturerEl: carcassManufacturerEl, boardSymbolEl: carcassSymbolEl, boardPriceEl: carcassPriceEl,
      hdfTypeEl, hdfManufacturerEl, hdfSymbolEl, hdfPriceEl,
      frontTypeEl, frontAreaEl, frontPriceEl,
      countertopTypeEl, countertopLengthEl, countertopPriceEl, countertopManufacturerEl, countertopModelEl,
      accBody, otherBody
    }];
    extraFurnitureBlocks.forEach(block => {
      pieces.push({
        label: (block.typeSelect.value === 'nietypowe' && block.customNameInput.value.trim()) ? block.customNameInput.value.trim() : block.typeSelect.options[block.typeSelect.selectedIndex].text,
        room: resolveRoom(block.roomSelect, block.roomOtherInput),
        rowsEl: block.tbody,
        boardTypeEl: block.boardTypeEl, boardManufacturerEl: block.boardManufacturerEl, boardSymbolEl: block.boardSymbolEl, boardPriceEl: block.boardPriceEl,
        hdfTypeEl: block.hdfTypeEl, hdfManufacturerEl: block.hdfManufacturerEl, hdfSymbolEl: block.hdfSymbolEl, hdfPriceEl: block.hdfPriceEl,
        frontTypeEl: block.frontTypeEl, frontAreaEl: block.frontAreaEl, frontPriceEl: block.frontPriceEl,
        countertopTypeEl: block.countertopTypeEl, countertopLengthEl: block.countertopLengthEl, countertopPriceEl: block.countertopPriceEl,
        countertopManufacturerEl: block.countertopManufacturerEl, countertopModelEl: block.countertopModelEl,
        accBody: block.accBody, otherBody: block.otherBody
      });
    });

    let carcassCost = 0, doublingCost = 0, frontCost = 0, countertopCost = 0, hardwareCost = 0, hdfCost = 0, otherCost = 0;
    let hdfRawArea = 0;
    let frontAreaTotal = 0;
    let hasCountertop = false;
    const hardwareItemsList = [];
    const otherItemsList = [];
    const furniturePieces = [];

    let cuttingLength = 0;
    const cuttingPrice = parseFloat(cuttingPriceEl.value) || 0;

    pieces.forEach(piece => {
      let pRawArea = 0, pDoubledArea = 0, pEdgingLength = 0, pEdgingCost = 0;
      let pHdfRawArea = 0, pHdfDoubledArea = 0;
      let pCuttingLength = 0;
      const pRows = [];

      Array.from(piece.rowsEl.children).forEach(tr => {
        const w = parseFloat(tr._wInput.value) || 0;
        const h = parseFloat(tr._hInput.value) || 0;
        const qty = parseFloat(tr._qtyInput.value) || 0;
        const edgesW = Math.min(Math.max(parseFloat(tr._edgesWInput.value) || 0, 0), 2);
        const edgesH = Math.min(Math.max(parseFloat(tr._edgesHInput.value) || 0, 0), 2);
        const edgeType = tr._edgeTypeSelect.value;
        const doubled = tr._doubleCheckbox.checked;
        const material = tr._materialSelect ? tr._materialSelect.value : 'board';
        const isHdf = material === 'hdf';

        const areaRow = (w / 1000) * (h / 1000) * qty;
        tr._areaCell.textContent = formatM2(areaRow) + (doubled ? ' (36mm)' : '');

        if (isHdf) {
          pHdfRawArea += doubled ? areaRow * 2 : areaRow;
          if (doubled) pHdfDoubledArea += areaRow;
        } else {
          pRawArea += doubled ? areaRow * 2 : areaRow;
          if (doubled) pDoubledArea += areaRow;
        }

        const edgingRow = qty * ((edgesW * w / 1000) + (edgesH * h / 1000));
        pEdgingLength += edgingRow;
        pEdgingCost += edgingRow * (edgingPrices[edgeType] || 0);

        const cuttingRow = qty * 2 * ((w / 1000) + (h / 1000));
        pCuttingLength += cuttingRow;

        pRows.push({
          name: tr._nameInput.value.trim() || '(bez nazwy)',
          w, h, qty, edgesW, edgesH, edgeType, doubled, material, area: areaRow
        });
      });

      const pAreaWithWaste = pRawArea * (1 + wasteFactor / 100);
      const pBoardPrice = parseFloat(piece.boardPriceEl.value) || 0;
      const pCarcassCost = pAreaWithWaste * pBoardPrice;
      const pDoublingCost = pDoubledArea * doublingPrice;

      const pHdfAreaWithWaste = pHdfRawArea * (1 + wasteFactor / 100);
      const pHdfPrice = parseFloat(piece.hdfPriceEl.value) || 0;
      const pHdfCost = pHdfAreaWithWaste * pHdfPrice;

      const pFrontArea = parseFloat(piece.frontAreaEl.value) || 0;
      const pFrontPrice = parseFloat(piece.frontPriceEl.value) || 0;
      const pFrontCost = pFrontArea * pFrontPrice;

      const pCountertopLength = parseFloat(piece.countertopLengthEl.value) || 0;
      const pCountertopPrice = parseFloat(piece.countertopPriceEl.value) || 0;
      const pHasCountertop = pCountertopLength > 0;
      const pCountertopCost = pHasCountertop ? pCountertopLength * pCountertopPrice : 0;
      if (pHasCountertop) hasCountertop = true;

      let pHardwareCost = 0;
      const pHardwareItemsList = [];
      Array.from(piece.accBody.children).forEach(tr => {
        const name = tr.querySelector('.acc-name input').value.trim();
        const manufacturer = tr._manufacturerInput.value.trim();
        const model = tr._modelInput.value.trim();
        const qty = parseFloat(tr._qtyInput.value) || 0;
        const price = parseFloat(tr._priceInput.value) || 0;
        const sum = qty * price;
        tr._sumCell.textContent = formatPLN(sum);
        pHardwareCost += sum;
        if (name && qty > 0) {
          const detailsSuffix = [manufacturer, model].filter(Boolean).join(' ');
          const displayName = detailsSuffix ? name + ' (' + detailsSuffix + ')' : name;
          pHardwareItemsList.push({ name, manufacturer, model, displayName, qty, price, sum });
        }
      });

      let pOtherCost = 0;
      const pOtherItemsList = [];
      Array.from(piece.otherBody.children).forEach(tr => {
        const name = tr.querySelector('.acc-name input').value.trim();
        const qty = parseFloat(tr._qtyInput.value) || 0;
        const price = parseFloat(tr._priceInput.value) || 0;
        const sum = qty * price;
        tr._sumCell.textContent = formatPLN(sum);
        pOtherCost += sum;
        if (name && qty > 0) pOtherItemsList.push({ name, qty, price, sum });
      });

      const pCuttingCost = pCuttingLength * cuttingPrice;

      const pSubtotal = pCarcassCost + pDoublingCost + pHdfCost + pEdgingCost + pCuttingCost + pFrontCost + pCountertopCost + pHardwareCost + pOtherCost;

      rawArea += pRawArea; doubledArea += pDoubledArea; edgingLength += pEdgingLength; edgingCost += pEdgingCost;
      cuttingLength += pCuttingLength;
      carcassCost += pCarcassCost; doublingCost += pDoublingCost; frontCost += pFrontCost; countertopCost += pCountertopCost; hardwareCost += pHardwareCost;
      hdfCost += pHdfCost; hdfRawArea += pHdfRawArea;
      otherCost += pOtherCost;
      frontAreaTotal += pFrontArea;
      hardwareItemsList.push(...pHardwareItemsList);
      otherItemsList.push(...pOtherItemsList);

      furniturePieces.push({
        label: piece.label,
        room: piece.room,
        rows: pRows,
        rawArea: pRawArea, areaWithWaste: pAreaWithWaste,
        carcassCost: pCarcassCost, doublingCost: pDoublingCost, edgingCost: pEdgingCost, edgingLength: pEdgingLength,
        cuttingCost: pCuttingCost, cuttingLength: pCuttingLength,
        boardPrice: pBoardPrice,
        boardTypeLabel: piece.boardTypeEl.options[piece.boardTypeEl.selectedIndex].text.replace(/ — .*$/, ''),
        boardManufacturer: piece.boardManufacturerEl.value,
        boardSymbol: piece.boardSymbolEl.value.trim(),
        hdfRawArea: pHdfRawArea, hdfAreaWithWaste: pHdfAreaWithWaste, hdfCost: pHdfCost, hdfPrice: pHdfPrice,
        hdfTypeLabel: piece.hdfTypeEl.options[piece.hdfTypeEl.selectedIndex].text.replace(/ — .*$/, ''),
        hdfManufacturer: piece.hdfManufacturerEl.value.trim(),
        hdfSymbol: piece.hdfSymbolEl.value.trim(),
        frontArea: pFrontArea, frontPrice: pFrontPrice, frontCost: pFrontCost,
        frontTypeLabel: piece.frontTypeEl.options[piece.frontTypeEl.selectedIndex].text.replace(/ — .*$/, ''),
        hasCountertop: pHasCountertop, countertopLength: pCountertopLength, countertopPrice: pCountertopPrice, countertopCost: pCountertopCost,
        countertopTypeLabel: piece.countertopTypeEl.options[piece.countertopTypeEl.selectedIndex].text.replace(/ — .*$/, ''),
        countertopManufacturer: piece.countertopManufacturerEl.value.trim(),
        countertopModel: piece.countertopModelEl.value.trim(),
        hardwareCost: pHardwareCost, hardwareItemsList: pHardwareItemsList,
        otherCost: pOtherCost, otherItemsList: pOtherItemsList,
        subtotal: pSubtotal
      });
    });

    const frontArea = frontAreaTotal;
    const cuttingCost = cuttingLength * cuttingPrice;

    document.getElementById('edgingLength').textContent = edgingLength.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mb';
    document.getElementById('cuttingLength').textContent = cuttingLength.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mb';

    const sheetWidthMm = sheetWidth, sheetHeightMm = sheetHeight; // zachowane dla czytelności, bez zmiany logiki
    const areaWithWaste = rawArea * (1 + wasteFactor / 100);
    const boardsNeeded = sheetArea > 0 ? Math.ceil(areaWithWaste / sheetArea) : 0;

    const hdfAreaWithWaste = hdfRawArea * (1 + wasteFactor / 100);
    const hdfBoardsNeeded = sheetArea > 0 ? Math.ceil(hdfAreaWithWaste / sheetArea) : 0;

    document.getElementById('sheetAreaLabel').textContent = formatM2(sheetArea);
    document.getElementById('rawArea').textContent = formatM2(rawArea);
    document.getElementById('areaWithWaste').textContent = formatM2(areaWithWaste);
    document.getElementById('boardsNeeded').textContent = boardsNeeded + ' szt.';
    document.getElementById('hdfAreaWithWaste').textContent = formatM2(hdfAreaWithWaste);
    document.getElementById('hdfBoardsNeeded').textContent = hdfBoardsNeeded + ' szt.';

    const totalPiecesCount = furniturePieces.reduce((sum, piece) => sum + piece.rows.reduce((s, r) => s + (r.qty || 0), 0), 0);
    document.getElementById('piecesCount').textContent = totalPiecesCount + ' szt.';

    let agdCost = 0;
    let agdRowsHtml = '';
    const agdItemsList = [];
    Array.from(agdBody.children).forEach(tr => {
      if (tr._checkbox.checked) {
        const name = tr.querySelector('.acc-name input').value.trim() || '(bez nazwy)';
        const manufacturer = tr._manufacturerInput.value.trim();
        const model = tr._modelInput.value.trim();
        const price = parseFloat(tr._priceInput.value) || 0;
        const cost = parseFloat(tr._costInput.value) || 0;
        const itemTotal = price + cost;
        agdCost += itemTotal;

        const detailsSuffix = [manufacturer, model].filter(Boolean).join(' ');
        const displayName = detailsSuffix ? name + ' (' + detailsSuffix + ')' : name;

        agdRowsHtml += '<div class="breakdown-row" style="font-size:12px;"><span>' + displayName + '</span><span>' + formatPLN(itemTotal) + '</span></div>';
        agdItemsList.push({ name, manufacturer, model, displayName, price, cost, itemTotal });
      }
    });

    const agdMargin = parseFloat(agdMarginEl.value) || 0;
    const agdMarginValue = agdCost * (agdMargin / 100);
    const agdTotalWithMargin = agdCost + agdMarginValue;
    const vatRate = parseFloat(vatRateEl.value) || 0;
    const agdTotalBrutto = agdTotalWithMargin * (1 + vatRate / 100);

    document.getElementById('agdResultBox').style.display = agdCost > 0 ? 'block' : 'none';
    document.getElementById('agdTotal').textContent = formatPLN(agdTotalWithMargin);
    document.getElementById('agdTotalBrutto').textContent = formatPLN(agdTotalBrutto);
    document.getElementById('agdBreakdown').innerHTML = agdRowsHtml
      + (agdMarginValue > 0 ? '<div class="breakdown-row" style="font-size:12px; font-weight:700; border-top:1px solid rgba(255,255,255,0.2); padding-top:6px; margin-top:4px;"><span>Marża (' + agdMargin + '%)</span><span>' + formatPLN(agdMarginValue) + '</span></div>' : '');

    const assemblyCost = parseFloat(assemblyCostEl.value) || 0;
    const transportCost = parseFloat(transportCostEl.value) || 0;
    const designCost = parseFloat(designCostEl.value) || 0;
    const margin = parseFloat(marginEl.value) || 0;

    const laborCost = assemblyCost + transportCost + designCost;
    const subtotal = carcassCost + hdfCost + doublingCost + edgingCost + cuttingCost + frontCost + countertopCost + hardwareCost + otherCost + laborCost;
    const riskReservePct = parseFloat(riskReserveEl.value) || 0;
    const riskReserveValue = subtotal * (riskReservePct / 100);
    const costAfterReserve = subtotal + riskReserveValue;
    const marginValue = costAfterReserve * (margin / 100);
    const baseTotal = costAfterReserve + marginValue;
    const designerCommissionPct = parseFloat(designerCommissionEl.value) || 0;
    const designerCommissionValue = baseTotal * (designerCommissionPct / 100);
    const total = baseTotal + designerCommissionValue;
    const totalBrutto = total * (1 + vatRate / 100);
    const actualMarginPct = baseTotal > 0 ? (marginValue / baseTotal) * 100 : 0;
    const minMarginPct = parseFloat(minMarginControlEl.value) || 0;
    const marginPass = actualMarginPct >= minMarginPct;

    document.getElementById('totalPrice').textContent = formatPLN(total);
    document.getElementById('totalPriceBrutto').textContent = formatPLN(totalBrutto);
    document.getElementById('stickyTotalValue').textContent = formatPLN(total) + ' netto';
    document.getElementById('stickyTotalBrutto').textContent = formatPLN(totalBrutto) + ' brutto';
    ['vatRateLabel1', 'vatRateLabel2', 'vatRateLabel3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = vatRate.toLocaleString('pl-PL', { maximumFractionDigits: 2 });
    });
    if (typeof lastCalc === 'undefined' || !lastCalc || lastCalc.total !== total) {
      ['totalPrice', 'stickyTotalValue'].forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('price-pulse');
        void el.offsetWidth;
        el.classList.add('price-pulse');
      });
    }
    document.getElementById('pricePerM2').textContent = frontArea > 0
      ? (total / frontArea).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł / m² frontu'
      : '0,00 zł / m² frontu';

    document.getElementById('bCarcass').textContent = formatPLN(carcassCost);
    document.getElementById('bDoubling').textContent = formatPLN(doublingCost);
    document.getElementById('bDoublingRow').style.display = doublingCost > 0 ? 'flex' : 'none';
    document.getElementById('bHdf').textContent = formatPLN(hdfCost);
    document.getElementById('bHdfRow').style.display = hdfCost > 0 ? 'flex' : 'none';
    document.getElementById('bEdging').textContent = formatPLN(edgingCost);
    document.getElementById('bCutting').textContent = formatPLN(cuttingCost);
    document.getElementById('bFront').textContent = formatPLN(frontCost);
    document.getElementById('bCountertop').textContent = formatPLN(countertopCost);
    document.getElementById('bCountertopRow').style.display = hasCountertop ? 'flex' : 'none';
    document.getElementById('bHardware').textContent = formatPLN(hardwareCost);
    document.getElementById('bOther').textContent = formatPLN(otherCost);
    document.getElementById('bLabor').textContent = formatPLN(laborCost);
    document.getElementById('bSubtotal').textContent = formatPLN(subtotal);
    document.getElementById('bMargin').textContent = formatPLN(marginValue);
    document.getElementById('bCommission').textContent = formatPLN(designerCommissionValue);
    document.getElementById('bCommissionRow').style.display = designerCommissionValue > 0 ? 'flex' : 'none';
    document.getElementById('bTotal').textContent = formatPLN(total);
    document.getElementById('bTotalBrutto').textContent = formatPLN(totalBrutto);

    const setBadge = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value > 0 ? formatPLN(value) : '';
      const acc = el ? el.closest('details.acc') : null;
      if (acc) acc.classList.toggle('acc-filled', value > 0);
    };
    setBadge('accBoardBadge', carcassCost + hdfCost + doublingCost);
    setBadge('accPiecesBadge', edgingCost + cuttingCost);
    setBadge('accFrontsBadge', frontCost);
    setBadge('accCountertopBadge', countertopCost);
    setBadge('accHardwareBadge', hardwareCost);
    setBadge('accOtherBadge', otherCost + agdCost);

    document.getElementById('controlCost').textContent = formatPLN(costAfterReserve);
    document.getElementById('controlProfit').textContent = formatPLN(marginValue);
    document.getElementById('controlMargin').textContent = actualMarginPct.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    const controlStatus = document.getElementById('controlStatus');
    controlStatus.textContent = marginPass
      ? '• KALKULACJA OK — marża rzeczywista jest powyżej ustalonego minimum.'
      : ' UWAGA — marża rzeczywista jest poniżej ustalonego minimum.';
    controlStatus.style.color = marginPass ? '#3f6b4a' : '#a13d2f';

    const accControlBadgeEl = document.getElementById('accControlBadge');
    if (accControlBadgeEl) {
      accControlBadgeEl.textContent = (marginPass ? '• ' : ' ') + actualMarginPct.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
      accControlBadgeEl.style.color = marginPass ? '#3f6b4a' : '#a13d2f';
    }

    const materialsDescription = [];
    const boardTypeLabel = carcassBoardTypeEl.options[carcassBoardTypeEl.selectedIndex].text.replace(/ — .*$/, '');
    const manufacturerText = carcassManufacturerEl.value;
    const symbolText = carcassSymbolEl.value.trim();
    let boardLine = boardTypeLabel + ', ' + manufacturerText;
    if (symbolText) boardLine += ', dekor: ' + symbolText;

    if (furniturePieces.length > 1) {
      const boardLines = furniturePieces.filter(p => p.carcassCost > 0).map(p => {
        const line = p.boardTypeLabel + ', ' + p.boardManufacturer + (p.boardSymbol ? ', dekor: ' + p.boardSymbol : '');
        return p.label + ' — ' + line;
      });
      materialsDescription.push({ label: 'Płyta korpusowa', value: boardLines.join('  •  ') });
    } else {
      materialsDescription.push({ label: 'Płyta korpusowa', value: boardLine });
    }

    if (hdfCost > 0) {
      const hdfTypeLabel = hdfTypeEl.options[hdfTypeEl.selectedIndex].text.replace(/ — .*$/, '');
      const hdfManufacturerVal = hdfManufacturerEl.value.trim();
      const hdfSymbolVal = hdfSymbolEl.value.trim();
      let hdfLine = hdfTypeLabel;
      if (hdfManufacturerVal) hdfLine += ', ' + hdfManufacturerVal;
      if (hdfSymbolVal) hdfLine += ', ' + hdfSymbolVal;
      hdfLine += ' — ' + formatM2(hdfAreaWithWaste) + ', ' + hdfBoardsNeeded + ' szt. arkuszy';
      materialsDescription.push({ label: 'Płyta HDF (plecy)', value: hdfLine });
    }

    if (frontArea > 0) {
      const frontTypeLabels = [...new Set(furniturePieces.filter(p => p.frontCost > 0).map(p => p.frontTypeLabel))];
      materialsDescription.push({ label: 'Fronty', value: frontTypeLabels.join(', ') });
    }
    if (hasCountertop) {
      const countertopLines = furniturePieces.filter(p => p.hasCountertop).map(p => {
        const details = [p.countertopManufacturer, p.countertopModel].filter(Boolean).join(' — ');
        return details ? p.countertopTypeLabel + ' (' + details + ')' : p.countertopTypeLabel;
      });
      materialsDescription.push({ label: 'Blat', value: [...new Set(countertopLines)].join(', ') });
    }
    materialsDescription.push({ label: 'Meble w wycenie', value: furniturePieces.map(p => p.label).join(' + ') });

    if (hardwareItemsList.length) {
      materialsDescription.push({ label: 'Akcesoria', value: hardwareItemsList.map(i => i.displayName).join(', ') });
    }

    // Szczegółowa lista pozycji (nazwa, symbol, ilość, cena, suma) do PDF dla firmy
    const detailedRows = [];
    const multiPieceBoards = furniturePieces.length > 1;

    if (multiPieceBoards) {
      furniturePieces.forEach((piece, idx) => {
        if (piece.carcassCost <= 0) return;
        detailedRows.push({
          name: piece.label + ' — ' + piece.boardTypeLabel + ' (' + piece.boardManufacturer + ')',
          symbol: piece.boardSymbol || '—',
          qty: formatM2(piece.areaWithWaste),
          price: formatPLN(piece.boardPrice) + '/m²',
          sum: piece.carcassCost
        });
      });
    } else {
      detailedRows.push({
        name: boardTypeLabel + ' — ' + manufacturerText,
        symbol: symbolText || '—',
        qty: boardsNeeded + ' szt.',
        price: formatPLN(carcassBoardPrice) + '/m²',
        sum: carcassCost
      });
    }

    if (hdfCost > 0) {
      const hdfTypeLabelRow = hdfTypeEl.options[hdfTypeEl.selectedIndex].text.replace(/ — .*$/, '');
      const hdfManufacturerRow = hdfManufacturerEl.value.trim();
      const hdfSymbolRow = hdfSymbolEl.value.trim();
      detailedRows.push({
        name: hdfTypeLabelRow + (hdfManufacturerRow ? ' — ' + hdfManufacturerRow : '') + ' (osobny materiał)',
        symbol: hdfSymbolRow || '—',
        qty: hdfBoardsNeeded + ' szt.',
        price: formatPLN(hdfPrice) + '/m²',
        sum: hdfCost
      });
    }

    if (doublingCost > 0) {
      detailedRows.push({
        name: 'Dopłata za zdwojenie płyty (36mm)',
        symbol: '—',
        qty: doubledArea.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m²',
        price: formatPLN(doublingPrice) + '/m²',
        sum: doublingCost
      });
    }

    if (edgingCost > 0) {
      detailedRows.push({
        name: 'Oklejanie krawędzi',
        symbol: '—',
        qty: edgingLength.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mb',
        price: '—',
        sum: edgingCost
      });
    }

    if (cuttingCost > 0) {
      detailedRows.push({
        name: 'Cięcie formatek (piła)',
        symbol: '—',
        qty: cuttingLength.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mb',
        price: formatPLN(cuttingPrice) + '/mb',
        sum: cuttingCost
      });
    }

    const multiPiece = furniturePieces.length > 1;

    furniturePieces.forEach(piece => {
      const piecePrefix = multiPiece ? piece.label + ' — ' : '';

      if (piece.frontCost > 0) {
        detailedRows.push({
          name: piecePrefix + piece.frontTypeLabel,
          symbol: '—',
          qty: piece.frontArea.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' m²',
          price: formatPLN(piece.frontPrice) + '/m²',
          sum: piece.frontCost
        });
      }

      if (piece.countertopCost > 0) {
        const countertopName = piece.countertopManufacturer ? piece.countertopTypeLabel + ' — ' + piece.countertopManufacturer : piece.countertopTypeLabel;
        detailedRows.push({
          name: piecePrefix + countertopName,
          symbol: piece.countertopModel || '—',
          qty: piece.countertopLength.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mb',
          price: formatPLN(piece.countertopPrice) + '/mb',
          sum: piece.countertopCost
        });
      }

      piece.hardwareItemsList.forEach(item => {
        detailedRows.push({
          name: piecePrefix + (item.manufacturer ? item.name + ' — ' + item.manufacturer : item.name),
          symbol: item.model || '—',
          qty: item.qty + ' szt.', price: formatPLN(item.price), sum: item.sum
        });
      });

      piece.otherItemsList.forEach(item => {
        detailedRows.push({
          name: piecePrefix + item.name, symbol: '—',
          qty: item.qty + ' szt.', price: formatPLN(item.price), sum: item.sum
        });
      });
    });

    const quoteBaseDate = quoteDateEl.value ? new Date(quoteDateEl.value) : new Date();
    const expiryDate = new Date(quoteBaseDate);
    expiryDate.setDate(expiryDate.getDate() + 21);

    lastCalc = {
      carcassCost, hdfCost, hdfRawArea, hdfAreaWithWaste, hdfBoardsNeeded, doublingCost, edgingCost, cuttingCost, cuttingLength, cuttingPrice, frontCost, countertopCost,
      hardwareCost, otherCost, laborCost, subtotal, riskReservePct, riskReserveValue, costAfterReserve, marginValue, actualMarginPct, minMarginPct, marginPass, total,
      vatRate, totalBrutto, agdTotalBrutto, designerCommissionPct, designerCommissionValue, baseTotal,
      hardwareItemsList, otherItemsList, detailedRows, furniturePieces,
      agdCost, agdItemsList, agdMargin, agdMarginValue, agdTotalWithMargin, margin, materialsDescription,
      boardsNeeded: document.getElementById('boardsNeeded').textContent,
      furnitureType: furnitureTypeEl.options[furnitureTypeEl.selectedIndex].text,
      projectName: projectNameEl.value.trim() || 'Mebel na wymiar',
      clientName: clientNameEl.value.trim(),
      clientContact: clientContactEl.value.trim(),
      dateFormatted: quoteDateEl.value ? new Date(quoteDateEl.value).toLocaleDateString('pl-PL') : new Date().toLocaleDateString('pl-PL'),
      expiryDateFormatted: expiryDate.toLocaleDateString('pl-PL')
    };
  }

  carcassBoardTypeEl.addEventListener('change', () => {
    const val = parseFloat(carcassBoardTypeEl.value) || 0;
    if (val > 0) carcassPriceEl.value = val;
    calculate();
  });

  hdfTypeEl.addEventListener('change', () => {
    const val = parseFloat(hdfTypeEl.value) || 0;
    if (val > 0) hdfPriceEl.value = val;
    calculate();
  });

  function refreshDecorPresetOptions() {
    const manufacturer = carcassManufacturerEl.value;
    const decors = decorCatalog[manufacturer] || [];
    decorPresetEl.innerHTML = '<option value="">— wybierz, żeby uzupełnić symbol i cenę automatycznie —</option>';
    decors.forEach((d, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = d.code + ' — ' + d.name + ' (~' + d.price + ' zł/m²)';
      decorPresetEl.appendChild(opt);
    });
  }

  carcassManufacturerEl.addEventListener('change', () => {
    refreshDecorPresetOptions();
  });

  decorPresetEl.addEventListener('change', () => {
    const manufacturer = carcassManufacturerEl.value;
    const decors = decorCatalog[manufacturer] || [];
    const idx = decorPresetEl.value;
    if (idx === '') return;
    const decor = decors[idx];
    if (!decor) return;
    carcassSymbolEl.value = decor.code + (decor.name ? ' ' + decor.name : '');
    if (decor.price) carcassPriceEl.value = decor.price;
    calculate();
  });

  refreshDecorPresetOptions();

  frontTypeEl.addEventListener('change', () => {
    const val = parseFloat(frontTypeEl.value) || 0;
    if (val > 0) frontPriceEl.value = val;
    calculate();
  });

  countertopTypeEl.addEventListener('change', () => {
    const val = parseFloat(countertopTypeEl.value) || 0;
    if (val > 0) countertopPriceEl.value = val;
    calculate();
  });

  [countertopLengthEl, countertopPriceEl, countertopManufacturerEl, countertopModelEl].forEach(el => {
    el.addEventListener('input', calculate);
  });

  projectNameEl.addEventListener('input', calculate);
  quoteDateEl.addEventListener('input', calculate);

  // domyślnie dzisiejsza data
  const today = new Date();
  quoteDateEl.value = today.toISOString().slice(0, 10);

  [sheetWidthEl, sheetHeightEl, carcassPriceEl, hdfPriceEl, hdfManufacturerEl, hdfSymbolEl, carcassManufacturerEl, carcassSymbolEl, wasteFactorEl, edgingPriceThinEl, edgingPriceThickEl, edgingPriceLaserEl, doublingPriceEl, cuttingPriceEl, frontAreaEl, frontPriceEl,
   assemblyCostEl, transportCostEl, designCostEl, marginEl, vatRateEl, agdMarginEl, minMarginControlEl, riskReserveEl, designerCommissionEl].forEach(el => {
    el.addEventListener('input', calculate);
  });

  function drawGradientRect(doc, x, y, w, h, colorA, colorB, radius) {
    const steps = 40;
    const stepW = w / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(colorA[0] + (colorB[0] - colorA[0]) * t);
      const g = Math.round(colorA[1] + (colorB[1] - colorA[1]) * t);
      const b = Math.round(colorA[2] + (colorB[2] - colorA[2]) * t);
      doc.setFillColor(r, g, b);
      // lekki naddatek żeby uniknąć białych przerw między paskami
      doc.rect(x + i * stepW, y, stepW + 0.3, h, 'F');
    }
    if (radius) {
      // maskowanie rogów białym tłem strony, by uzyskać zaokrąglenie
      doc.setDrawColor(255, 255, 255);
    }
  }

  const NAVY = [26, 26, 26];
  const TEAL = [169, 113, 74];
  const GRAY = [55, 65, 81];

  function registerFonts(doc) {
    doc.addFileToVFS('Roboto-Light.ttf', ROBOTO_LIGHT_B64);
    doc.addFont('Roboto-Light.ttf', 'RobotoLight', 'normal');
    doc.addFileToVFS('Roboto-Medium.ttf', ROBOTO_MEDIUM_B64);
    doc.addFont('Roboto-Medium.ttf', 'RobotoMedium', 'normal');
  }

  const LIGHT = 'RobotoLight';
  const MEDIUM = 'RobotoMedium';
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN_X = 16;
  const BOTTOM_LIMIT = 275;

  function ensureSpace(doc, y, needed) {
    if (y + needed > BOTTOM_LIMIT) {
      doc.addPage();
      return 20;
    }
    return y;
  }

  function drawPdfHeader(doc, tagline) {
    drawGradientRect(doc, 0, 0, PAGE_W, 40, NAVY, TEAL);
    doc.setTextColor(255, 255, 255);
    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(19);
    doc.text('Y \u039B M U R \u039B', PAGE_W / 2, 17, { align: 'center' });
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(11);
    doc.text('yamura.pl', PAGE_W / 2, 26, { align: 'center' });
    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(8.5);
    doc.text(tagline, PAGE_W / 2, 33.5, { align: 'center', charSpace: 0.6 });
    return 52;
  }

  // ============ Rozkrój płyt — proste pakowanie formatek na arkusze (algorytm "shelf") ============
  function packSheets(pieces, sheetW, sheetH, kerf, allowRotate) {
    kerf = kerf || 4;
    const sorted = pieces.slice().sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));
    const sheets = [];
    let current, shelfY, shelfH, cursorX;

    function newSheet() {
      current = [];
      sheets.push(current);
      shelfY = kerf;
      shelfH = 0;
      cursorX = kerf;
    }
    newSheet();

    sorted.forEach(p => {
      function fitsHere(w, h) {
        return cursorX + w <= sheetW - kerf && shelfY + h <= sheetH - kerf;
      }

      let placement = null;
      if (fitsHere(p.w, p.h)) placement = { w: p.w, h: p.h };
      else if (allowRotate && fitsHere(p.h, p.w)) placement = { w: p.h, h: p.w };

      if (!placement) {
        // nowa półka na tym samym arkuszu
        const testShelfY = shelfY + shelfH + kerf;
        if (p.w <= sheetW - 2 * kerf && testShelfY + p.h <= sheetH - kerf) {
          shelfY = testShelfY; shelfH = 0; cursorX = kerf;
          placement = { w: p.w, h: p.h };
        } else if (allowRotate && p.h <= sheetW - 2 * kerf && testShelfY + p.w <= sheetH - kerf) {
          shelfY = testShelfY; shelfH = 0; cursorX = kerf;
          placement = { w: p.h, h: p.w };
        } else {
          // nowy arkusz
          newSheet();
          if (p.w <= sheetW - 2 * kerf && p.h <= sheetH - 2 * kerf) {
            placement = { w: p.w, h: p.h };
          } else if (allowRotate && p.h <= sheetW - 2 * kerf && p.w <= sheetH - 2 * kerf) {
            placement = { w: p.h, h: p.w };
          } else {
            placement = { w: p.w, h: p.h };
          }
        }
      }

      current.push({ x: cursorX, y: shelfY, w: placement.w, h: placement.h, label: p.label, rotated: placement.w !== p.w });
      cursorX += placement.w + kerf;
      shelfH = Math.max(shelfH, placement.h);
    });

    return sheets;
  }

  function drawSheetDiagram(doc, y, sheet, sheetW, sheetH, sheetIndex, totalSheets, materialLabel) {
    const availWidth = PAGE_W - 2 * MARGIN_X;
    const scale = availWidth / sheetW;
    const diagH = sheetH * scale;
    y = ensureSpace(doc, y, diagH + 12);

    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(26, 26, 26);
    doc.text(materialLabel + ' — arkusz ' + sheetIndex + '/' + totalSheets + '  (' + sheetW + ' × ' + sheetH + ' mm)', MARGIN_X, y);
    y += 5;

    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.setFillColor(250, 250, 248);
    doc.rect(MARGIN_X, y, availWidth, diagH, 'FD');

    sheet.forEach(p => {
      const px = MARGIN_X + p.x * scale;
      const py = y + p.y * scale;
      const pw = p.w * scale;
      const ph = p.h * scale;
      doc.setFillColor(...(p.rotated ? [214, 232, 214] : [232, 221, 206]));
      doc.setDrawColor(...(p.rotated ? [74, 130, 74] : [169, 113, 74]));
      doc.setLineWidth(0.25);
      doc.rect(px, py, pw, ph, 'FD');
      if (pw > 11 && ph > 5) {
        doc.setFont(LIGHT, 'normal');
        doc.setFontSize(Math.max(4.5, Math.min(6.5, ph * 0.32)));
        doc.setTextColor(p.rotated ? 30 : 80, p.rotated ? 90 : 60, p.rotated ? 30 : 45);
        const label = p.w + '×' + p.h + (p.rotated ? ' ⟲' : '');
        doc.text(label, px + pw / 2, py + ph / 2, { align: 'center', baseline: 'middle' });
      }
    });

    y += diagH + 8;
    return y;
  }

  function drawRozkroj(doc, y) {
    const sheetWVal = parseFloat(sheetWidthEl.value) || 2800;
    const sheetHVal = parseFloat(sheetHeightEl.value) || 2050;
    const kerf = 4;

    const boardPieces = [];
    const hdfPieces = [];
    lastCalc.furniturePieces.forEach(piece => {
      piece.rows.forEach(row => {
        const qty = Math.max(0, Math.round(row.qty) || 0);
        for (let i = 0; i < qty; i++) {
          const item = { w: Math.round(row.w), h: Math.round(row.h), label: piece.label + ': ' + row.name };
          (row.material === 'hdf' ? hdfPieces : boardPieces).push(item);
        }
      });
    });

    function renderMaterialSheets(pieces, materialLabel, allowRotate) {
      if (!pieces.length) return;
      const oversized = pieces.filter(p => p.w > sheetWVal - 2 * kerf || p.h > sheetHVal - 2 * kerf);
      const packable = pieces.filter(p => !oversized.includes(p));

      if (packable.length) {
        const sheets = packSheets(packable, sheetWVal, sheetHVal, kerf, allowRotate);
        sheets.forEach((sheet, i) => {
          y = drawSheetDiagram(doc, y, sheet, sheetWVal, sheetHVal, i + 1, sheets.length, materialLabel);
        });
      }

      if (oversized.length) {
        y = ensureSpace(doc, y, 6 + 4.6 * oversized.length);
        doc.setFont(MEDIUM, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(220, 38, 38);
        doc.text(materialLabel + ' — elementy dłuższe niż arkusz (wymagają łączenia lub zamówienia specjalnego):', MARGIN_X, y);
        y += 5;
        doc.setFont(LIGHT, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(90, 90, 90);
        oversized.forEach(p => {
          y = ensureSpace(doc, y, 4.6);
          doc.text('• ' + p.label + ' — ' + p.w + ' × ' + p.h + ' mm', MARGIN_X + 4, y);
          y += 4.6;
        });
        y += 3;
      }
    }

    const boardHasGrain = grainDirectionEl.checked;
    renderMaterialSheets(boardPieces, 'Płyta meblowa', !boardHasGrain);
    renderMaterialSheets(hdfPieces, 'Płyta HDF', true);

    return y;
  }

  function drawSectionTitle(doc, y, text) {
    y = ensureSpace(doc, y, 14);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(12.5);
    doc.setTextColor(169, 113, 74);
    doc.text(text, MARGIN_X, y);
    return y + 8;
  }

  function drawDivider(doc, y) {
    y = ensureSpace(doc, y, 9);
    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.2);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    return y + 9;
  }

  function drawKeyValueLine(doc, y, label, value, opts) {
    opts = opts || {};
    y = ensureSpace(doc, y, 7);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(opts.fontSize || 10);
    doc.setTextColor(26, 26, 26);
    doc.text(label, MARGIN_X, y);
    doc.setFont(LIGHT, 'normal');
    doc.setTextColor(70, 70, 70);
    if (opts.rightAlign) {
      doc.text(value, PAGE_W - MARGIN_X, y, { align: 'right' });
    } else {
      const wrapped = doc.splitTextToSize(value, PAGE_W - 2 * MARGIN_X - 44);
      doc.text(wrapped, MARGIN_X + 42, y);
      return y + 6.2 * wrapped.length;
    }
    return y + 6.2;
  }

  function drawCostRow(doc, y, label, amount, opts) {
    opts = opts || {};
    y = ensureSpace(doc, y, 7);
    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(opts.fontSize || 10);
    doc.setTextColor(opts.color ? opts.color[0] : 70, opts.color ? opts.color[1] : 70, opts.color ? opts.color[2] : 70);
    doc.text(label, MARGIN_X, y);
    doc.text(formatPLN(amount), PAGE_W - MARGIN_X, y, { align: 'right' });
    return y + 6.2;
  }

  function drawItemQtyRow(doc, y, name, qty, price, sum) {
    y = ensureSpace(doc, y, 6.4);
    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(70, 70, 70);
    doc.text(name, MARGIN_X, y);
    doc.text(qty + ' szt. x ' + formatPLN(price), MARGIN_X + 95, y);
    doc.setFont(MEDIUM, 'normal');
    doc.setTextColor(26, 26, 26);
    doc.text(formatPLN(sum), PAGE_W - MARGIN_X, y, { align: 'right' });
    return y + 5.8;
  }

  // Podsumowanie identyczne wizualnie z boksem wyniku w kalkulatorze
  // (gradient, duża cena, lista pozycji rozliczeniowych)
  function drawFinalSummaryBox(doc, y, title, priceText, bruttoText, subText, rows, colorA, colorB) {
    const rowsHeight = rows.length * 6.3;
    const boxHeight = 12 + 9 + (bruttoText ? 6.5 : 0) + (subText ? 5.5 : 0) + rowsHeight + 6;
    y = ensureSpace(doc, y, boxHeight + 4);

    drawGradientRect(doc, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, boxHeight, colorA, colorB);

    let ty = y + 9;
    doc.setTextColor(230, 235, 235);
    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(9.5);
    doc.text(title, MARGIN_X + 6, ty);
    ty += 9;

    doc.setTextColor(255, 255, 255);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(18);
    doc.text(priceText, MARGIN_X + 6, ty);
    ty += 2;

    if (bruttoText) {
      ty += 6.5;
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(255, 255, 255);
      doc.text(bruttoText, MARGIN_X + 6, ty);
    }

    if (subText) {
      ty += 5;
      doc.setFont(LIGHT, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(220, 230, 230);
      doc.text(subText, MARGIN_X + 6, ty);
    }
    ty += 8;

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.1);
    rows.forEach(([label, value], idx) => {
      doc.setFont(LIGHT, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(225, 232, 232);
      doc.text(label, MARGIN_X + 6, ty);
      doc.text(formatPLN(value), PAGE_W - MARGIN_X - 6, ty, { align: 'right' });
      if (idx < rows.length - 1) {
        doc.line(MARGIN_X + 6, ty + 2, PAGE_W - MARGIN_X - 6, ty + 2);
      }
      ty += 6.3;
    });

    return y + boxHeight + 10;
  }

  function drawFooter(doc) {
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(169, 113, 74);
    doc.text('Wycena ważna przez 3 tygodnie, do dnia ' + lastCalc.expiryDateFormatted + '.', MARGIN_X, 287);
    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    const footerText = 'Wygenerowano automatycznie przez kalkulator yamura.pl dnia ' + new Date().toLocaleDateString('pl-PL') + '.';
    doc.text(footerText, MARGIN_X, 291.5, { maxWidth: PAGE_W - 2 * MARGIN_X });
  }

  function savePdf(doc, prefix) {
    const fileName = prefix + '_' + lastCalc.projectName.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ ]/g, '').replace(/\s+/g, '_') + '.pdf';
    doc.save(fileName);

    // Po pobraniu PDF-a od razu otwórz gotowy szkic maila — wystarczy dołączyć pobrany plik i wysłać
    const emailSubject = 'Wycena — ' + lastCalc.projectName;
    const emailBody = 'Cześć,\n\nW załączniku przesyłam wygenerowany plik: ' + fileName + '.\n\n(Pamiętaj, żeby dołączyć pobrany przed chwilą plik PDF do tej wiadomości — przeglądarka nie robi tego automatycznie.)\n\nPozdrawiam';
    const mailtoUrl = 'mailto:m.szwank@gmail.com?subject=' + encodeURIComponent(emailSubject) + '&body=' + encodeURIComponent(emailBody);
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 400);
  }

  // ============ PDF SZCZEGÓŁOWY (dla firmy) ============
  function drawTableHeader(doc, y) {
    y = ensureSpace(doc, y, 10);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(140, 140, 140);
    doc.text('NAZWA', MARGIN_X, y);
    doc.text('SYMBOL', MARGIN_X + 78, y);
    doc.text('ILOŚĆ', MARGIN_X + 110, y);
    doc.text('CENA', MARGIN_X + 138, y);
    doc.text('SUMA', PAGE_W - MARGIN_X, y, { align: 'right' });
    y += 2.5;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.15);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    return y + 5.5;
  }

  function drawDetailedItemRow(doc, y, row) {
    y = ensureSpace(doc, y, 6.5);
    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const nameWrapped = doc.splitTextToSize(row.name, 74);
    doc.text(nameWrapped, MARGIN_X, y);
    doc.setTextColor(110, 110, 110);
    doc.text(row.symbol, MARGIN_X + 78, y);
    doc.text(row.qty, MARGIN_X + 110, y);
    doc.text(row.price, MARGIN_X + 138, y);
    doc.setFont(MEDIUM, 'normal');
    doc.setTextColor(26, 26, 26);
    doc.text(formatPLN(row.sum), PAGE_W - MARGIN_X, y, { align: 'right' });
    return y + 6.3 * nameWrapped.length;
  }

  function generateDetailedPDF() {
    if (!lastCalc) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    registerFonts(doc);

    let y = drawPdfHeader(doc, 'WYCENA SZCZEGÓŁOWA');

    const piecesLabelDetailed = lastCalc.furniturePieces.map(p => p.label).join(' + ');

    doc.setTextColor(26, 26, 26);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(18);
    doc.text('Wycena szczegółowa — ' + piecesLabelDetailed, PAGE_W / 2, y, { align: 'center' });
    y += 9;

    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Data wyceny: ' + lastCalc.dateFormatted, PAGE_W / 2, y, { align: 'center' });
    y += 8;

    if (lastCalc.clientName || lastCalc.clientContact) {
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      const clientLine = (lastCalc.clientName || '—') + (lastCalc.clientContact ? '   •   ' + lastCalc.clientContact : '');
      doc.text(clientLine, PAGE_W / 2, y, { align: 'center' });
      y += 9;
    }

    y = drawDivider(doc, y);

    // ============ Lista formatek (rozkrój) wg mebla — realny odnośnik dla produkcji ============
    y = drawSectionTitle(doc, y, 'Lista formatek do rozkroju (wg mebla)');

    lastCalc.furniturePieces.forEach((piece, pieceIdx) => {
      if (!piece.rows.length) return;

      y = ensureSpace(doc, y, 10);
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 26, 26);
      const pieceLabel = (lastCalc.furniturePieces.length > 1 ? ('Mebel ' + (pieceIdx + 1) + ' — ' + piece.label) : piece.label) + (piece.room ? '  [' + piece.room + ']' : '');
      doc.text(pieceLabel, MARGIN_X, y);
      y += 6.5;

      // nagłówek mini-tabeli formatek
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text('NAZWA ELEMENTU', MARGIN_X, y);
      doc.text('WYMIARY (mm)', MARGIN_X + 88, y);
      doc.text('SZT.', MARGIN_X + 122, y);
      doc.text('KRAW.', MARGIN_X + 138, y);
      doc.text('m²', PAGE_W - MARGIN_X, y, { align: 'right' });
      y += 2;
      doc.setDrawColor(225, 225, 225);
      doc.setLineWidth(0.15);
      doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
      y += 4.2;

      let pieceArea = 0;
      piece.rows.forEach(row => {
        y = ensureSpace(doc, y, 5.6);
        doc.setFont(LIGHT, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        const nameWrapped = doc.splitTextToSize(row.name + (row.doubled ? ' (36mm)' : ''), 84);
        doc.text(nameWrapped, MARGIN_X, y);
        doc.setTextColor(100, 100, 100);
        doc.text(row.w + ' × ' + row.h, MARGIN_X + 88, y);
        doc.text(String(row.qty), MARGIN_X + 122, y);
        const edgeLabelMap = { thin: 'cienka', thick: 'gruba', laser: 'laser' };
        const edgeDesc = (row.edgesW || row.edgesH) ? (row.edgesW + row.edgesH) + 'x ' + (edgeLabelMap[row.edgeType] || '') : '—';
        doc.text(edgeDesc, MARGIN_X + 138, y);
        doc.setFont(MEDIUM, 'normal');
        doc.setTextColor(26, 26, 26);
        doc.text(formatM2(row.area), PAGE_W - MARGIN_X, y, { align: 'right' });
        pieceArea += row.area;
        y += 5.4 * nameWrapped.length;
      });

      y += 1;
      doc.setDrawColor(225, 225, 225);
      doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
      y += 4.5;
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(169, 113, 74);
      const pieceTotalQty = piece.rows.reduce((s, r) => s + (r.qty || 0), 0);
      doc.text('Razem ' + piece.label + ': ' + formatM2(pieceArea) + ' (' + piece.rows.length + ' poz. / ' + pieceTotalQty + ' szt. formatek)', PAGE_W - MARGIN_X, y, { align: 'right' });
      y += 7;

      // koszt tego mebla z osobna — materiał, HDF, fronty, blat, akcesoria, razem
      const pieceMaterialCost = piece.carcassCost + piece.doublingCost + piece.edgingCost + piece.cuttingCost;
      const pieceCostLines = [
        ['Materiał — płyta meblowa (+ krawędzie, cięcie)', pieceMaterialCost],
        ['Materiał — płyta HDF (plecy, osobno)', piece.hdfCost],
        ['Fronty', piece.frontCost],
        ['Blat', piece.countertopCost],
        ['Akcesoria', piece.hardwareCost],
      ].filter(([, v]) => v > 0);

      doc.setFont(LIGHT, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 90);
      pieceCostLines.forEach(([label, val]) => {
        y = ensureSpace(doc, y, 5);
        doc.text(label, MARGIN_X + 6, y);
        doc.text(formatPLN(val), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 4.8;
      });

      y = ensureSpace(doc, y, 6);
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(26, 26, 26);
      doc.text('Koszt tego mebla razem:', MARGIN_X + 6, y);
      doc.text(formatPLN(piece.subtotal), PAGE_W - MARGIN_X, y, { align: 'right' });
      y += 9;
    });

    y = drawDivider(doc, y);

    // ============ Plan rozkroju płyt — wizualny podgląd ułożenia formatek na arkuszach ============
    y = drawSectionTitle(doc, y, 'Plan rozkroju płyt');
    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(grainDirectionEl.checked ? 90 : 120, grainDirectionEl.checked ? 130 : 120, grainDirectionEl.checked ? 90 : 120);
    const rozkrojNoteText = grainDirectionEl.checked
      ? 'Plan uwzględnia kierunek usłojenia/dekoru płyty meblowej — formatki NIE są obracane (zielone oznaczenie = HDF obrócone, bo zwykle nie ma kierunku). Odstęp między elementami: 4 mm (rzaz piły). Mimo to zalecana weryfikacja przed cięciem.'
      : 'Płyta meblowa oznaczona jako bez kierunku usłojenia — formatki oznaczone „⟲" na zielono zostały obrócone dla lepszego wykorzystania materiału. Odstęp między elementami: 4 mm (rzaz piły). Zalecana weryfikacja przed cięciem.';
    const rozkrojNote = doc.splitTextToSize(rozkrojNoteText, PAGE_W - 2 * MARGIN_X);
    doc.text(rozkrojNote, MARGIN_X, y);
    y += 4.4 * rozkrojNote.length + 5;

    if (lastCalc.cuttingCost > 0) {
      y = ensureSpace(doc, y, 6);
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(26, 26, 26);
      doc.text('Ilość cięcia formatek: ' + lastCalc.cuttingLength.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' mb  ×  ' + formatPLN(lastCalc.cuttingPrice) + '/mb  =  ' + formatPLN(lastCalc.cuttingCost), MARGIN_X, y);
      y += 7;
    }

    y = drawRozkroj(doc, y);

    y = drawDivider(doc, y);

    // Tytuł sekcji materiałów - wyśrodkowany
    y = ensureSpace(doc, y, 14);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(13.5);
    doc.setTextColor(169, 113, 74);
    doc.text('Materiał przyjęty do wyceny', PAGE_W / 2, y, { align: 'center' });
    y += 9;

    // Szczegółowa tabela wszystkich pozycji: nazwa, symbol, ilość, cena, suma
    y = drawTableHeader(doc, y);
    lastCalc.detailedRows.forEach(row => {
      y = drawDetailedItemRow(doc, y, row);
    });

    y += 2;
    y = ensureSpace(doc, y, 8);
    drawGradientRect(doc, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, lastCalc.hdfCost > 0 ? 15 : 8, GRAY, NAVY);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('  Do zamówienia: ' + lastCalc.boardsNeeded + ' płyty meblowej', MARGIN_X + 4, y + 5.5);
    if (lastCalc.hdfCost > 0) {
      doc.text('  Do zamówienia: ' + lastCalc.hdfBoardsNeeded + ' szt. płyty HDF (plecy, osobno)', MARGIN_X + 4, y + 11.5);
    }
    y += (lastCalc.hdfCost > 0 ? 15 : 8) + 6;

    y = drawCostRow(doc, y, 'Koszt materiałów + robocizny (razem)', lastCalc.subtotal);
    y = drawCostRow(doc, y, 'Marża firmy (' + lastCalc.margin + '%)', lastCalc.marginValue);
    if (lastCalc.designerCommissionValue > 0) {
      y = drawCostRow(doc, y, 'Prowizja architekta (' + lastCalc.designerCommissionPct + '%, doliczona do ceny)', lastCalc.designerCommissionValue);
    }
    y += 6;

    // Podsumowanie końcowe - identyczne wizualnie z kalkulatorem
    const summaryRows = lastCalc.detailedRows.map(r => [r.name, r.sum])
      .concat([
        ['Koszt materiałów + robocizny (razem)', lastCalc.subtotal],
        ['Marża firmy (' + lastCalc.margin + '%)', lastCalc.marginValue],
      ])
      .concat(lastCalc.designerCommissionValue > 0 ? [
        ['Prowizja architekta (' + lastCalc.designerCommissionPct + '%, doliczona do ceny)', lastCalc.designerCommissionValue],
      ] : []);
    y = drawFinalSummaryBox(
      doc, y,
      'SZACOWANA CENA MEBLA DLA KLIENTA (NETTO)',
      formatPLN(lastCalc.total),
      'Brutto (VAT ' + lastCalc.vatRate + '%): ' + formatPLN(lastCalc.totalBrutto),
      'Pełne rozliczenie kosztów wg pozycji powyżej',
      summaryRows,
      NAVY, TEAL
    );

    // AGD szczegółowo
    if (lastCalc.agdCost > 0) {
      y = drawSectionTitle(doc, y, 'Sprzęt AGD — szczegółowo (osobna wycena)');
      lastCalc.agdItemsList.forEach(item => {
        y = ensureSpace(doc, y, 6.4);
        doc.setFont(LIGHT, 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(70, 70, 70);
        doc.text(item.displayName, MARGIN_X, y);
        doc.text('sprzęt: ' + formatPLN(item.price) + '  +  montaż: ' + formatPLN(item.cost), MARGIN_X + 85, y);
        doc.setFont(MEDIUM, 'normal');
        doc.setTextColor(26, 26, 26);
        doc.text(formatPLN(item.itemTotal), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 5.8;
      });
      y += 4;

      const agdRows = [['Suma sprzętu i montażu', lastCalc.agdCost]];
      if (lastCalc.agdMarginValue > 0) agdRows.push(['Marża na AGD (' + lastCalc.agdMargin + '%)', lastCalc.agdMarginValue]);

      y = drawFinalSummaryBox(
        doc, y,
        'RAZEM SPRZĘT AGD (nie wliczone w cenę mebla) — NETTO',
        formatPLN(lastCalc.agdTotalWithMargin),
        'Brutto (VAT ' + lastCalc.vatRate + '%): ' + formatPLN(lastCalc.agdTotalBrutto),
        null,
        agdRows,
        GRAY, TEAL
      );
    }

    drawFooter(doc);
    savePdf(doc, 'Wycena_szczegolowa');
  }

  // ============ PDF DLA KLIENTA (bez ilości, przejrzysty) ============
  function generateClientPDF() {
    if (!lastCalc) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    registerFonts(doc);

    let y = drawPdfHeader(doc, 'WYCENA MEBLI');

    const piecesLabelClient = lastCalc.furniturePieces.map(p => p.label).join(' + ');

    doc.setTextColor(26, 26, 26);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(18);
    doc.text('Wycena — ' + piecesLabelClient, PAGE_W / 2, y, { align: 'center' });
    y += 9;

    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Data wyceny: ' + lastCalc.dateFormatted, PAGE_W / 2, y, { align: 'center' });
    y += 8;

    if (lastCalc.clientName || lastCalc.clientContact) {
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      const clientLine = (lastCalc.clientName || '—') + (lastCalc.clientContact ? '   •   ' + lastCalc.clientContact : '');
      doc.text(clientLine, PAGE_W / 2, y, { align: 'center' });
      y += 9;
    }

    // Motto — na górze dokumentu, tuż pod danymi klienta
    const motto = '„Do każdego mebla podchodzimy tak, jakby miał stanąć w naszym własnym domu.”';
    doc.setFont(LIGHT, 'normal');
    doc.setFontSize(10.5);
    const mottoWrapped = doc.splitTextToSize(motto, PAGE_W - 2 * MARGIN_X - 20);
    const mottoBoxHeight = 11 + mottoWrapped.length * 6;
    y = ensureSpace(doc, y, mottoBoxHeight + 10);
    drawGradientRect(doc, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, mottoBoxHeight, TEAL, NAVY);
    doc.setTextColor(255, 255, 255);
    doc.text(mottoWrapped, PAGE_W / 2, y + 7.5, { align: 'center' });
    y += mottoBoxHeight + 16;

    y = drawDivider(doc, y);

    // Zakres wyceny — jasno widoczne, co obejmuje ta oferta (ważne przy kilku meblach w jednej wycenie)
    if (lastCalc.furniturePieces.length > 1) {
      y = ensureSpace(doc, y, 14);
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 26, 26);
      doc.text('Zakres oferty:', MARGIN_X, y);
      y += 6.5;
      doc.setFont(LIGHT, 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(70, 70, 70);
      lastCalc.furniturePieces.forEach((piece, idx) => {
        y = ensureSpace(doc, y, 5.6);
        doc.text('•  ' + piece.label + (piece.room ? '  (' + piece.room + ')' : ''), MARGIN_X + 4, y);
        y += 5.6;
      });
      y += 4;
      y = drawDivider(doc, y);
    }

    // Dlaczego YAMURA — na stronie 1, żeby wypełnić ją przed sekcją "Wycena obejmuje"
    y = drawSectionTitle(doc, y, 'Dlaczego YAMURA');

    const whyPoints = [
      { title: 'Materiały dopasowane do budżetu', text: 'płyty, fronty i okucia dobrane do Twoich oczekiwań i budżetu.' },
      { title: 'Projekt pod Twoje wnętrze', text: 'każdy mebel na konkretne wymiary, nic „z gotowca".' },
      { title: 'Od pomiaru po montaż', text: 'nie szukasz osobno stolarza, transportu i ekipy montażowej.' },
    ];

    whyPoints.forEach(point => {
      y = ensureSpace(doc, y, 9);
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 26, 26);
      doc.text('•  ' + point.title + ' — ', MARGIN_X, y);
      const titleWidth = doc.getTextWidth('•  ' + point.title + ' — ');
      doc.setFont(LIGHT, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      const wrapped = doc.splitTextToSize(point.text, PAGE_W - MARGIN_X - MARGIN_X - titleWidth);
      doc.text(wrapped[0], MARGIN_X + titleWidth, y);
      y += 8.5;
      if (wrapped.length > 1) {
        y = ensureSpace(doc, y, 6 * (wrapped.length - 1));
        doc.text(wrapped.slice(1), MARGIN_X + 6, y);
        y += 6 * (wrapped.length - 1);
      }
    });

    y += 8;
    y = drawDivider(doc, y);

    // Jedna spójna sekcja: co zawiera wycena, z materiałem/symbolem/producentem wplecionym w tekst
    y = ensureSpace(doc, y, 14);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(13.5);
    doc.setTextColor(169, 113, 74);
    doc.text('Wycena obejmuje', PAGE_W / 2, y, { align: 'center' });
    y += 10;

    const findMaterial = (label) => lastCalc.materialsDescription.find(m => m.label === label);
    const carcassInfo = findMaterial('Płyta korpusowa');
    const frontInfo = findMaterial('Fronty');
    const countertopInfo = findMaterial('Blat');

    const includedItems = [];
    if (carcassInfo) includedItems.push({ label: 'Płyta korpusowa', value: carcassInfo.value });
    if (lastCalc.doublingCost > 0) includedItems.push({ label: 'Zdwojenie płyty', value: '36 mm, w wybranych elementach mebla' });
    if (frontInfo) includedItems.push({ label: 'Fronty', value: frontInfo.value });
    if (countertopInfo) includedItems.push({ label: 'Blat', value: countertopInfo.value });

    const INDENT_X = MARGIN_X + 6;

    function drawBulletItem(item) {
      doc.setFont(LIGHT, 'normal');
      doc.setFontSize(10);
      const wrapped = doc.splitTextToSize(item.value, PAGE_W - INDENT_X - MARGIN_X);
      const totalHeight = 6.8 + 6.8 * wrapped.length;
      y = ensureSpace(doc, y, totalHeight);

      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 26, 26);
      doc.text('•  ' + item.label, MARGIN_X, y);
      y += 6.8;

      doc.setFont(LIGHT, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(70, 70, 70);
      doc.text(wrapped, INDENT_X, y);
      y += 6.8 * wrapped.length + 7;
    }

    includedItems.forEach(drawBulletItem);

    // Akcesoria i okucia - pogrupowane wg mebla (jeśli jest ich więcej niż jeden), każda pozycja we własnym wierszu
    if (lastCalc.hardwareItemsList.length) {
      const multiPieceAcc = lastCalc.furniturePieces.length > 1;

      if (multiPieceAcc) {
        lastCalc.furniturePieces.forEach(piece => {
          if (!piece.hardwareItemsList.length) return;
          y = ensureSpace(doc, y, 7);
          doc.setFont(MEDIUM, 'normal');
          doc.setFontSize(10);
          doc.setTextColor(26, 26, 26);
          doc.text('•  Akcesoria i okucia — ' + piece.label, MARGIN_X, y);
          y += 5.6;

          doc.setFont(LIGHT, 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(70, 70, 70);
          piece.hardwareItemsList.forEach(item => {
            const wrapped = doc.splitTextToSize(item.displayName, PAGE_W - INDENT_X - MARGIN_X);
            y = ensureSpace(doc, y, 5.6 * wrapped.length);
            doc.text(wrapped, INDENT_X, y);
            y += 5.6 * wrapped.length;
          });
          y += 2.5;
        });
      } else {
        y = ensureSpace(doc, y, 7);
        doc.setFont(MEDIUM, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(26, 26, 26);
        doc.text('•  Akcesoria i okucia', MARGIN_X, y);
        y += 5.6;

        doc.setFont(LIGHT, 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(70, 70, 70);
        lastCalc.hardwareItemsList.forEach(item => {
          const wrapped = doc.splitTextToSize(item.displayName, PAGE_W - INDENT_X - MARGIN_X);
          y = ensureSpace(doc, y, 5.6 * wrapped.length);
          doc.text(wrapped, INDENT_X, y);
          y += 5.6 * wrapped.length;
        });
        y += 2.5;
      }
    }

    // Pozostałe pozycje po akcesoriach
    const remainingItems = [];
    if (lastCalc.otherItemsList.length) {
      remainingItems.push({ label: 'Dodatkowo', value: lastCalc.otherItemsList.map(i => i.name).join(', ') });
    }
    remainingItems.push({ label: 'Robocizna', value: 'montaż, transport i przygotowanie projektu' });
    remainingItems.forEach(drawBulletItem);

    y += 3;

    // Podsumowanie końcowe — tylko cena i krótki opis, bez rozbicia na pozycje kosztowe
    y = drawFinalSummaryBox(
      doc, y,
      'SZACOWANA CENA MEBLA DLA KLIENTA (NETTO)',
      formatPLN(lastCalc.total),
      'Brutto (VAT ' + lastCalc.vatRate + '%): ' + formatPLN(lastCalc.totalBrutto),
      'Cena zawiera wszystkie materiały, akcesoria, transport i montaż oraz robociznę',
      [],
      NAVY, TEAL
    );

    y += 6;

    // Wycena poszczególnych mebli osobno — po cenie końcowej
    if (lastCalc.furniturePieces.length > 1) {
      y = drawSectionTitle(doc, y, 'Wycena poszczególnych mebli');

      lastCalc.furniturePieces.forEach(piece => {
        y = ensureSpace(doc, y, 8);
        doc.setFont(MEDIUM, 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(26, 26, 26);
        doc.text(piece.label + (piece.room ? '  (' + piece.room + ')' : ''), MARGIN_X, y);
        doc.text(formatPLN(piece.subtotal), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 6.5;
      });

      y += 1;
      doc.setFont(LIGHT, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      const noteWrapped = doc.splitTextToSize('Powyższe kwoty to materiał, fronty, blat i akcesoria każdego mebla z osobna. Robocizna, organizacja realizacji i pozostałe składniki są wspólne dla całego zamówienia i ujęte w cenie końcowej powyżej.', PAGE_W - 2 * MARGIN_X);
      y = ensureSpace(doc, y, 4.6 * noteWrapped.length);
      doc.text(noteWrapped, MARGIN_X, y);
      y += 4.6 * noteWrapped.length + 4;
    }

    // AGD - jeden sprzęt na linię, równe kolumny: nazwa / producent+model / cena
    if (lastCalc.agdCost > 0) {
      y = drawSectionTitle(doc, y, 'Sprzęt AGD (osobna wycena)');

      lastCalc.agdItemsList.forEach(item => {
        y = ensureSpace(doc, y, 12);

        doc.setFont(MEDIUM, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(26, 26, 26);
        doc.text(item.name, MARGIN_X, y);
        doc.text(formatPLN(item.itemTotal), PAGE_W - MARGIN_X, y, { align: 'right' });
        y += 5.6;

        const brandModel = [item.manufacturer, item.model].filter(Boolean).join(' ');
        if (brandModel) {
          doc.setFont(LIGHT, 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(120, 120, 120);
          doc.text(brandModel, MARGIN_X + 6, y);
          y += 5.6;
        }

        y += 2;
      });

      y += 6;

      y = drawFinalSummaryBox(
        doc, y,
        'RAZEM SPRZĘT AGD (nie wliczone w cenę mebla) — NETTO',
        formatPLN(lastCalc.agdTotalWithMargin),
        'Brutto (VAT ' + lastCalc.vatRate + '%): ' + formatPLN(lastCalc.agdTotalBrutto),
        null,
        [],
        GRAY, TEAL
      );
    }

    // ============ Kolejne kroki — jasne CTA, żeby to była gotowa oferta, nie tylko cennik ============
    y += 2;
    y = drawSectionTitle(doc, y, 'Kolejne kroki');

    const nextSteps = [
      { title: '1. Akceptacja wyceny', text: 'potwierdzasz zakres i cenę — telefonicznie, mailowo lub SMS-em.' },
      { title: '2. Umowa i zaliczka', text: 'krótka umowa, zaliczka na start, reszta po montażu.' },
      { title: '3. Produkcja i montaż', text: 'realizujemy mebel i umawiamy dogodny termin montażu.' },
    ];

    nextSteps.forEach(step => {
      y = ensureSpace(doc, y, 7);
      doc.setFont(MEDIUM, 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(26, 26, 26);
      doc.text(step.title + ' — ', MARGIN_X, y);
      const titleWidth = doc.getTextWidth(step.title + ' — ');
      doc.setFont(LIGHT, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      const wrapped = doc.splitTextToSize(step.text, PAGE_W - MARGIN_X - MARGIN_X - titleWidth);
      doc.text(wrapped[0], MARGIN_X + titleWidth, y);
      y += 6;
      if (wrapped.length > 1) {
        y = ensureSpace(doc, y, 5 * (wrapped.length - 1));
        doc.text(wrapped.slice(1), MARGIN_X + 6, y);
        y += 5 * (wrapped.length - 1);
      }
    });

    y += 2;
    y = ensureSpace(doc, y, 13);
    drawGradientRect(doc, MARGIN_X, y, PAGE_W - 2 * MARGIN_X, 13, TEAL, NAVY);
    doc.setFont(MEDIUM, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Masz pytania? Napisz lub zadzwoń — chętnie omówimy szczegóły projektu.', PAGE_W / 2, y + 8, { align: 'center' });
    y += 17;

    drawFooter(doc);
    savePdf(doc, 'Wycena');
  }

  downloadDetailedPdfBtn.addEventListener('click', generateDetailedPDF);
  downloadClientPdfBtn.addEventListener('click', generateClientPDF);

  // ============ Automatyczne wypełnianie z rysunku projektu (AI) ============

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadElementsFromArray(arr) {
    elementsBody.innerHTML = '';
    arr.forEach(item => {
      elementsBody.appendChild(createElementRow({
        name: item.name || '',
        w: item.w || 0,
        h: item.h || 0,
        qty: item.qty || 1,
        edgesW: item.edgesW || 0,
        edgesH: item.edgesH || 0,
        edgeType: item.edgeType || 'thin',
        doubled: !!item.doubled
      }));
    });
  }

  function applyAiAccessories(list) {
    list.forEach(aiItem => {
      const rows = Array.from(accBody.children);
      const existing = rows.find(tr => {
        const nameVal = tr.querySelector('.acc-name input').value.trim().toLowerCase();
        return nameVal && (nameVal === aiItem.name.toLowerCase() || nameVal.includes(aiItem.name.toLowerCase()) || aiItem.name.toLowerCase().includes(nameVal));
      });
      if (existing) {
        existing._qtyInput.value = aiItem.qty;
      } else {
        accBody.appendChild(createAccessoryRowBrand({ name: aiItem.name, qty: aiItem.qty, price: aiItem.price || 0 }));
      }
    });
  }

  projectUploadBtn.addEventListener('click', () => projectFileInput.click());

  
  // Moduł analizy AI - architektura przygotowana pod dowolne API
  projectFileInput.addEventListener('change', async () => {
    const file = projectFileInput.files[0];
    if (!file) return;
    projectFileName.textContent = file.name;
    projectAnalyzeStatus.style.display = 'block';
    projectAnalyzeStatus.style.color = '#8b704f';
    projectAnalyzeStatus.textContent = 'Plik ' + file.name + ' został wczytany do kalkulatora.';

    // Wyświetlamy status informujący o architekturze AI gotowej do podpięcia API
    setTimeout(() => {
      projectAnalyzeStatus.innerHTML = 'Plik <strong>' + file.name + '</strong> jest gotowy. Moduł automatycznej analizy rysunku technicznego przez AI oczekuje na skonfigurowanie klucza API (OpenAI / Gemini / Claude). Do tego czasu wszystkie dane możesz uzupełnić lub skorygować w sekcjach poniżej.';
    }, 400);
  });
  // Funkcja analityczna AI - przygotowana pod podpięcie docelowego API (OpenAI / Gemini / Claude)
  async function analyzeProjectWithAI(file) {
    const base64Data = await fileToBase64(file);
    const mediaType = file.type || 'image/jpeg';
    const isPdf = mediaType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    const prompt = 'Jesteś ekspertem stolarzem analizującym rysunek techniczny, wizualizację lub dokument PDF mebla na wymiar. ' +
      'Na podstawie obrazu rozpoznaj wymiary i skonstruuj listę formatek korpusu, oszacuj powierzchnię frontów (m²), długość blatu (mb) oraz listę potrzebnych akcesoriów. ' +
      'Odpowiedz WYŁĄCZNIE poprawnym obiektem JSON w strukturze: ' +
      '{"furnitureType": "kuchnia|szafa|kontenerek|regal|biurko|lazienka", ' +
      '"elements": [{"name": string, "w": number, "h": number, "qty": number, "edgesW": 0|1|2, "edgesH": 0|1|2, "edgeType": "thin|thick|laser"}], ' +
      '"frontAreaM2": number, "countertopLengthMb": number, "accessories": [{"name": string, "qty": number}], "notes": string}';

    console.log('AI prompt prepared for API connection:', prompt, { isPdf, mediaType });
    return null;
  }

  // ============ Zapisywanie i wczytywanie wycen (localStorage) ============
  const SAVED_QUOTES_KEY = 'yamura_saved_quotes';

  function readElementRows(tbody) {
    return Array.from(tbody.children).map(tr => ({
      name: tr._nameInput.value,
      w: tr._wInput.value,
      h: tr._hInput.value,
      qty: tr._qtyInput.value,
      edgesW: tr._edgesWInput.value,
      edgesH: tr._edgesHInput.value,
      edgeType: tr._edgeTypeSelect.value,
      doubled: tr._doubleCheckbox.checked,
      material: tr._materialSelect ? tr._materialSelect.value : 'board'
    }));
  }

  function writeElementRows(tbody, rows) {
    tbody.innerHTML = '';
    (rows || []).forEach(r => tbody.appendChild(createElementRow(r)));
  }

  function readAccRows(tbody) {
    return Array.from(tbody.children).map(tr => ({
      name: tr.querySelector('.acc-name input').value,
      manufacturer: tr._manufacturerInput.value,
      model: tr._modelInput.value,
      qty: tr._qtyInput.value,
      price: tr._priceInput.value
    }));
  }

  function writeAccRows(tbody, rows) {
    tbody.innerHTML = '';
    (rows || []).forEach(r => tbody.appendChild(createAccessoryRowBrand(r)));
  }

  function readOtherRows(tbody) {
    return Array.from(tbody.children).map(tr => ({
      name: tr.querySelector('.acc-name input').value,
      qty: tr._qtyInput.value,
      price: tr._priceInput.value
    }));
  }

  function writeOtherRows(tbody, rows) {
    tbody.innerHTML = '';
    (rows || []).forEach(r => tbody.appendChild(createAccessoryRow(r)));
  }

  function readAgdRows() {
    return Array.from(agdBody.children).map(tr => ({
      checked: tr._checkbox.checked,
      name: tr.querySelector('.acc-name input').value,
      manufacturer: tr._manufacturerInput.value,
      model: tr._modelInput.value,
      price: tr._priceInput.value,
      cost: tr._costInput.value
    }));
  }

  function writeAgdRows(rows) {
    agdBody.innerHTML = '';
    (rows || []).forEach(r => agdBody.appendChild(createAgdRow(r)));
  }

  function serializeQuote() {
    return {
      projectName: projectNameEl.value,
      clientName: clientNameEl.value,
      clientContact: clientContactEl.value,
      quoteDate: quoteDateEl.value,
      sheetWidth: sheetWidthEl.value,
      sheetHeight: sheetHeightEl.value,
      wasteFactor: wasteFactorEl.value,
      grainDirection: grainDirectionEl.checked,
      edgingPriceThin: edgingPriceThinEl.value,
      edgingPriceThick: edgingPriceThickEl.value,
      edgingPriceLaser: edgingPriceLaserEl.value,
      doublingPrice: doublingPriceEl.value,
      cuttingPrice: cuttingPriceEl.value,
      assemblyCost: assemblyCostEl.value,
      transportCost: transportCostEl.value,
      designCost: designCostEl.value,
      margin: marginEl.value,
      vatRate: vatRateEl.value,
      agdMargin: agdMarginEl.value,
      minMarginControl: minMarginControlEl.value,
      riskReserve: riskReserveEl.value,
      designerCommission: designerCommissionEl.value,
      roomType: roomTypeEl.value,
      roomTypeOther: roomTypeOtherEl.value,
      furnitureType: furnitureTypeEl.value,
      nietypoweName: nietypoweNameEl.value,
      carcassBoardType: carcassBoardTypeEl.value,
      carcassManufacturer: carcassManufacturerEl.value,
      carcassSymbol: carcassSymbolEl.value,
      carcassPrice: carcassPriceEl.value,
      hdfType: hdfTypeEl.value,
      hdfManufacturer: hdfManufacturerEl.value,
      hdfSymbol: hdfSymbolEl.value,
      hdfPrice: hdfPriceEl.value,
      frontType: frontTypeEl.value,
      frontArea: frontAreaEl.value,
      frontPrice: frontPriceEl.value,
      countertopType: countertopTypeEl.value,
      countertopLength: countertopLengthEl.value,
      countertopPrice: countertopPriceEl.value,
      countertopManufacturer: countertopManufacturerEl.value,
      countertopModel: countertopModelEl.value,
      elements: readElementRows(elementsBody),
      accessories: readAccRows(accBody),
      other: readOtherRows(otherBody),
      agd: readAgdRows(),
      extraBlocks: extraFurnitureBlocks.map(block => ({
        furnitureType: block.typeSelect.value,
        customName: block.customNameInput.value,
        roomType: block.roomSelect.value,
        roomTypeOther: block.roomOtherInput.value,
        boardType: block.boardTypeEl.value,
        boardManufacturer: block.boardManufacturerEl.value,
        boardSymbol: block.boardSymbolEl.value,
        boardPrice: block.boardPriceEl.value,
        hdfType: block.hdfTypeEl.value,
        hdfManufacturer: block.hdfManufacturerEl.value,
        hdfSymbol: block.hdfSymbolEl.value,
        hdfPrice: block.hdfPriceEl.value,
        frontType: block.frontTypeEl.value,
        frontArea: block.frontAreaEl.value,
        frontPrice: block.frontPriceEl.value,
        countertopType: block.countertopTypeEl.value,
        countertopLength: block.countertopLengthEl.value,
        countertopPrice: block.countertopPriceEl.value,
        countertopManufacturer: block.countertopManufacturerEl.value,
        countertopModel: block.countertopModelEl.value,
        elements: readElementRows(block.tbody),
        accessories: readAccRows(block.accBody),
        other: readOtherRows(block.otherBody)
      }))
    };
  }

  function deserializeQuote(data) {
    projectNameEl.value = data.projectName || '';
    clientNameEl.value = data.clientName || '';
    clientContactEl.value = data.clientContact || '';
    quoteDateEl.value = data.quoteDate || '';
    sheetWidthEl.value = data.sheetWidth || 2800;
    sheetHeightEl.value = data.sheetHeight || 2050;
    wasteFactorEl.value = data.wasteFactor || 15;
    grainDirectionEl.checked = data.grainDirection !== undefined ? data.grainDirection : true;
    edgingPriceThinEl.value = data.edgingPriceThin || 3.5;
    edgingPriceThickEl.value = data.edgingPriceThick || 7;
    edgingPriceLaserEl.value = data.edgingPriceLaser || 12;
    doublingPriceEl.value = data.doublingPrice || 45;
    cuttingPriceEl.value = data.cuttingPrice !== undefined ? data.cuttingPrice : 2.5;
    assemblyCostEl.value = data.assemblyCost || 0;
    transportCostEl.value = data.transportCost || 0;
    designCostEl.value = data.designCost || 0;
    marginEl.value = data.margin !== undefined ? data.margin : 120;
    vatRateEl.value = data.vatRate !== undefined ? data.vatRate : 23;
    agdMarginEl.value = data.agdMargin !== undefined ? data.agdMargin : 10;
    if (data.minMarginControl !== undefined) minMarginControlEl.value = data.minMarginControl;
    if (data.riskReserve !== undefined) riskReserveEl.value = data.riskReserve;
    if (data.designerCommission !== undefined) designerCommissionEl.value = data.designerCommission;
    roomTypeEl.value = data.roomType || 'Kuchnia';
    roomTypeOtherEl.value = data.roomTypeOther || '';
    document.getElementById('roomTypeOtherWrap').style.display = roomTypeEl.value === 'inne' ? 'block' : 'none';
    furnitureTypeEl.value = data.furnitureType || 'kuchnia';
    nietypoweNameEl.value = data.nietypoweName || '';
    document.getElementById('nietypoweHint').style.display = furnitureTypeEl.value === 'nietypowe' ? 'block' : 'none';
    document.getElementById('nietypoweNameWrap').style.display = furnitureTypeEl.value === 'nietypowe' ? 'block' : 'none';
    carcassBoardTypeEl.value = data.carcassBoardType || '90';
    carcassManufacturerEl.value = data.carcassManufacturer || 'Egger';
    carcassSymbolEl.value = data.carcassSymbol || '';
    carcassPriceEl.value = data.carcassPrice || 90;
    hdfTypeEl.value = data.hdfType || '25';
    hdfManufacturerEl.value = data.hdfManufacturer || '';
    hdfSymbolEl.value = data.hdfSymbol || '';
    hdfPriceEl.value = data.hdfPrice || 25;
    frontTypeEl.value = data.frontType || '150';
    frontAreaEl.value = data.frontArea || 0;
    frontPriceEl.value = data.frontPrice || 150;
    countertopTypeEl.value = data.countertopType || '150';
    countertopLengthEl.value = data.countertopLength || 0;
    countertopPriceEl.value = data.countertopPrice || 150;
    countertopManufacturerEl.value = data.countertopManufacturer || '';
    countertopModelEl.value = data.countertopModel || '';

    writeElementRows(elementsBody, data.elements);
    writeAccRows(accBody, data.accessories);
    writeOtherRows(otherBody, data.other);
    writeAgdRows(data.agd);

    // usuń istniejące dodatkowe meble i odtwórz je z zapisu
    Array.from(extraFurnitureBlocks).forEach(block => block.wrapper.remove());
    extraFurnitureBlocks.length = 0;
    (data.extraBlocks || []).forEach(blockData => {
      createFurnitureBlock(blockData.furnitureType || 'kuchnia');
      const block = extraFurnitureBlocks[extraFurnitureBlocks.length - 1];
      block.typeSelect.value = blockData.furnitureType || 'kuchnia';
      block.customNameInput.value = blockData.customName || '';
      block.customNameInput.parentElement.style.display = block.typeSelect.value === 'nietypowe' ? 'block' : 'none';
      block.roomSelect.value = blockData.roomType || 'Kuchnia';
      block.roomOtherInput.value = blockData.roomTypeOther || '';
      block.roomOtherInput.parentElement.style.display = block.roomSelect.value === 'inne' ? 'block' : 'none';
      block.boardTypeEl.value = blockData.boardType || '90';
      block.boardManufacturerEl.value = blockData.boardManufacturer || '';
      block.boardSymbolEl.value = blockData.boardSymbol || '';
      block.boardPriceEl.value = blockData.boardPrice || 90;
      block.hdfTypeEl.value = blockData.hdfType || '25';
      block.hdfManufacturerEl.value = blockData.hdfManufacturer || '';
      block.hdfSymbolEl.value = blockData.hdfSymbol || '';
      block.hdfPriceEl.value = blockData.hdfPrice || 25;
      block.frontTypeEl.value = blockData.frontType || '150';
      block.frontAreaEl.value = blockData.frontArea || 0;
      block.frontPriceEl.value = blockData.frontPrice || 150;
      block.countertopTypeEl.value = blockData.countertopType || '150';
      block.countertopLengthEl.value = blockData.countertopLength || 0;
      block.countertopPriceEl.value = blockData.countertopPrice || 150;
      block.countertopManufacturerEl.value = blockData.countertopManufacturer || '';
      block.countertopModelEl.value = blockData.countertopModel || '';
      writeElementRows(block.tbody, blockData.elements);
      writeAccRows(block.accBody, blockData.accessories);
      writeOtherRows(block.otherBody, blockData.other);
    });

    updateAgdVisibility();
    calculate();
  }

  function getSavedQuotes() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_QUOTES_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function setSavedQuotes(list) {
    localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(list));
  }

  function renderSavedQuotesList() {
    const list = getSavedQuotes();
    const container = document.getElementById('savedQuotesList');
    if (!list.length) {
      container.innerHTML = '<div class="hint" style="margin:0;">Brak zapisanych wycen.</div>';
      return;
    }
    container.innerHTML = '';
    list.slice().reverse().forEach(entry => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:center; gap:8px; padding:9px 10px; border:1px solid var(--line); border-radius:8px; margin-bottom:6px; background:var(--parchment-deep);';

      const info = document.createElement('div');
      info.style.cssText = 'flex:1; min-width:0;';
      const titleEl = document.createElement('div');
      titleEl.textContent = entry.title;
      titleEl.style.cssText = 'font-weight:700; font-size:13px; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
      const dateEl = document.createElement('div');
      dateEl.textContent = new Date(entry.date).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      dateEl.style.cssText = 'font-size:11px; color:var(--bark);';
      info.appendChild(titleEl);
      info.appendChild(dateEl);

      const loadBtn = document.createElement('button');
      loadBtn.type = 'button';
      loadBtn.textContent = 'Wczytaj';
      loadBtn.style.cssText = 'padding:6px 10px; font-size:12px; border:1px solid var(--clay); color:var(--clay-deep); border-radius:6px; background:white; cursor:pointer; white-space:nowrap;';
      loadBtn.addEventListener('click', () => {
        if (confirm('Wczytać wycenę „' + entry.title + '"? Obecny, niezapisany stan kalkulatora zostanie zastąpiony.')) {
          deserializeQuote(entry.data);
          if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
        }
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.textContent = '✕';
      delBtn.title = 'Usuń zapisaną wycenę';
      delBtn.style.cssText = 'padding:6px 9px; font-size:12px; border:1px solid var(--warn); color:var(--warn); border-radius:6px; background:white; cursor:pointer;';
      delBtn.addEventListener('click', () => {
        if (confirm('Usunąć zapisaną wycenę „' + entry.title + '"? Tej operacji nie można cofnąć.')) {
          setSavedQuotes(getSavedQuotes().filter(e => e.id !== entry.id));
          renderSavedQuotesList();
        }
      });

      row.appendChild(info);
      row.appendChild(loadBtn);
      row.appendChild(delBtn);
      container.appendChild(row);
    });
  }

  document.getElementById('saveQuoteBtn').addEventListener('click', () => {
    const defaultTitle = (projectNameEl.value.trim() || 'Wycena bez nazwy');
    const title = prompt('Podaj tytuł zapisywanej wyceny:', defaultTitle);
    if (title === null) return; // anulowano
    const finalTitle = title.trim() || defaultTitle;
    const list = getSavedQuotes();
    list.push({
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      title: finalTitle,
      date: new Date().toISOString(),
      data: serializeQuote()
    });
    setSavedQuotes(list);
    renderSavedQuotesList();
    const btn = document.getElementById('saveQuoteBtn');
    const original = btn.textContent;
    btn.textContent = '• Zapisano: ' + finalTitle;
    setTimeout(() => { btn.textContent = original; }, 2200);
  });

  renderSavedQuotesList();

  initElementRows(furnitureTypeEl.value);
  initAgdRows();
  updateAgdVisibility();
  initAccessoryRows();
  initOtherRows();
  calculate();

  // Akordeon — rozwiń/zwiń wszystko i szybki skok do wyniku
  const allAccDetails = () => Array.from(document.querySelectorAll('details.acc'));
  let suppressAccScroll = false;
  document.getElementById('expandAllBtn').addEventListener('click', () => {
    suppressAccScroll = true;
    allAccDetails().forEach(d => d.open = true);
    setTimeout(() => { suppressAccScroll = false; }, 50);
  });
  document.getElementById('collapseAllBtn').addEventListener('click', () => {
    suppressAccScroll = true;
    allAccDetails().forEach(d => d.open = false);
    setTimeout(() => { suppressAccScroll = false; }, 50);
  });
  document.getElementById('stickyTotalBtn').addEventListener('click', () => {
    document.querySelector('.result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  allAccDetails().forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open && !suppressAccScroll) {
        setTimeout(() => d.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      }
    });
  });


  // Uruchomienie kalkulacji początkowej
  if (typeof calculate === 'function') {
    calculate();
  }
}
