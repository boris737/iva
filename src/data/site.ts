// Site-wide copy. Facts from source/cv/Iva_Hristova_CV.pdf and spread 02.
// Macedonian is a first draft: Iva should review before launch.
import type { Lang } from './projects';

export const contact = {
  email: 'hristovaiva1@gmail.com',
  phone: '+389 75 425 144',
  phoneHref: '+38975425144',
  instagram: 'hristdesign',
};

export const href = (lang: Lang, path = '') => (lang === 'en' ? '/' : '/mk/') + path.replace(/^\//, '');

export const ui = {
  en: {
    nav: { work: 'Work', studio: 'Hristdesign', about: 'About', contact: 'Contact' },
    other: 'МК', otherLabel: 'Македонски', skip: 'Skip to content',
    heroLine: 'Architect and interior designer in Skopje. I design public buildings and the rooms inside them, from site plan to roof detail.',
    heroCap: 'Aura Theatre, Skopje',
    lights: ['A line on paper.', 'A room for a city.', 'Aura Theatre'],
    lightsSub: 'Theatre and cultural centre, Skopje',
    selected: 'Selected work', allWork: 'All projects',
    drawnTitle: 'Drawn to the detail',
    drawnText: 'Every project starts on paper and goes down to the junction of roof and wall. Renders sell a building. Drawings prove it works.',
    studioText: 'My studio for interiors and small houses in Macedonia. Warm materials, low light, rooms that feel calm at the end of a day.',
    studioCta: 'Start a project',
    materials: 'Materials I like to work with',
    mat: ['Walnut', 'Travertine', 'Board-marked concrete', 'Lime plaster'],
    aboutTeaser: 'Educated in Skopje, working between architecture and interiors, and looking for a studio to grow with, at home or abroad.',
    aboutMore: 'More about me',
    talk: 'Let’s talk about a building, a room or a role.',
    facts: { location: 'Location', type: 'Type', year: 'Year', status: 'Status' },
    next: 'Next project', back: 'All work',
    drawing: 'Drawing', render: 'Render', sketch: 'Hand sketch',
    workIntro: 'Five projects, from a lakeside museum to a health center in Skopje.',
    title: 'Iva Hristova, architect',
    desc: 'Iva Hristova is an architect and interior designer in Skopje. Theatres, clinics, a museum on Lake Ohrid, and interiors through her studio, Hristdesign.',
  },
  mk: {
    nav: { work: 'Проекти', studio: 'Hristdesign', about: 'За мене', contact: 'Контакт' },
    other: 'EN', otherLabel: 'English', skip: 'Прескокни до содржината',
    heroLine: 'Архитект и дизајнер на ентериер од Скопје. Проектирам јавни згради и просторите во нив, од ситуација до детал на покрив.',
    heroCap: 'Театар Аура, Скопје',
    lights: ['Линија на хартија.', 'Простор за градот.', 'Aura Theatre'],
    lightsSub: 'Театар и културен центар, Скопје',
    selected: 'Избрани проекти', allWork: 'Сите проекти',
    drawnTitle: 'Нацртано до детал',
    drawnText: 'Секој проект почнува на хартија и оди до спојот на покривот и ѕидот. Рендерите ја продаваат зградата. Цртежите докажуваат дека функционира.',
    studioText: 'Моето студио за ентериери и мали куќи во Македонија. Топли материјали, пригушена светлина, простории што смируваат на крајот од денот.',
    studioCta: 'Започнете проект',
    materials: 'Материјали со кои сакам да работам',
    mat: ['Орев', 'Травертин', 'Бетон со отпечаток од даска', 'Варов малтер'],
    aboutTeaser: 'Школувана во Скопје, работам помеѓу архитектура и ентериер и барам студио со кое ќе растам, дома или во странство.',
    aboutMore: 'Повеќе за мене',
    talk: 'Да разговараме за зграда, простор или работно место.',
    facts: { location: 'Локација', type: 'Тип', year: 'Година', status: 'Статус' },
    next: 'Следен проект', back: 'Сите проекти',
    drawing: 'Цртеж', render: 'Рендер', sketch: 'Скица',
    workIntro: 'Пет проекти, од музеј покрај езеро до здравствен центар во Скопје.',
    title: 'Ива Христова, архитект',
    desc: 'Ива Христова е архитект и дизајнер на ентериер од Скопје. Театри, клиники, музеј на Охридското Езеро и ентериери преку нејзиното студио Hristdesign.',
  },
} as const;

export const about = {
  en: {
    title: 'About',
    lead: 'A strong idea has to balance creativity with technical understanding. That’s how I work.',
    bio: [
      'I’m Iva Hristova, an architect educated in Skopje. I’ve worked across interior design, engineering and construction, and that taught me how materials, space and the process of building fit together.',
      'Today I design office interiors at Parallel Group in Skopje and run my own studio, Hristdesign, for interiors and outdoor spaces. I use 3D visualisation to test layouts, try materials and explain decisions.',
      'I’m curious by nature and I want to keep growing, in an international studio or on projects at home.',
    ],
    exp: 'Experience', edu: 'Education', skills: 'Software', langs: 'Languages', cv: 'Download CV (PDF)',
  },
  mk: {
    title: 'За мене',
    lead: 'Силната идеја мора да ги балансира креативноста и техничкото разбирање. Така работам.',
    bio: [
      'Јас сум Ива Христова, архитект школуван во Скопје. Работев во ентериер, инженерство и градежништво, и од тоа научив како материјалите, просторот и процесот на градење се поврзуваат.',
      'Денес проектирам канцелариски ентериери во Parallel Group во Скопје и го водам моето студио Hristdesign за ентериери и надворешни простори. Користам 3Д визуелизација за да тестирам распореди, да пробам материјали и да ги објаснам одлуките.',
      'По природа сум љубопитна и сакам да продолжам да растам, во меѓународно студио или на проекти дома.',
    ],
    exp: 'Искуство', edu: 'Образование', skills: 'Софтвер', langs: 'Јазици', cv: 'Преземи CV (PDF)',
  },
};

export const cv = {
  experience: [
    { role: { en: 'Interior designer', mk: 'Дизајнер на ентериер' }, org: 'Parallel Group, Skopje', when: { en: 'Oct 2026 – now', mk: 'окт. 2026 – денес' },
      what: { en: 'Office interiors and workplace furniture (NOTI, Humanscale, Leyform, RS Barcelona).', mk: 'Канцелариски ентериери и мебел (NOTI, Humanscale, Leyform, RS Barcelona).' } },
    { role: { en: 'Founder and designer', mk: 'Основач и дизајнер' }, org: 'Hristdesign', when: { en: 'Own studio', mk: 'Сопствено студио' },
      what: { en: 'Minimalist interiors and outdoor spaces: layouts, material palettes, 3D visualisation.', mk: 'Минималистички ентериери и надворешни простори: распореди, палети на материјали, 3Д визуелизација.' } },
    { role: { en: 'Architect, part-time', mk: 'Архитект, скратено работно време' }, org: { en: 'Construction company', mk: 'Градежна компанија' }, when: { en: '', mk: '' },
      what: { en: 'Design and 3D visualisation of buildings, including private houses.', mk: 'Проектирање и 3Д визуелизација на објекти, вклучително приватни куќи.' } },
    { role: { en: 'Architectural trainee', mk: 'Практикант архитект' }, org: 'Elko Ing, Strumica', when: { en: 'From May 2024', mk: 'од мај 2024' },
      what: { en: 'Floor plans, elevations and technical sections with architects and engineers.', mk: 'Основи, фасади и технички пресеци со архитекти и инженери.' } },
  ],
  education: [
    { what: { en: 'BA Architecture', mk: 'Додипломски студии по архитектура' }, where: 'University American College Skopje', when: '2022–2025' },
    { what: { en: 'Interior Design Academy: lighting, materials, rendering', mk: 'Академија за дизајн на ентериер: осветлување, материјали, рендерирање' }, where: 'Semos Education', when: '2025–2026' },
  ],
  software: 'Revit, AutoCAD, Archicad, SketchUp, 3ds Max, V-Ray, Lumion, Photoshop, Illustrator',
  languages: {
    en: 'Macedonian (native), English (advanced), Serbian, Bulgarian and Italian (conversational)',
    mk: 'македонски (мајчин), англиски (напреден), српски, бугарски и италијански (разговорно)',
  },
};
