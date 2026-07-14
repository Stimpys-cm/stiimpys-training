/**
 * ============================================================
 *  iconos.js — Función ICON() y diccionario SVG
 * ============================================================
 */
const ICON=(name,size=24)=>{
  const s=`width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"`;
  const P={
    dumbbell:'<path d="M6.5 6.5l11 11"/><rect x="1.5" y="6" width="4" height="7" rx="1.3" transform="rotate(-45 3.5 9.5)"/><rect x="18.5" y="11" width="4" height="7" rx="1.3" transform="rotate(-45 20.5 14.5)"/>',
    medal:'<circle cx="12" cy="15" r="6"/><path d="M9 15l1.5 1.5L15 12M8.2 9.5 5 3h4l2.5 4M15.8 9.5 19 3h-4l-2.5 4"/>',
    bolt:'<path d="M13 2 4.5 13H11l-1 9 8.5-11H12z" fill="currentColor" stroke="none"/>',
    fire:'<path d="M12 2c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 6 12 2z"/><path d="M12 22a6 6 0 0 0 6-6c0-3-2-4-3-6-1 2-2 2.5-3 3.5C11 15 10 15 10 17a2 2 0 0 0 4 0"/>',
    lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
    calc:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h4"/>',
    camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    trophy2:'<path d="M6 4h12v4a6 6 0 0 1-12 0zM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 18h6M12 14v4M8 21h8"/>',
    star:'<path d="M12 2l3 6.5 7 .9-5 4.9 1.2 7L12 18l-6.4 3.3L7 14.3 2 9.4l7-.9z"/>',
    copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mute:'<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/>',
    sound:'<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
    chart:'<path d="M3 3v18h18"/><path d="M7 15l3-4 3 2 4-6"/>',
    book:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M4 4.5A2.5 2.5 0 0 0 6.5 7H20"/>',
    shield:'<path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z"/>',
    users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    close:'<path d="M18 6 6 18M6 6l12 12"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    trash:'<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
    play:'<path d="M6 4v16l14-8z" fill="currentColor" stroke="none"/>',
    warn:'<path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
    chevron:'<path d="M9 18l6-6-6-6"/>',
    up:'<path d="M12 19V5M5 12l7-7 7 7"/>',
    down:'<path d="M12 5v14M5 12l7 7 7-7"/>',
    flame:'<path d="M12 2c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 9 9 6 12 2z"/><path d="M12 22a6 6 0 0 0 6-6c0-3-2-4-3-6-1 2-2 2.5-3 3.5C11 15 10 15 10 17a2 2 0 0 0 4 0"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    play2:'<circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4z" fill="currentColor" stroke="none"/>',
    arrowRight:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
    trophy:'<path d="M6 4h12v4a6 6 0 0 1-12 0zM6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3M9 18h6M12 14v4M8 21h8"/>',
    check2:'<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
    cloud:'<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  };
  return `<svg ${s} class="ico">${P[name]||''}</svg>`;
};

