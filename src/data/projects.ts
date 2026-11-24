// All facts come from Iva's portfolio spreads (source/spreads). Where a fact is missing or
// contradicted in the source, it's left out, never invented. See content/inventory.md "Gaps".
// Macedonian copy is a first draft by Claude: Iva should review before launch.
import type { ImageMetadata } from 'astro';

const img = import.meta.glob<{ default: ImageMetadata }>('../assets/work/*.png', { eager: true });
const w = (name: string) => img[`../assets/work/${name}.png`].default;

export type Lang = 'en' | 'mk';
type T = Record<Lang, string>;
export type Shot = { src: ImageMetadata; kind: 'render' | 'drawing' | 'sketch'; alt: T; size?: 'wide' | 'half' };

export type Project = {
  slug: string;
  name: string;
  type: T;
  location: T;
  year: string | null;
  status: T;
  facts: { label: T; value: string }[];
  summary: T;
  body: Record<Lang, string[]>;
  hero: Shot;
  thumb: ImageMetadata;
  gallery: Shot[];
};

const concept: T = { en: 'Conceptual design', mk: 'Идејно решение' };

export const projects: Project[] = [
  {
    slug: 'aura-theatre',
    name: 'Aura Theatre',
    type: { en: 'Theatre and cultural centre', mk: 'Театар и културен центар' },
    location: { en: 'Aerodrom, Skopje', mk: 'Аеродром, Скопје' },
    year: null,
    status: concept,
    facts: [],
    summary: {
      en: 'A theatre in a park: a long glass wing that ends in a round auditorium, all under one thin roof.',
      mk: 'Театар во парк: долго стаклено крило што завршува со кружна сала, под еден тенок покрив.',
    },
    body: {
      en: [
        'Aura Theatre puts performance, architecture and landscape on one line. A long wing holds offices, rehearsal rooms and a press centre. At its end, a circular volume holds the auditorium and turns the whole plan toward the stage.',
        'Broad flat roofs and slender columns make sheltered edges on every side. Glass façades open the public rooms to the park, so the foyer feels like part of the walk.',
        'The seating is curved and stepped for clear sightlines. Roof, parapet and glazing are worked out down to the membrane.',
      ],
      mk: [
        'Театарот Аура ги поврзува изведбата, архитектурата и пејзажот во една линија. Долгото крило ги содржи канцелариите, салите за проби и прес-центарот. На неговиот крај, кружниот волумен ја содржи салата и го насочува целиот план кон сцената.',
        'Широките рамни покриви и тенките столбови создаваат заштитени рабови од сите страни. Стаклените фасади ги отвораат јавните простории кон паркот, па фоајето е дел од прошетката.',
        'Седиштата се закривени и скалести за јасна видливост. Покривот, атиката и застаклувањето се разработени до ниво на мембрана.',
      ],
    },
    hero: { src: w('aura-aerial'), kind: 'render', alt: { en: 'Aura Theatre at sunset, seen from above, with the circular auditorium and the long glass wing in a park', mk: 'Театар Аура на зајдисонце, од воздух, со кружната сала и долгото стаклено крило во парк' } },
    thumb: w('aura-pano-2'),
    gallery: [
      { src: w('aura-axo'), kind: 'drawing', size: 'half', alt: { en: 'Axonometry in red line', mk: 'Аксонометрија во црвена линија' } },
      { src: w('aura-red'), kind: 'render', size: 'half', alt: { en: 'Massing study: the building in red against a grey landscape', mk: 'Студија на волумен: зградата во црвено врз сив пејзаж' } },
      { src: w('aura-pano-2'), kind: 'render', size: 'wide', alt: { en: 'Front elevation at dusk with the lit foyer and the round auditorium behind', mk: 'Предна фасада во самрак со осветлено фоаје и кружната сала зад него' } },
      { src: w('aura-plans'), kind: 'drawing', size: 'wide', alt: { en: 'Ground and first floor plans', mk: 'Основи на приземје и кат' } },
      { src: w('aura-auditorium'), kind: 'render', size: 'half', alt: { en: 'Auditorium with curved, stepped seating', mk: 'Сала со закривени, скалести седишта' } },
      { src: w('aura-siteplan'), kind: 'drawing', size: 'half', alt: { en: 'Site plan in the park', mk: 'Ситуација во паркот' } },
      { src: w('aura-exploded'), kind: 'drawing', size: 'half', alt: { en: 'Exploded axonometry of the floors', mk: 'Раздвоена аксонометрија на катовите' } },
      { src: w('aura-detail'), kind: 'drawing', size: 'half', alt: { en: 'Roof and parapet junction detail', mk: 'Детал на спој на покрив и атика' } },
      { src: w('aura-pano-3'), kind: 'render', size: 'wide', alt: { en: 'Entrance at sunset', mk: 'Влез на зајдисонце' } },
    ],
  },
  {
    slug: 'quiet-sailing',
    name: 'Quiet Sailing',
    type: { en: 'Museum, marina and fish market', mk: 'Музеј, марина и рибен пазар' },
    location: { en: 'Lake Ohrid', mk: 'Охридско Езеро' },
    year: '2025–26',
    status: { en: 'University studio, Urban Design 1', mk: 'Студиски проект, Урбан дизајн 1' },
    facts: [],
    summary: {
      en: 'A museum, a marina and a fish market strung along the shore of Lake Ohrid, built around the boats that still work there.',
      mk: 'Музеј, марина и рибен пазар долж брегот на Охридското Езеро, околу чамците што и денес работат таму.',
    },
    body: {
      en: [
        'The site sits on the shore of Lake Ohrid. The design is one continuous route: paths and platforms follow the curve of the water and give you different ways to reach it.',
        'The research came first: the lake’s fish, its traditional and working boats, and how locals and visitors use the shore. That shaped a linear plan, with the museum at one end and the fishing harbour, restaurant and fish shop at the other.',
        'Timber, open frames and long views to the water carry the local fishing tradition into a public building. There is room for activity and for sitting quietly by the lake.',
      ],
      mk: [
        'Локацијата е на брегот на Охридското Езеро. Проектот е една непрекината патека: патеките и платформите ја следат линијата на водата и нудат различни начини да се стигне до неа.',
        'Прво дојде истражувањето: рибите во езерото, традиционалните и работните чамци и начинот на кој жителите и посетителите го користат брегот. Од тоа произлезе линеарен план, со музејот на едниот крај и рибарското пристаниште, ресторанот и рибарницата на другиот.',
        'Дрвото, отворените рамки и долгите погледи кон водата ја пренесуваат локалната рибарска традиција во јавна зграда. Има место и за активност и за тивко седење покрај езерото.',
      ],
    },
    hero: { src: w('sail-aerial'), kind: 'render', alt: { en: 'Long timber museum building and a pier pavilion on the shore of Lake Ohrid', mk: 'Долга дрвена музејска зграда и павилјон на кеј на брегот на Охридското Езеро' } },
    thumb: w('sail-aerial'),
    gallery: [
      { src: w('sail-sketch-fish'), kind: 'sketch', size: 'half', alt: { en: 'Hand sketch: fish shop by the harbour crane', mk: 'Скица: рибарница покрај пристанишниот кран' } },
      { src: w('sail-sketch-museum'), kind: 'sketch', size: 'half', alt: { en: 'Hand sketch: museum hall with boats', mk: 'Скица: музејска сала со чамци' } },
      { src: w('sail-gallery'), kind: 'render', size: 'wide', alt: { en: 'Timber gallery along the lake', mk: 'Дрвена галерија покрај езерото' } },
      { src: w('sail-programme'), kind: 'drawing', size: 'half', alt: { en: 'Programme analysis and linear layout', mk: 'Анализа на програма и линеарен распоред' } },
      { src: w('sail-sketch-marina'), kind: 'sketch', size: 'half', alt: { en: 'Hand sketch: the marina from above', mk: 'Скица: марината од воздух' } },
      { src: w('sail-plans'), kind: 'drawing', size: 'wide', alt: { en: 'Museum and restaurant plans', mk: 'Основи на музејот и ресторанот' } },
      { src: w('sail-sections'), kind: 'drawing', size: 'wide', alt: { en: 'Sections and elevations against the hills', mk: 'Пресеци и фасади наспроти ридовите' } },
      { src: w('sail-daylight'), kind: 'drawing', size: 'half', alt: { en: 'Daylight and spatial sections', mk: 'Пресеци за дневна светлина и простор' } },
      { src: w('sail-fire'), kind: 'render', size: 'half', alt: { en: 'Fire pit gathering space by the water', mk: 'Место за собирање со огниште покрај водата' } },
      { src: w('sail-boats'), kind: 'sketch', size: 'wide', alt: { en: 'Watercolour study of Ohrid boat types', mk: 'Акварелна студија на охридски чамци' } },
    ],
  },
  {
    slug: 'xmall',
    name: 'XMall',
    type: { en: 'Mixed-use commercial', mk: 'Мешана намена, комерцијален' },
    location: { en: 'Aerodrom, Skopje', mk: 'Аеродром, Скопје' },
    year: '2026',
    status: concept,
    facts: [
      { label: { en: 'Site', mk: 'Парцела' }, value: '24,500 m²' },
      { label: { en: 'Built area', mk: 'Бруто површина' }, value: '32,800 m²' },
    ],
    summary: {
      en: 'Shops, offices, a supermarket and a gym around green courtyards, with three towers that give it a place on the skyline.',
      mk: 'Продавници, канцеларии, супермаркет и теретана околу зелени дворови, со три кули што му даваат место во силуетата на градот.',
    },
    body: {
      en: [
        'XMall brings retail, leisure and public space into one complex. Low connected wings and taller towers give it a varied skyline and a clear presence in the neighbourhood.',
        'Landscaped courtyards and roof terraces bring green into the scheme and give people places to rest and meet. Large glazing connects what happens inside with the outdoor spaces, and a steady rhythm of vertical fins ties the different volumes together.',
        'The plans keep commercial, office and leisure zones apart. Circulation cores link the levels, and open-plan floors leave room to change.',
      ],
      mk: [
        'XMall ги спојува трговијата, рекреацијата и јавниот простор во еден комплекс. Ниските поврзани крила и повисоките кули создаваат разновидна силуета и јасно присуство во населбата.',
        'Уредените дворови и покривните тераси внесуваат зеленило и нудат места за одмор и средба. Големите стаклени површини ги поврзуваат внатрешните активности со надворешниот простор, а постојаниот ритам на вертикални ребра ги обединува различните волумени.',
        'Основите ги разделуваат комерцијалните, административните и рекреативните зони. Вертикалните јадра ги поврзуваат нивоата, а отворените катови оставаат простор за промена.',
      ],
    },
    hero: { src: w('xmall-aerial'), kind: 'render', alt: { en: 'XMall from above: three towers and low wings around planted courtyards', mk: 'XMall од воздух: три кули и ниски крила околу озеленети дворови' } },
    thumb: w('xmall-aerial'),
    gallery: [
      { src: w('xmall-tower'), kind: 'render', size: 'half', alt: { en: 'Concrete and glass tower at street level', mk: 'Кула од бетон и стакло на ниво на улица' } },
      { src: w('xmall-axo'), kind: 'drawing', size: 'half', alt: { en: 'Axonometry in red line', mk: 'Аксонометрија во црвена линија' } },
      { src: w('xmall-drawings'), kind: 'drawing', size: 'wide', alt: { en: 'Floor plans and sections', mk: 'Основи и пресеци' } },
      { src: w('xmall-elev'), kind: 'drawing', size: 'half', alt: { en: 'Elevations with planting', mk: 'Фасади со зеленило' } },
      { src: w('xmall-programme'), kind: 'drawing', size: 'half', alt: { en: 'Programme analysis', mk: 'Анализа на програма' } },
      { src: w('xmall-plans'), kind: 'drawing', size: 'wide', alt: { en: 'Ground floor plans in context', mk: 'Основи на приземје во контекст' } },
    ],
  },
  {
    slug: 'health-center',
    name: 'Health Center',
    type: { en: 'Public healthcare', mk: 'Јавна здравствена установа' },
    location: { en: 'Skopje', mk: 'Скопје' },
    year: null,
    status: concept,
    facts: [{ label: { en: 'Site', mk: 'Парцела' }, value: '6,500 m²' }],
    summary: {
      en: 'A clinic behind a curved wall, with gardens and walkable plazas between the street and the door.',
      mk: 'Клиника зад закривен ѕид, со градини и пешачки плоштади помеѓу улицата и влезот.',
    },
    body: {
      en: [
        'A public health center that puts patients first. A curved outer wall, cut with large oval openings, wraps the building and shelters the entrance garden.',
        'Behind it, light-filled wards and clinics sit around an atrium. Admissions and emergency are on the ground floor, cardiology and surgery above, and administration at the top.',
        'Green courtyards and plazas connect the building to the streets around it, so arriving feels like walking through a garden.',
      ],
      mk: [
        'Јавен здравствен центар во кој пациентот е на прво место. Закривен надворешен ѕид, со големи овални отвори, ја обвиткува зградата и ја заштитува влезната градина.',
        'Зад него, светли одделенија и амбуланти се распоредени околу атриум. Приемот и итната помош се во приземјето, кардиологијата и хирургијата на катот, а администрацијата најгоре.',
        'Зелените дворови и плоштади ја поврзуваат зградата со околните улици, па пристигнувањето е како прошетка низ градина.',
      ],
    },
    hero: { src: w('health-aerial'), kind: 'render', alt: { en: 'Health Center from above: a long building behind a curved wall with oval openings', mk: 'Здравствен центар од воздух: долга зграда зад закривен ѕид со овални отвори' } },
    thumb: w('health-aerial'),
    gallery: [
      { src: w('health-axo'), kind: 'drawing', size: 'half', alt: { en: 'Axonometry in its urban block', mk: 'Аксонометрија во урбаниот блок' } },
      { src: w('health-cutaway'), kind: 'render', size: 'half', alt: { en: 'Cutaway of the operating and ward floors', mk: 'Пресек низ операционите и болничките катови' } },
      { src: w('health-plans'), kind: 'drawing', size: 'wide', alt: { en: 'Floor plans', mk: 'Основи' } },
      { src: w('health-sections'), kind: 'drawing', size: 'half', alt: { en: 'Sections and elevations', mk: 'Пресеци и фасади' } },
      { src: w('health-site'), kind: 'drawing', size: 'half', alt: { en: 'Landscape plan of the entrance garden', mk: 'Пејзажен план на влезната градина' } },
    ],
  },
  {
    slug: 'public-building',
    name: 'Public Building',
    type: { en: 'Civic and administrative', mk: 'Јавна и административна' },
    location: { en: 'Skopje', mk: 'Скопје' },
    year: null,
    status: concept,
    facts: [],
    summary: {
      en: 'A civic office building and a small pavilion that frame a landscaped forecourt open to the city.',
      mk: 'Јавна административна зграда и мал павилјон што оформуваат уреден предпростор отворен кон градот.',
    },
    body: {
      en: [
        'A civic centre that brings administrative services, workplaces and shared spaces into one composition. A multi-storey main volume and a smaller pavilion frame an open, landscaped forecourt.',
        'The forecourt makes the relationship between the institution and the city a welcoming one. Inside, a public hall, exhibition space and café sit at ground level, with offices and meeting rooms above.',
      ],
      mk: [
        'Граѓански центар што ги обединува административните услуги, работните места и заедничките простори во една композиција. Повеќекатниот главен волумен и помалиот павилјон оформуваат отворен, уреден предпростор.',
        'Предпросторот го прави односот помеѓу институцијата и градот гостопримлив. Внатре, јавната сала, изложбениот простор и кафулето се во приземјето, а канцелариите и салите за состаноци над нив.',
      ],
    },
    hero: { src: w('public-render'), kind: 'render', alt: { en: 'Glass and dark-steel office volumes by a reflecting pool', mk: 'Волумени од стакло и темен челик покрај воден басен' } },
    thumb: w('public-elev'),
    gallery: [
      { src: w('public-section'), kind: 'drawing', size: 'wide', alt: { en: 'Long section through the main volume', mk: 'Подолжен пресек низ главниот волумен' } },
      { src: w('public-elev'), kind: 'render', size: 'half', alt: { en: 'Elevation studies', mk: 'Студии на фасади' } },
      { src: w('public-plans'), kind: 'drawing', size: 'half', alt: { en: 'Typical office floor plans', mk: 'Типски основи на канцелариски кат' } },
      { src: w('public-interiors'), kind: 'render', size: 'half', alt: { en: 'Interior studies of the atrium and offices', mk: 'Студии на ентериер на атриумот и канцелариите' } },
      { src: w('public-site'), kind: 'drawing', size: 'half', alt: { en: 'Site plan', mk: 'Ситуација' } },
    ],
  },
];

export const bySlug = (s: string) => projects.find((p) => p.slug === s)!;
