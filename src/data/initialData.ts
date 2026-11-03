/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BoutiqueInfo, SalesObjectionItem } from '../types';

export const BOUTIQUES_CATALOG: BoutiqueInfo[] = [
  {
    id: 'smykov-rostov',
    name: 'IP Smykov Igor Viktorovich',
    door: 'Ip Smykov Igor Viktorovich - 1 - 1',
    customerCode: '39646',
    city: 'Rostov On Don',
    country: 'Russia',
    address: '2 Krasnodarskaya Str. 149-5 Apt.36',
    buyerName: 'Igor Viktorovich Smykov',
    buyerEmail: 'celynb.r@gmail.com',
    repName: 'Luca Gnagnetti',
    repEmail: 'gnagnetti1@gmail.com',
    currency: 'EUR (€)',
  },
  {
    id: 'milano-flagship',
    name: 'Luisa Spagnoli Flagship Milano',
    door: 'Showroom Montenapoleone - 01',
    customerCode: '10042',
    city: 'Milano',
    country: 'Italia',
    address: 'Via Montenapoleone 18',
    buyerName: 'Chiara Valenti',
    buyerEmail: 'showroom.milano@luisaspagnoli.it',
    repName: 'Luca Gnagnetti',
    repEmail: 'gnagnetti1@gmail.com',
    currency: 'EUR (€)',
  },
  {
    id: 'roma-condotti',
    name: 'Luisa Spagnoli Boutique Roma',
    door: 'Condotti Flagship Store - 02',
    customerCode: '10088',
    city: 'Roma',
    country: 'Italia',
    address: 'Via dei Condotti 21',
    buyerName: 'Matteo Serafini',
    buyerEmail: 'roma.condotti@luisaspagnoli.it',
    repName: 'Luca Gnagnetti',
    repEmail: 'gnagnetti1@gmail.com',
    currency: 'EUR (€)',
  },
  {
    id: 'capri-marina',
    name: 'Luisa Spagnoli Boutique Capri',
    door: 'Marina Grande Resort - 04',
    customerCode: '10214',
    city: 'Capri',
    country: 'Italia',
    address: 'Via Camerelle 14',
    buyerName: 'Elena Russo',
    buyerEmail: 'capri.boutique@luisaspagnoli.it',
    repName: 'Luca Gnagnetti',
    repEmail: 'gnagnetti1@gmail.com',
    currency: 'EUR (€)',
  },
];

export const SALES_OBJECTIONS_KNOWLEDGE_BASE: Record<string, SalesObjectionItem[]> = {
  general: [
    {
      objection: "Il prezzo al dettaglio è elevato rispetto al fast-luxury",
      customerRationale: "La cliente confronta il capo con brand commerciali di fascia media.",
      salesResponse: "Illustrare la filiera artigianale di Perugia: ogni capo Luisa Spagnoli attraversa oltre 40 passaggi sartoriali e collaudi manuali. Le fibre provengono da velli selezionati e mantengono la forma nel corso dei decenni.",
      luxuryCraftArgument: "Filati nobili Merinfleur e 100% Lana Vergine cardata a torsione calibrata, immuni al pilling e anallergici.",
      pairingSuggestion: "Proporre il total look abbinato a cintura Dominanza in pelle finitura oro per valorizzare la silhouette.",
    },
    {
      objection: "Preoccupazione per la manutenzione e il lavaggio dei capi nobili",
      customerRationale: "Timore che seta pura o alpaca si rovinino durante l'uso invernale quotidiano.",
      salesResponse: "La lana nobile e l'alpaca possiedono lanolina naturale che respinge polvere e odori; è sufficiente arieggiare il capo su stampella anatomica. Per la seta pura, la finitura antipiega consente una tenuta impeccabile.",
      luxuryCraftArgument: "Trattamento tessile protettivo Made in Italy che preserva la mano fluida e la lucentezza delle fibre naturali.",
      pairingSuggestion: "Consigliare la custodia in tela traspirante Luisa Spagnoli e la spazzola sartoriale in setole morbide.",
    },
    {
      objection: "Vestibilità percepita come morbida o d'ispirazione mannish",
      customerRationale: "La cliente desidera un fit più sagomato sul punto vita.",
      salesResponse: "L'ispirazione FW26 Runway unisce la morbidezza contemporanea alla proporzione classica italiana. Il capo è studiato per cadere a piombo senza appesantire, consentendo giochi di layering con bluse in seta pura.",
      luxuryCraftArgument: "Taglio diagonale con cuciture interne ribattute a mano per assecondare la figura con eleganza naturale.",
      pairingSuggestion: "Coordinare con la gonna a matita Fenditura e décolleté a punta per slanciare la figura.",
    },
  ],
  Knitwear: [
    {
      objection: "Sensazione di pesantezza termica in ambienti chiusi riscaldati",
      customerRationale: "Timore che il pull in alpaca/lana risulti troppo caldo durante eventi o cene.",
      salesResponse: "La struttura a nido d'ape della maglieria cardata Luisa Spagnoli garantisce termoregolazione attiva: dissipa il calore corporeo in eccesso pur trattenendo una barriera isolante contro il gelo esterno.",
      luxuryCraftArgument: "75% Lana Alpaca (WP) + 25% Poliammide nobile (PA) per leggerezza aerea e massima coibenza termica.",
      pairingSuggestion: "Indossare su canotta in seta pura o camicia Lorenas per facilitare il de-layering con stile.",
    },
  ],
  Tailoring: [
    {
      objection: "Rigidità percepita della giacca o del tailleur formale",
      customerRationale: "Desiderio di comfort totale anche nelle giornate lavorative frenetiche.",
      salesResponse: "La sartoria Luisa Spagnoli adotta spalline leggere decostruite e interni foderati in cupro traspirante, donando mobilità pari a una maglia pur mantenendo l'impeccabile rigore del doppiopetto.",
      luxuryCraftArgument: "Costruzione semi-intelata artigianale che memorizza la forma del corpo con l'indosso prolungato.",
      pairingSuggestion: "Completare con pantalone a palazzo coordinato e borsa Istorie in suede cioccolato.",
    },
  ],
  Accessories: [
    {
      objection: "Valutazione dell'accessorio come spesa accessoria",
      customerRationale: "La cliente intende acquistare solo il capo spalla principale.",
      salesResponse: "L'accessorio è la firma stilistica del look FW26: la fibbia scultura placcata oro 24k trasforma un capospalla essenziale in un abito da sera e garantisce unicità al guardaroba.",
      luxuryCraftArgument: "Pelle pregiata conciata al vegetale in Toscana e minuteria metallica con tripla doratura a spessore.",
      pairingSuggestion: "Abbinare alla borsa Intatto e orecchini Narcao per creare un punto luce coordinato.",
    },
  ],
};

export const PO_SCHEDULE_TIMELINE: Record<string, { title: string; window: string; focus: string; linesheet: string }> = {
  '19369163': {
    title: 'PO #19369163 · FW26 Sfilata (Runway)',
    window: 'Consegna: 10/03/2026 – 20/03/2026',
    focus: 'Capi iconici sfilata Milano, maglieria alpaca cardata, borse suede e gioielleria dorata',
    linesheet: 'Fw 2026 - Sfilata',
  },
  '19189431': {
    title: 'PO #19189431 · FW26 Main Collection (Drop 1)',
    window: 'Consegna: 01/04/2026 – 15/04/2026',
    focus: 'Sartoria strutturata, tailleur gessati, abiti cocktail, capispalla in panno di pura lana',
    linesheet: 'Fw 2026 - Main Collection',
  },
  '18858382': {
    title: 'PO #18858382 · FW26 Pre-Collection (Early Fall)',
    window: 'Consegna: 20/02/2026 – 05/03/2026',
    focus: 'Bluse in seta pura, camiceria nobile, pantaloni palazzo e trench trans-stagionali',
    linesheet: 'Fw 2026 - Pre Collection',
  },
  '19200818': {
    title: 'PO #19200818 · FW26 Carryover Essentials',
    window: 'Consegna: 15/03/2026 – 30/03/2026',
    focus: 'Must-have continuativi, maglieria cashmere blend, cinture iconiche e pelletteria permanente',
    linesheet: 'Fw 2026 - Carryover',
  },
  '19189430': {
    title: 'PO #19189430 · FW26 Main Collection (Drop 2)',
    window: 'Consegna: 20/04/2026 – 10/05/2026',
    focus: 'Piumini sartoriali, cappe in double di lana, abiti da gran sera ricamati',
    linesheet: 'Fw 2026 - Main Collection',
  },
  '18858381': {
    title: 'PO #18858381 · FW26 Early Delivery Pack',
    window: 'Consegna: 10/02/2026 – 25/02/2026',
    focus: 'Lancio vetrina FW26, pezzi civetta d’impatto visivo e set campionari',
    linesheet: 'Fw 2026 - Pre Collection',
  },
};
