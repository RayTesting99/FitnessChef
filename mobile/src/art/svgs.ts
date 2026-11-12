// Hand-drawn vector art as SVG strings (rendered with react-native-svg's SvgXml).
// Palette: warm autumn kitchen. Outline colour is a dark brown so characters feel soft, not harsh black.
const O = '#4A2C17'; // outline
const G = 'stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

/** Protein: bear lifting a dumbbell. */
export const bear = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g stroke="${O}" ${G}>
<rect x="38" y="74" width="44" height="40" rx="16" fill="#E8833A"/>
<circle cx="36" cy="30" r="11" fill="#A9744F"/><circle cx="84" cy="30" r="11" fill="#A9744F"/>
<circle cx="36" cy="30" r="5" fill="#E9C9A0" stroke="none"/><circle cx="84" cy="30" r="5" fill="#E9C9A0" stroke="none"/>
<circle cx="60" cy="52" r="27" fill="#A9744F"/>
<path d="M34 43 Q60 31 86 43 L86 50 Q60 39 34 50 Z" fill="#C8641E"/>
<ellipse cx="60" cy="62" rx="12" ry="9" fill="#E9C9A0"/>
<ellipse cx="60" cy="58" rx="4.5" ry="3.2" fill="${O}" stroke="none"/>
<path d="M54 66 Q60 71 66 66" fill="none"/>
<circle cx="49" cy="53" r="3" fill="${O}" stroke="none"/><circle cx="71" cy="53" r="3" fill="${O}" stroke="none"/>
<line x1="14" y1="96" x2="106" y2="96" stroke-width="5"/>
<rect x="9" y="82" width="11" height="28" rx="3" fill="#6B6B6B"/><rect x="21" y="87" width="7" height="18" rx="2" fill="#8A8A8A"/>
<rect x="100" y="82" width="11" height="28" rx="3" fill="#6B6B6B"/><rect x="92" y="87" width="7" height="18" rx="2" fill="#8A8A8A"/>
<circle cx="44" cy="96" r="7" fill="#A9744F"/><circle cx="76" cy="96" r="7" fill="#A9744F"/>
</g></svg>`;

/** Carbs: rabbit on the run with a water bottle. */
export const rabbit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g stroke="${O}" ${G}>
<path d="M8 84 H26 M3 94 H23 M10 104 H28" fill="none" stroke="#C8A07A"/>
<rect x="40" y="76" width="40" height="38" rx="15" fill="#6B8E4E"/>
<ellipse cx="46" cy="22" rx="8" ry="20" fill="#F6DDB8" transform="rotate(-8 46 22)"/>
<ellipse cx="74" cy="22" rx="8" ry="20" fill="#F6DDB8" transform="rotate(8 74 22)"/>
<ellipse cx="46" cy="25" rx="3.5" ry="12" fill="#F2B8A0" stroke="none" transform="rotate(-8 46 25)"/>
<ellipse cx="74" cy="25" rx="3.5" ry="12" fill="#F2B8A0" stroke="none" transform="rotate(8 74 25)"/>
<circle cx="60" cy="57" r="25" fill="#F6DDB8"/>
<rect x="36" y="43" width="48" height="7" rx="3" fill="#C8641E"/>
<circle cx="50" cy="57" r="3" fill="${O}" stroke="none"/><circle cx="70" cy="57" r="3" fill="${O}" stroke="none"/>
<circle cx="43" cy="64" r="4" fill="#F2B8A0" stroke="none"/><circle cx="77" cy="64" r="4" fill="#F2B8A0" stroke="none"/>
<ellipse cx="60" cy="63" rx="3" ry="2.4" fill="#E58F8F" stroke="none"/>
<path d="M60 65 V68 M60 68 Q56 72 53 69 M60 68 Q64 72 67 69" fill="none"/>
<rect x="88" y="80" width="13" height="24" rx="4" fill="#E8833A"/><rect x="91" y="74" width="7" height="7" rx="2" fill="${O}"/>
<circle cx="36" cy="94" r="6.5" fill="#F6DDB8"/><circle cx="86" cy="94" r="6.5" fill="#F6DDB8"/>
</g></svg>`;

/** Fat: fox with a kettlebell. */
export const fox = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g stroke="${O}" ${G}>
<path d="M82 102 Q116 100 108 64 Q104 90 80 92 Z" fill="#E8833A"/>
<rect x="40" y="76" width="40" height="38" rx="15" fill="#4F7C74"/>
<path d="M32 14 L52 34 L30 46 Z" fill="#E8833A"/><path d="M37 26 L47 34 L36 39 Z" fill="#6B4226" stroke="none"/>
<path d="M88 14 L68 34 L90 46 Z" fill="#E8833A"/><path d="M83 26 L73 34 L84 39 Z" fill="#6B4226" stroke="none"/>
<ellipse cx="60" cy="54" rx="27" ry="22" fill="#E8833A"/>
<path d="M40 58 Q49 69 60 72 Q71 69 80 58 Q60 65 40 58 Z" fill="#FFF6E9"/>
<circle cx="49" cy="50" r="3" fill="${O}" stroke="none"/><circle cx="71" cy="50" r="3" fill="${O}" stroke="none"/>
<ellipse cx="60" cy="64" rx="4.5" ry="3.3" fill="${O}" stroke="none"/>
<path d="M55 70 Q60 73 65 70" fill="none"/>
<path d="M49 94 Q60 72 71 94" fill="none" stroke-width="5"/>
<circle cx="60" cy="101" r="14" fill="#5A5A5A"/><path d="M52 96 Q54 91 59 91" fill="none" stroke="#9A9A9A" stroke-width="2.5"/>
<circle cx="50" cy="93" r="6.5" fill="#E8833A"/><circle cx="70" cy="93" r="6.5" fill="#E8833A"/>
</g></svg>`;

/** History: owl studying a checklist, thinking. */
export const owl = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 120"><g stroke="${O}" ${G}>
<ellipse cx="46" cy="80" rx="28" ry="30" fill="#A9744F"/>
<ellipse cx="46" cy="86" rx="16" ry="20" fill="#E9C9A0" stroke="none"/>
<path d="M24 30 L38 40 L22 48 Z" fill="#6B4226"/><path d="M68 30 L54 40 L70 48 Z" fill="#6B4226"/>
<circle cx="46" cy="50" r="24" fill="#A9744F"/>
<circle cx="37" cy="49" r="9.5" fill="#FFF9F0"/><circle cx="56" cy="49" r="9.5" fill="#FFF9F0"/>
<circle cx="40" cy="48" r="4" fill="${O}" stroke="none"/><circle cx="59" cy="48" r="4" fill="${O}" stroke="none"/>
<path d="M42 58 L50 58 L46 66 Z" fill="#E8833A"/>
<g transform="rotate(-8 92 96)"><rect x="70" y="72" width="44" height="46" rx="5" fill="#FFF9F0"/>
<path d="M77 84 l3 3 l5 -6 M77 98 l3 3 l5 -6" fill="none" stroke="#6B8E4E"/>
<path d="M90 85 H106 M90 99 H106 M77 111 H106" fill="none" stroke="#C8A07A" stroke-width="2.5"/></g>
<ellipse cx="68" cy="94" rx="7" ry="10" fill="#6B4226"/>
<ellipse cx="38" cy="112" rx="8" ry="4" fill="#E8833A"/><ellipse cx="56" cy="112" rx="8" ry="4" fill="#E8833A"/>
<circle cx="78" cy="42" r="2.8" fill="#FFF9F0"/><circle cx="86" cy="32" r="4.2" fill="#FFF9F0"/>
<ellipse cx="108" cy="16" rx="24" ry="13" fill="#FFF9F0"/>
<circle cx="97" cy="16" r="2.4" fill="${O}" stroke="none"/><circle cx="108" cy="16" r="2.4" fill="${O}" stroke="none"/><circle cx="119" cy="16" r="2.4" fill="${O}" stroke="none"/>
</g></svg>`;

/** Log (food) screen: a kitchen shelf with a pot, mug, jar and pumpkin. */
export const kitchenShelf = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100"><g stroke="${O}" ${G}>
<path d="M54 26 Q48 18 55 10 M70 24 Q64 16 71 6 M86 26 Q80 18 87 10" fill="none" stroke="#D9BC96"/>
<rect x="38" y="46" width="64" height="38" rx="6" fill="#C8641E"/>
<rect x="27" y="56" width="11" height="7" rx="3" fill="#6B4226"/><rect x="102" y="56" width="11" height="7" rx="3" fill="#6B4226"/>
<path d="M34 46 H106 Q106 35 70 35 Q34 35 34 46 Z" fill="#E8833A"/><circle cx="70" cy="31" r="4" fill="#6B4226"/>
<path d="M134 52 Q138 44 142 52 M150 52 Q154 44 158 52" fill="none" stroke="#D9BC96"/>
<rect x="130" y="58" width="34" height="26" rx="7" fill="#FFF9F0"/><path d="M164 64 Q181 64 181 74 Q181 83 164 80" fill="none"/>
<path d="M130 70 H164" stroke="#E8833A" stroke-width="4" fill="none"/>
<rect x="203" y="39" width="32" height="8" rx="3" fill="#A9744F"/>
<rect x="200" y="46" width="38" height="38" rx="9" fill="#FFF3DC"/><path d="M201 60 H237 V76 Q237 83 230 83 H208 Q201 83 201 76 Z" fill="#E9C9A0" stroke="none"/>
<path d="M270 52 Q290 44 310 52 Q318 70 308 82 Q290 88 272 82 Q262 70 270 52 Z" fill="#E8833A"/>
<path d="M290 48 Q280 66 290 85 M280 50 Q272 68 280 84 M300 50 Q308 68 300 84" fill="none" stroke="#C8641E" stroke-width="2.5"/>
<rect x="287" y="38" width="6" height="12" rx="2" fill="#6B4226"/><path d="M293 42 Q304 32 312 38 Q304 46 293 42 Z" fill="#6B8E4E"/>
<path d="M332 84 Q326 62 340 52 Q346 68 332 84 Z" fill="#6B8E4E"/><path d="M332 84 Q344 66 352 70 Q348 82 332 84 Z" fill="#C8641E"/>
<rect x="10" y="84" width="340" height="9" rx="3" fill="#A9744F"/>
</g></svg>`;
