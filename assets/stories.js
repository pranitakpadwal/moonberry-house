/* Moonberry Story Maker: picture stories built in the browser. No data leaves the device. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement;
  function mr() { return html.lang === 'mr'; }
  function T(en, m) { return mr() ? m : en; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------------- data ---------------- */
  var HEROES = [
    { id: 'star',   en: 'Little Star',  mr: 'छोटी चांदणी',  g: 'f', he: 'she', his: 'her', mn: 'छोटी चांदणी',  md: 'छोट्या चांदणीला', me: 'छोट्या चांदणीने', ms: 'छोट्या चांदणीसोबत', lives: 'राहत होती' },
    { id: 'goose',  en: 'Mama Goose',   mr: 'मामा गूज',      g: 'f', he: 'she', his: 'her', mn: 'मामा गूज',      md: 'मामा गूजला',       me: 'मामा गूजने',       ms: 'मामा गूजसोबत',       lives: 'राहत होती' },
    { id: 'bunny',  en: 'Little Bunny', mr: 'छोटा ससा',     g: 'm', he: 'he',  his: 'his', mn: 'छोटा ससा',      md: 'छोट्या सशाला',     me: 'छोट्या सशाने',     ms: 'छोट्या सशासोबत',     lives: 'राहत होता' },
    { id: 'fox',    en: 'Clever Fox',   mr: 'चतुर कोल्हा',  g: 'm', he: 'he',  his: 'his', mn: 'चतुर कोल्हा',   md: 'चतुर कोल्ह्याला',  me: 'चतुर कोल्ह्याने',  ms: 'चतुर कोल्ह्यासोबत',  lives: 'राहत होता' }
  ];
  var PLACES = [
    { id: 'pond',   en: 'the Moonlit Pond',  mr: 'चांदण्या तळ्याजवळ', pre: 'by the Moonlit Pond',    mp: 'चांदण्या तळ्याकाठी', label: 'Moonlit Pond',  ml: 'चांदणं तळं' },
    { id: 'forest', en: 'the Berry Forest',  mr: '', pre: 'in the Berry Forest',     mp: 'बेरीच्या जंगलात',    label: 'Berry Forest',  ml: 'बेरीचं जंगल' },
    { id: 'meadow', en: 'the Sunny Meadow',  mr: '', pre: 'in the Sunny Meadow',     mp: 'सोनेरी कुरणात',      label: 'Sunny Meadow',  ml: 'सोनेरी कुरण' },
    { id: 'cloud',  en: 'the Cloud Kingdom', mr: '', pre: 'high up in the Cloud Kingdom', mp: 'ढगांच्या राज्यात', label: 'Cloud Kingdom', ml: 'ढगांचं राज्य' }
  ];
  var FRIENDS = [
    { id: 'owl',       en: 'a wise owl',        mr: 'शहाणं घुबड',     label: 'Wise Owl',  ml: 'शहाणं घुबड',    mn: 'शहाणं घुबड',    ms: 'शहाण्या घुबडासोबत', verb: 'भेटलं' },
    { id: 'frog',      en: 'a jolly frog',      mr: 'आनंदी बेडूक',    label: 'Jolly Frog', ml: 'आनंदी बेडूक',   mn: 'आनंदी बेडूक',   ms: 'आनंदी बेडकासोबत',   verb: 'भेटला' },
    { id: 'butterfly', en: 'a gentle butterfly', mr: 'सुंदर फुलपाखरू', label: 'Butterfly', ml: 'सुंदर फुलपाखरू', mn: 'सुंदर फुलपाखरू', ms: 'सुंदर फुलपाखरासोबत', verb: 'भेटलं' },
    { id: 'turtle',    en: 'a kind turtle',     mr: 'प्रेमळ कासव',    label: 'Kind Turtle', ml: 'प्रेमळ कासव',   mn: 'प्रेमळ कासव',   ms: 'प्रेमळ कासवासोबत',   verb: 'भेटलं' }
  ];
  var QUESTS = [
    { id: 'rainbow', label: 'The Missing Rainbow', ml: 'हरवलेलं इंद्रधनुष्य', title: 'the Missing Rainbow', mtitle: 'हरवलेलं इंद्रधनुष्य',
      prob: 'the rainbow lost all its colours', mprob: 'इंद्रधनुष्याचे सगळे रंग हरवले',
      act: 'painted the rainbow back, one bright colour at a time', mact: 'इंद्रधनुष्य पुन्हा रंगवलं, एकेक सुंदर रंग भरत' },
    { id: 'moon', label: 'The Sleepy Moon', ml: 'झोपाळू चंद्र', title: 'the Sleepy Moon', mtitle: 'झोपाळू चंद्र',
      prob: 'the sleepy moon would not wake up', mprob: 'झोपाळू चंद्र काही केल्या उठेना',
      act: 'sang a gentle song until the moon woke up and smiled', mact: 'मंजुळ गाणं गायलं आणि चंद्र जागा होऊन हसला' },
    { id: 'party', label: 'The Berry Party', ml: 'बेरी पार्टी', title: 'the Berry Party', mtitle: 'बेरी पार्टी',
      prob: 'the big berry party had no berries', mprob: 'मोठ्या बेरी पार्टीसाठी बेरीच नव्हत्या',
      act: 'picked the juiciest berries and shared them with everyone', mact: 'सगळ्यात गोड बेरी तोडल्या आणि सगळ्यांना वाटल्या' },
    { id: 'starhome', label: 'The Lost Little Star', ml: 'हरवलेला छोटा तारा', title: 'the Lost Little Star', mtitle: 'हरवलेला छोटा तारा',
      prob: 'a tiny star was lost, far from the sky', mprob: 'एक इवलासा तारा आकाशापासून खूप दूर हरवला',
      act: 'built a ladder of fireflies and carried the star back home', mact: 'काजव्यांची शिडी बांधली आणि छोट्या ताऱ्याला त्याच्या घरी पोहोचवलं' }
  ];
  var COLORS = [
    { id: 'purple', hex: '#9B6FD9', en: 'Purple', mr: 'जांभळा', mm: 'जांभळी', fe: 'full of wonder', fm: 'आश्चर्याने भरून गेल्यासारखं वाटलं' },
    { id: 'yellow', hex: '#FFD66B', en: 'Yellow', mr: 'पिवळा', mm: 'पिवळी', fe: 'so happy', fm: 'खूप आनंदी वाटलं' },
    { id: 'green',  hex: '#4FB286', en: 'Green',  mr: 'हिरवा', mm: 'हिरवी', fe: 'so brave', fm: 'खूप धीट वाटलं' },
    { id: 'pink',   hex: '#FF6F91', en: 'Pink',   mr: 'गुलाबी', mm: 'गुलाबी', fe: 'so loved', fm: 'खूप प्रेम मिळाल्यासारखं वाटलं' },
    { id: 'blue',   hex: '#6EC1E4', en: 'Blue',   mr: 'निळा',  mm: 'निळी',  fe: 'so calm', fm: 'अगदी शांत वाटलं' },
    { id: 'orange', hex: '#FF9A5A', en: 'Orange', mr: 'नारंगी', mm: 'नारिंगी', fe: 'so excited', fm: 'खूप उत्साही वाटलं' }
  ];
  PLACES[0].mr = 'चांदण्या तळ्याजवळ';
  var STEPS = [
    { key: 'hero',  list: HEROES,  en: 'Pick your hero',      mr: 'तुमचा नायक निवडा',   hEn: 'Who is the story about?', hMr: 'गोष्ट कुणाची आहे?' },
    { key: 'place', list: PLACES,  en: 'Pick a magic place',  mr: 'जादुई जागा निवडा',   hEn: 'Where does it happen?', hMr: 'ही गोष्ट कुठे घडते?' },
    { key: 'friend', list: FRIENDS, en: 'Pick a best friend', mr: 'जिवलग मित्र निवडा',  hEn: 'Who comes along?', hMr: 'सोबत कोण येणार?' },
    { key: 'quest', list: QUESTS,  en: 'Pick an adventure',   mr: 'साहस निवडा',          hEn: 'What needs fixing?', hMr: 'काय सोडवायचं आहे?' },
    { key: 'color', list: COLORS,  en: 'Pick a magic colour', mr: 'जादूचा रंग निवडा',   hEn: 'This colour decides how the story feels at the end.', hMr: 'हा रंग गोष्टीच्या शेवटी कसं वाटेल ते ठरवतो.' }
  ];
  function by(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return list[0]; }
  function nm(o, which) { return which === 'mr' ? (o.mr || o.ml || o.en) : o.en; }

  /* ---------------- art ---------------- */
  function el(t, a, kids) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function starPts(cx, cy, R, r) { var p = [], i; for (i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; p.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1)); } return p.join(' '); }
  function eye(x, y, r, look) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"/><circle cx="' + (x + (look || 0)) + '" cy="' + (y + 0.6) + '" r="' + (r * 0.52) + '" fill="#2E2440"/><circle cx="' + (x + (look || 0) - r * 0.18) + '" cy="' + (y - r * 0.15) + '" r="' + (r * 0.18) + '" fill="#fff"/>'; }
  function mouth(x, y, mood, s) {
    s = s || 1;
    if (mood === 'worried') return '<path d="M' + (x - 6 * s) + ',' + (y + 3 * s) + ' Q' + x + ',' + (y - 3 * s) + ' ' + (x + 6 * s) + ',' + (y + 3 * s) + '" stroke="#7A3B2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    if (mood === 'wow') return '<ellipse cx="' + x + '" cy="' + (y + 2 * s) + '" rx="' + 4 * s + '" ry="' + 5 * s + '" fill="#7A3B2E"/>';
    return '<path d="M' + (x - 7 * s) + ',' + y + ' Q' + x + ',' + (y + 8 * s) + ' ' + (x + 7 * s) + ',' + y + '" stroke="#7A3B2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  }
  function cheeks(x, y, d) { return '<ellipse cx="' + (x - d) + '" cy="' + y + '" rx="5" ry="3" fill="#FF9FAE" opacity=".6"/><ellipse cx="' + (x + d) + '" cy="' + y + '" rx="5" ry="3" fill="#FF9FAE" opacity=".6"/>'; }
  function brows(x, y, d, mood) { return mood === 'worried' ? '<path d="M' + (x - d - 5) + ',' + (y - 9) + ' L' + (x - d + 4) + ',' + (y - 12) + ' M' + (x + d + 5) + ',' + (y - 9) + ' L' + (x + d - 4) + ',' + (y - 12) + '" stroke="#5B4A2E" stroke-width="2" stroke-linecap="round"/>' : ''; }
  function face(x, y, mood, big) { var d = big || 10; return eye(x - d, y, 5.2) + eye(x + d, y, 5.2) + brows(x, y, d, mood) + cheeks(x, y + 9, d + 5) + mouth(x, y + 11, mood); }

  var CHAR = {
    star: function (m) { return '<polygon points="' + starPts(0, -48, 46, 22) + '" fill="#FFD23F" stroke="#E0A100" stroke-width="2.5" stroke-linejoin="round"/>' + face(0, -50, m, 9); },
    goose: function (m) {
      return '<ellipse cx="-4" cy="-30" rx="34" ry="26" fill="#fff" stroke="#D9D3E6" stroke-width="2"/><path d="M-36,-34 Q-52,-42 -48,-24 Q-40,-28 -36,-24Z" fill="#fff" stroke="#D9D3E6" stroke-width="2"/>' +
        '<ellipse cx="-12" cy="-30" rx="17" ry="12" fill="#EFEAF8" stroke="#D9D3E6" stroke-width="1.5"/><path d="M14,-46 Q24,-70 26,-72" stroke="#fff" stroke-width="15" fill="none" stroke-linecap="round"/>' +
        '<circle cx="28" cy="-72" r="15" fill="#fff" stroke="#D9D3E6" stroke-width="2"/><path d="M40,-72 L56,-68 L40,-62 Z" fill="#FF9A2E" stroke="#D97706" stroke-width="1.5" stroke-linejoin="round"/>' +
        eye(30, -76, 4.6, 1) + (m === 'worried' ? '<path d="M24,-86 L35,-82" stroke="#5B4A2E" stroke-width="2" stroke-linecap="round"/>' : '') + '<ellipse cx="22" cy="-66" rx="4" ry="2.6" fill="#FF9FAE" opacity=".6"/>' +
        '<path d="M-14,-6 L-16,0 M-10,-6 L-12,0 M8,-6 L6,0 M12,-6 L10,0" stroke="#FF9A2E" stroke-width="4" stroke-linecap="round"/>';
    },
    bunny: function (m) {
      return '<ellipse cx="-14" cy="-72" rx="9" ry="26" fill="#fff" stroke="#E7DDF0" stroke-width="2" transform="rotate(-10 -14 -72)"/><ellipse cx="-14" cy="-72" rx="4.5" ry="18" fill="#FFB8CC" transform="rotate(-10 -14 -72)"/>' +
        '<ellipse cx="14" cy="-72" rx="9" ry="26" fill="#fff" stroke="#E7DDF0" stroke-width="2" transform="rotate(10 14 -72)"/><ellipse cx="14" cy="-72" rx="4.5" ry="18" fill="#FFB8CC" transform="rotate(10 14 -72)"/>' +
        '<ellipse cx="0" cy="-24" rx="30" ry="24" fill="#fff" stroke="#E7DDF0" stroke-width="2"/><circle cx="30" cy="-14" r="9" fill="#fff" stroke="#E7DDF0" stroke-width="2"/>' +
        '<circle cx="0" cy="-52" r="26" fill="#fff" stroke="#E7DDF0" stroke-width="2"/>' + face(0, -54, m, 10) + '<ellipse cx="-12" cy="-4" rx="9" ry="4" fill="#fff" stroke="#E7DDF0" stroke-width="2"/><ellipse cx="12" cy="-4" rx="9" ry="4" fill="#fff" stroke="#E7DDF0" stroke-width="2"/>';
    },
    fox: function (m) {
      return '<path d="M26,-22 Q62,-20 56,-58 Q40,-46 30,-36Z" fill="#FF8A3D" stroke="#D9651A" stroke-width="2"/><path d="M50,-50 Q56,-58 56,-58 Q58,-48 52,-42Z" fill="#fff"/>' +
        '<ellipse cx="0" cy="-24" rx="28" ry="23" fill="#FF8A3D" stroke="#D9651A" stroke-width="2"/><ellipse cx="0" cy="-20" rx="15" ry="16" fill="#FFF3E6"/>' +
        '<polygon points="-26,-62 -18,-92 -4,-66" fill="#FF8A3D" stroke="#D9651A" stroke-width="2" stroke-linejoin="round"/><polygon points="26,-62 18,-92 4,-66" fill="#FF8A3D" stroke="#D9651A" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="0" cy="-52" r="26" fill="#FF8A3D" stroke="#D9651A" stroke-width="2"/><path d="M-22,-46 Q0,-26 22,-46 Q10,-38 0,-36 Q-10,-38 -22,-46Z" fill="#FFF3E6"/>' +
        eye(-10, -56, 5, 0) + eye(10, -56, 5, 0) + (m === 'worried' ? '<path d="M-17,-65 L-6,-62 M17,-65 L6,-62" stroke="#5B4A2E" stroke-width="2" stroke-linecap="round"/>' : '') +
        '<ellipse cx="0" cy="-46" rx="4" ry="3" fill="#3A2A2A"/>' + mouth(0, -42, m, .8) + '<path d="M-10,-4 L-10,0 M10,-4 L10,0" stroke="#5B3A2A" stroke-width="5" stroke-linecap="round"/>';
    },
    owl: function (m) {
      return '<ellipse cx="0" cy="-34" rx="30" ry="34" fill="#B98558" stroke="#8B5E34" stroke-width="2"/><ellipse cx="0" cy="-26" rx="19" ry="22" fill="#F2DDC0"/>' +
        '<polygon points="-26,-62 -20,-80 -8,-64" fill="#B98558" stroke="#8B5E34" stroke-width="2"/><polygon points="26,-62 20,-80 8,-64" fill="#B98558" stroke="#8B5E34" stroke-width="2"/>' +
        '<circle cx="-12" cy="-50" r="13" fill="#fff" stroke="#8B5E34" stroke-width="2"/><circle cx="12" cy="-50" r="13" fill="#fff" stroke="#8B5E34" stroke-width="2"/><circle cx="-12" cy="-50" r="6" fill="#2E2440"/><circle cx="12" cy="-50" r="6" fill="#2E2440"/><circle cx="-10" cy="-52" r="2" fill="#fff"/><circle cx="14" cy="-52" r="2" fill="#fff"/>' +
        '<polygon points="-5,-42 5,-42 0,-32" fill="#FF9A2E" stroke="#D97706" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="-26" cy="-28" rx="9" ry="20" fill="#9A6A3E" transform="rotate(10 -26 -28)"/><ellipse cx="26" cy="-28" rx="9" ry="20" fill="#9A6A3E" transform="rotate(-10 26 -28)"/>' +
        '<path d="M-8,-2 L-8,2 M8,-2 L8,2" stroke="#FF9A2E" stroke-width="4" stroke-linecap="round"/>';
    },
    frog: function (m) {
      return '<ellipse cx="0" cy="-22" rx="36" ry="24" fill="#6BCB77" stroke="#3E9A4B" stroke-width="2"/><ellipse cx="0" cy="-14" rx="22" ry="14" fill="#CFF2C8"/>' +
        '<circle cx="-18" cy="-50" r="14" fill="#6BCB77" stroke="#3E9A4B" stroke-width="2"/><circle cx="18" cy="-50" r="14" fill="#6BCB77" stroke="#3E9A4B" stroke-width="2"/>' + eye(-18, -51, 8, 0) + eye(18, -51, 8, 0) +
        '<path d="M-16,-30 Q0,-16 16,-30" stroke="#2F7A3B" stroke-width="3" fill="none" stroke-linecap="round"/>' + (m === 'worried' ? '<path d="M-16,-24 Q0,-34 16,-24" stroke="#2F7A3B" stroke-width="3" fill="none" stroke-linecap="round"/>' : '') + cheeks(0, -26, 22) +
        '<ellipse cx="-26" cy="-2" rx="12" ry="5" fill="#6BCB77" stroke="#3E9A4B" stroke-width="2"/><ellipse cx="26" cy="-2" rx="12" ry="5" fill="#6BCB77" stroke="#3E9A4B" stroke-width="2"/>';
    },
    butterfly: function (m) {
      return '<ellipse cx="-24" cy="-52" rx="22" ry="26" fill="#FF8FB1" stroke="#D9547E" stroke-width="2" transform="rotate(-20 -24 -52)"/><ellipse cx="24" cy="-52" rx="22" ry="26" fill="#FF8FB1" stroke="#D9547E" stroke-width="2" transform="rotate(20 24 -52)"/>' +
        '<ellipse cx="-18" cy="-24" rx="15" ry="17" fill="#FFD66B" stroke="#E0A100" stroke-width="2" transform="rotate(20 -18 -24)"/><ellipse cx="18" cy="-24" rx="15" ry="17" fill="#FFD66B" stroke="#E0A100" stroke-width="2" transform="rotate(-20 18 -24)"/>' +
        '<circle cx="-26" cy="-54" r="6" fill="#fff" opacity=".8"/><circle cx="26" cy="-54" r="6" fill="#fff" opacity=".8"/><ellipse cx="0" cy="-38" rx="7" ry="26" fill="#6B4E9A" stroke="#4A3470" stroke-width="2"/>' +
        '<path d="M-2,-62 Q-10,-80 -16,-78 M2,-62 Q10,-80 16,-78" stroke="#4A3470" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="-3" cy="-48" r="2.4" fill="#fff"/><circle cx="3" cy="-48" r="2.4" fill="#fff"/><path d="M-3,-42 Q0,-39 3,-42" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    },
    turtle: function (m) {
      return '<ellipse cx="0" cy="-8" rx="38" ry="8" fill="#8BC17A"/><path d="M-38,-12 Q-36,-62 0,-62 Q36,-62 38,-12 Z" fill="#6FA85F" stroke="#427A3A" stroke-width="2"/>' +
        '<path d="M-20,-14 L-12,-40 L12,-40 L20,-14 M-12,-40 L0,-58 L12,-40" stroke="#427A3A" stroke-width="2" fill="none"/><path d="M-12,-40 L-20,-14 M12,-40 L20,-14" stroke="#427A3A" stroke-width="2" fill="none"/>' +
        '<circle cx="46" cy="-30" r="15" fill="#A8D68E" stroke="#427A3A" stroke-width="2"/>' + eye(50, -34, 4.4, 1) + '<path d="M46,-24 Q52,-19 58,-24" stroke="#7A3B2E" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="-22" cy="-4" rx="9" ry="6" fill="#A8D68E" stroke="#427A3A" stroke-width="2"/><ellipse cx="22" cy="-4" rx="9" ry="6" fill="#A8D68E" stroke="#427A3A" stroke-width="2"/>';
    }
  };
  function chr(id, x, y, s, mood, flip, floatUp) {
    return '<g class="chr' + (floatUp ? ' fly' : '') + '" data-c="' + id + '" transform="translate(' + x + ',' + y + ') scale(' + (flip ? -s : s) + ',' + s + ')"><g class="bob">' + CHAR[id](mood) + '</g></g>';
  }

  var UID = 0;
  function nid() { return ++UID; }
  var BG = {
    pond: function () {
      var k = nid();
      return '<defs><linearGradient id="gP' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241B4E"/><stop offset="1" stop-color="#7A5AA8"/></linearGradient><linearGradient id="gW' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4C7FD0"/><stop offset="1" stop-color="#2B4C95"/></linearGradient></defs>' +
        '<rect width="400" height="300" fill="url(#gP' + k + ')"/>' + [[30, 30], [90, 70], [150, 22], [230, 48], [280, 20], [350, 40], [380, 88], [60, 110]].map(function (p) { return '<circle class="tw" cx="' + p[0] + '" cy="' + p[1] + '" r="2" fill="#FFF9E6"/>'; }).join('') +
        '<path d="M0,170 Q100,150 200,168 T400,160 L400,300 L0,300Z" fill="#35704F"/><path d="M0,200 Q120,178 260,205 T400,195 L400,300 L0,300Z" fill="url(#gW' + k + ')"/>' +
        '<ellipse cx="100" cy="250" rx="32" ry="9" fill="#4FB286" stroke="#2C7A57" stroke-width="2"/><ellipse cx="310" cy="268" rx="38" ry="10" fill="#4FB286" stroke="#2C7A57" stroke-width="2"/><ellipse cx="215" cy="285" rx="26" ry="7" fill="#4FB286" stroke="#2C7A57" stroke-width="2"/>' +
        '<path d="M22,200 L18,160 M32,200 L34,150 M42,200 L46,164" stroke="#2C7A57" stroke-width="3" stroke-linecap="round"/>';
    },
    forest: function () {
      var k = nid();
      var trees = [[40, 120], [120, 100], [290, 110], [365, 125]].map(function (p) { return '<rect x="' + (p[0] - 7) + '" y="' + p[1] + '" width="14" height="100" fill="#7A5236" stroke="#4E3322" stroke-width="2"/><circle cx="' + p[0] + '" cy="' + (p[1] - 10) + '" r="40" fill="#2F8F5B" stroke="#1F6A41" stroke-width="2"/><circle cx="' + (p[0] - 22) + '" cy="' + (p[1] + 8) + '" r="26" fill="#3AA56C"/><circle cx="' + (p[0] + 22) + '" cy="' + (p[1] + 8) + '" r="26" fill="#3AA56C"/>'; }).join('');
      return '<defs><linearGradient id="gF' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D2E72"/><stop offset="1" stop-color="#A57BC4"/></linearGradient></defs><rect width="400" height="300" fill="url(#gF' + k + ')"/>' + trees +
        '<path d="M0,215 Q100,195 200,212 T400,205 L400,300 L0,300Z" fill="#2C7A57"/>' +
        [[70, 238], [330, 246], [180, 268]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" fill="#E5436F" stroke="#A82A4E" stroke-width="2"/><circle cx="' + (p[0] + 14) + '" cy="' + (p[1] + 4) + '" r="10" fill="#FF6F91" stroke="#A82A4E" stroke-width="2"/><circle cx="' + (p[0] - 12) + '" cy="' + (p[1] + 5) + '" r="9" fill="#FF6F91" stroke="#A82A4E" stroke-width="2"/>'; }).join('') +
        [[60, 60], [150, 40], [250, 70], [330, 50], [210, 130], [100, 150]].map(function (p) { return '<circle class="tw" cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#FFF2A8"/>'; }).join('');
    },
    meadow: function () {
      var k = nid();
      return '<defs><linearGradient id="gM' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD3F4"/><stop offset="1" stop-color="#E3F6FF"/></linearGradient></defs><rect width="400" height="300" fill="url(#gM' + k + ')"/>' +
        '<circle cx="62" cy="58" r="30" fill="#FFD23F" stroke="#E0A100" stroke-width="2"/><ellipse cx="260" cy="60" rx="42" ry="14" fill="#fff"/><ellipse cx="290" cy="50" rx="28" ry="14" fill="#fff"/><ellipse cx="130" cy="95" rx="32" ry="11" fill="#fff"/>' +
        '<path d="M0,180 Q100,140 210,172 T400,160 L400,300 L0,300Z" fill="#7BD389" stroke="#3FA45B" stroke-width="2"/><path d="M0,225 Q140,190 270,225 T400,215 L400,300 L0,300Z" fill="#4FB286" stroke="#2C7A57" stroke-width="2"/>' +
        [[40, 255, '#FF6F91'], [95, 272, '#FFD23F'], [160, 262, '#fff'], [250, 276, '#FF9A5A'], [330, 258, '#9B6FD9'], [375, 280, '#FF6F91']].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + p[2] + '" stroke="#2C7A57" stroke-width="1.5"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="2" fill="#FFD23F"/>'; }).join('');
    },
    cloud: function () {
      var k = nid();
      function cl(x, y, s) { return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')"><ellipse cx="0" cy="0" rx="60" ry="22" fill="#fff"/><circle cx="-28" cy="-14" r="22" fill="#fff"/><circle cx="8" cy="-24" r="28" fill="#fff"/><circle cx="36" cy="-10" r="20" fill="#fff"/></g>'; }
      return '<defs><linearGradient id="gC' + k + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9E4FF"/><stop offset=".55" stop-color="#FFD1E0"/><stop offset="1" stop-color="#FFE9B8"/></linearGradient></defs><rect width="400" height="300" fill="url(#gC' + k + ')"/>' +
        cl(70, 80, .9) + cl(320, 60, .8) + '<g stroke="#D7C6EE" stroke-width="2"><rect x="150" y="120" width="26" height="60" fill="#F4E9FF"/><polygon points="146,120 163,92 180,120" fill="#FF8FB1"/><rect x="224" y="136" width="22" height="44" fill="#F4E9FF"/><polygon points="220,136 235,112 250,136" fill="#6EC1E4"/><rect x="176" y="150" width="48" height="30" fill="#FFF6E0"/></g>' +
        cl(60, 250, 1.5) + cl(200, 270, 1.7) + cl(350, 245, 1.5);
    }
  };

  function glow(color, a) { return '<rect width="400" height="300" fill="' + color + '" opacity="' + a + '"/>'; }
  function sparkleDecor(color, n, seed) {
    var o = '', s = seed || 3;
    function r() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    for (var i = 0; i < n; i++) o += '<polygon class="tw" points="' + starPts(10 + r() * 380, 20 + r() * 250, 6 + r() * 6, 2.5) + '" fill="' + color + '" opacity=".9"/>';
    return o;
  }
  function moon(asleep) {
    return '<g class="moonp"><circle cx="318" cy="72" r="46" fill="#FFF3C4" stroke="#E6C96B" stroke-width="2.5"/><circle cx="318" cy="72" r="58" fill="#FFF3C4" opacity=".25"/>' +
      (asleep ? '<path d="M300,70 Q308,76 316,70 M322,70 Q330,76 338,70" stroke="#5B4A2E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M312,88 Q318,92 324,88" stroke="#8A5A16" stroke-width="3" fill="none" stroke-linecap="round"/><text x="352" y="38" font-family="Baloo,sans-serif" font-weight="800" font-size="22" fill="#fff" opacity=".9">z</text><text x="368" y="22" font-family="Baloo,sans-serif" font-weight="800" font-size="16" fill="#fff" opacity=".8">z</text>'
        : eye(306, 68, 6, 0) + eye(330, 68, 6, 0) + '<path d="M306,84 Q318,98 330,84" stroke="#7A3B2E" stroke-width="3" fill="none" stroke-linecap="round"/>') + '<ellipse cx="296" cy="84" rx="6" ry="4" fill="#FF9FAE" opacity=".6"/><ellipse cx="340" cy="84" rx="6" ry="4" fill="#FF9FAE" opacity=".6"/></g>';
  }
  var RB = ['#FF5A5F', '#FF9A5A', '#FFD23F', '#4FB286', '#6EC1E4', '#9B6FD9'];
  function rainbow(on) {
    var o = '';
    for (var i = 0; i < 6; i++) { var r = 150 - i * 13; o += '<path d="M' + (200 - r) + ',200 A' + r + ',' + r + ' 0 0 1 ' + (200 + r) + ',200" fill="none" stroke="' + (on ? RB[i] : '#CFC8DC') + '" stroke-width="13" opacity="' + (on ? 1 : .8) + '"/>'; }
    return o;
  }
  function basket(full) {
    var b = '<path d="M20,215 L36,262 L96,262 L112,215 Z" fill="#C8894F" stroke="#8B5A2B" stroke-width="2.5"/><path d="M26,228 L106,228 M30,244 L102,244" stroke="#8B5A2B" stroke-width="2"/><path d="M28,215 Q66,170 104,215" fill="none" stroke="#8B5A2B" stroke-width="4"/>';
    if (full) b += [[44, 208], [66, 202], [88, 208], [56, 192], [78, 194]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="#FF6F91" stroke="#A82A4E" stroke-width="2"/>'; }).join('');
    return b;
  }
  function bunting() { var o = '<path d="M0,20 Q200,70 400,20" fill="none" stroke="#7A5AA8" stroke-width="2"/>', c = ['#FF6F91', '#FFD23F', '#6EC1E4', '#4FB286', '#9B6FD9', '#FF9A5A', '#FF6F91', '#FFD23F'], i; for (i = 0; i < 8; i++) { var x = 25 + i * 50, y = 20 + 22 * Math.sin((x / 400) * Math.PI) + 4; o += '<polygon points="' + (x - 13) + ',' + (y - 2) + ' ' + (x + 13) + ',' + (y - 2) + ' ' + x + ',' + (y + 26) + '" fill="' + c[i] + '" stroke="#fff" stroke-width="1.5"/>'; } return o; }
  function ladder() { var o = '', i; for (i = 0; i < 11; i++) o += '<circle class="tw" cx="' + (336 + (i % 2 ? 6 : -6)) + '" cy="' + (222 - i * 18) + '" r="4.5" fill="#FFF2A8"/><circle cx="' + (336 + (i % 2 ? 6 : -6)) + '" cy="' + (222 - i * 18) + '" r="9" fill="#FFF2A8" opacity=".28"/>'; return o; }

  function pageData(S, n) {
    var h = by(HEROES, S.hero), pl = by(PLACES, S.place), f = by(FRIENDS, S.friend), q = by(QUESTS, S.quest), c = by(COLORS, S.color);
    var H = h.en, pEn = pl.pre, fEn = f.en;
    var t = {
      1: { en: 'Once upon a time, ' + pEn + ', there lived ' + H + '.', mr: 'एकदा ' + pl.mp + ' ' + h.mn + ' ' + h.lives + '.' },
      2: { en: 'One day, ' + H + ' met ' + fEn + '. They shook hands and became best friends.', mr: 'एके दिवशी ' + h.md + ' ' + f.mn + ' ' + f.verb + '. दोघं पक्के मित्र झाले.' },
      3: { en: 'Suddenly, ' + q.prob + '! "Oh no!" cried ' + H + '.', mr: 'अचानक ' + q.mprob + '! "अरे बाप रे!" ' + h.mn + ' ' + (h.g === 'f' ? 'म्हणाली' : 'म्हणाला') + '.' },
      4: { en: H + ' closed ' + h.his + ' eyes and made a wish. A ' + c.en.toLowerCase() + ' magic glowed all around!', mr: h.me + ' डोळे मिटले आणि मनातल्या मनात इच्छा केली. सगळीकडे ' + c.mm + ' जादू चमकू लागली!' },
      5: { en: 'Together with ' + fEn + ', ' + H + ' ' + q.act + '.', mr: f.ms + ' मिळून ' + h.me + ' ' + q.mact + '.' },
      6: { en: H + ' felt ' + c.fe + ' all the way down to ' + h.his + ' toes. The End.', mr: h.md + ' ' + c.fm + '. समाप्त.' }
    };
    if (n === 0) return { text: T('The Story of ' + H + ' and ' + q.title, h.mn + ' आणि ' + q.mtitle + ' यांची गोष्ट'), art: 'cover' };
    if (n === 7) return { text: T('The End! You found all the sparkles and finished a story.', 'समाप्त! तुम्ही सगळ्या चमचम शोधल्या आणि एक गोष्ट पूर्ण केली.') };
    return { text: T(t[n].en, t[n].mr) };
  }

  function sceneSvg(S, n, opts) {
    opts = opts || {};
    var hero = S.hero, fr = S.friend, q = S.quest, col = by(COLORS, S.color).hex, inner = BG[S.place](), mood = n === 3 ? 'worried' : (n === 4 ? 'wow' : 'happy');
    var props = '';
    if (q === 'rainbow' && (n === 3 || n === 5 || n === 6 || n === 0)) props += rainbow(n >= 5 || n === 0);
    if (q === 'moon' && n >= 1 || q === 'moon' && n === 0) props += moon(n === 3 || n === 2 || n === 1 || n === 4);
    if (q === 'party' && (n === 3 || n >= 5)) props += basket(n >= 5 || n === 0) + (n >= 5 ? bunting() : '');
    if (q === 'starhome' && n === 3) props += '<g transform="translate(338,226) scale(.55)">' + CHAR.star('worried') + '</g>';
    if (q === 'starhome' && n >= 5) props += ladder() + '<g class="chr fly" transform="translate(336,40) scale(.55)"><g class="bob">' + CHAR.star('happy') + '</g></g>';
    inner += props;
    if (n === 4) inner += '<defs><radialGradient id="gMag' + col.slice(1) + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="' + col + '" stop-opacity=".75"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></radialGradient></defs>' + glow(col, 0.1) + '<ellipse cx="200" cy="170" rx="230" ry="170" fill="url(#gMag' + col.slice(1) + ')"/>' + sparkleDecor(col, 16, 5);
    if (n >= 5 || n === 0) inner += glow(col, 0.06) + sparkleDecor(col, n === 0 ? 8 : 6, 11 + n);
    var A = '';
    if (n === 0) A = chr(hero, 150, 240, 1.15, 'happy') + chr(fr, 260, 240, 0.95, 'happy', true, fr === 'butterfly');
    else if (n === 1) A = chr(hero, 200, 240, 1.45, 'happy');
    else if (n === 2) A = chr(hero, 130, 240, 1.2, 'happy') + chr(fr, 270, 240, 1.15, 'happy', true, fr === 'butterfly');
    else if (n === 3) A = chr(hero, 120, 242, 1.15, mood) + chr(fr, 280, 242, 1.05, mood, true, fr === 'butterfly');
    else if (n === 4) A = chr(hero, 200, 240, 1.45, 'wow') + chr(fr, 330, 245, .85, 'happy', true, fr === 'butterfly');
    else A = chr(hero, 140, 240, 1.2, 'happy') + chr(fr, 260, 240, 1.1, 'happy', true, fr === 'butterfly');
    inner += A;
    return inner;
  }
  function sparklePositions(n) {
    var s = 17 + n * 31;
    function r() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    var pts = [], i;
    for (i = 0; i < 3; i++) { var side = i % 3; var x = side === 0 ? 30 + r() * 90 : side === 1 ? 150 + r() * 100 : 280 + r() * 100; var y = 28 + r() * 90; pts.push([Math.round(x), Math.round(y)]); }
    return pts;
  }

  /* ---------------- state / ui ---------------- */
  var S = { hero: null, place: null, friend: null, quest: null, color: null };
  var step = 0, page = 0, found = {}, totalFound = 0, soundOn = true, autoRead = false;
  var scene = $('storyScene');

  function calm() { return html.classList.contains('calm'); }
  var actx = null;
  function chime(freqs) {
    if (!soundOn || calm()) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var t = actx.currentTime;
      freqs.forEach(function (f, i) { var o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t + i * 0.09); g.gain.exponentialRampToValueAtTime(0.09, t + i * 0.09 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.32); o.connect(g); g.connect(actx.destination); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.35); });
    } catch (e) { /* sound is optional */ }
  }
  function speak(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = mr() ? 'mr-IN' : 'en-IN'; u.rate = 0.88; u.pitch = 1.1;
      var vs = window.speechSynthesis.getVoices(), want = mr() ? 'mr' : 'en', v = vs.filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(want) === 0; })[0];
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* read-aloud is optional */ }
  }

  function chipLabel(key, v) {
    var list = key === 'hero' ? HEROES : key === 'place' ? PLACES : key === 'friend' ? FRIENDS : key === 'quest' ? QUESTS : COLORS, o = by(list, v);
    return key === 'hero' ? nm(o, mr() ? 'mr' : 'en') : key === 'place' ? (mr() ? o.ml : o.label) : key === 'friend' ? (mr() ? o.ml : o.label) : key === 'quest' ? (mr() ? o.ml : o.label) : (mr() ? o.mr : o.en);
  }
  function previewSvg(key, o) {
    if (key === 'hero' || key === 'friend') return '<svg viewBox="-70 -105 140 120" aria-hidden="true">' + CHAR[o.id]('happy') + '</svg>';
    if (key === 'place') return '<svg viewBox="0 0 400 300" aria-hidden="true">' + BG[o.id]() + '</svg>';
    if (key === 'quest') { var pv = o.id === 'rainbow' ? BG.meadow() + rainbow(false) : o.id === 'moon' ? BG.pond() + moon(true) : o.id === 'party' ? BG.forest() + basket(true) : BG.cloud() + '<g transform="translate(200,200) scale(1)">' + CHAR.star('worried') + '</g>'; return '<svg viewBox="0 0 400 300" aria-hidden="true">' + pv + '</svg>'; }
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="' + o.hex + '" stroke="#4A3B6B" stroke-width="3"/><polygon points="' + starPts(50, 50, 22, 9) + '" fill="#fff" opacity=".85"/></svg>';
  }

  function renderStep() {
    var st = STEPS[step], box = $('choices');
    $('stepTitle').textContent = (step + 1) + '/5: ' + T(st.en, st.mr);
    $('stepHelp').textContent = T(st.hEn, st.hMr);
    box.innerHTML = '';
    box.className = 'choices k-' + st.key;
    st.list.forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'choice' + (S[st.key] === o.id ? ' on' : ''); b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', S[st.key] === o.id);
      var label = chipLabel(st.key, o.id);
      b.innerHTML = '<span class="pv">' + previewSvg(st.key, o) + '</span><span class="lb">' + label + '</span>';
      b.addEventListener('click', function () { choose(st.key, o.id, label); });
      box.appendChild(b);
    });
    var dots = ''; for (var i = 0; i < 5; i++) dots += '<i class="' + (i < step ? 'done' : i === step ? 'cur' : '') + '"></i>';
    $('steps').innerHTML = dots;
    $('backStep').style.visibility = step === 0 ? 'hidden' : 'visible';
    var chips = '';
    STEPS.forEach(function (s, i) { if (S[s.key] && i !== step) chips += '<button type="button" class="chip" data-i="' + i + '">' + chipLabel(s.key, S[s.key]) + '</button>'; });
    $('chips').innerHTML = chips;
    Array.prototype.forEach.call($('chips').querySelectorAll('.chip'), function (c) { c.addEventListener('click', function () { step = +c.dataset.i; renderStep(); }); });
    renderStickers();
  }
  function choose(key, id, label) {
    S[key] = id; chime([660, 880]);
    if (autoRead) speak(label);
    var sel = document.querySelector('#choices .choice.on'); if (sel) sel.classList.remove('on');
    var all = document.querySelectorAll('#choices .choice'); STEPS[step].list.forEach(function (o, i) { if (o.id === id) all[i].classList.add('on', 'pop'); });
    setTimeout(function () { if (step < 4) { step++; renderStep(); $('stepTitle').focus({ preventScroll: true }); } else { startBook(); } }, calm() ? 150 : 420);
  }
  function surprise() {
    STEPS.forEach(function (s) { S[s.key] = s.list[Math.floor(Math.random() * s.list.length)].id; });
    chime([523, 659, 784, 1046]); startBook();
  }

  function renderStickers() {
    var got = []; try { got = JSON.parse(store('mb_stickers') || '[]'); } catch (e) { got = []; }
    var items = HEROES.concat(PLACES), box = $('stickers'); box.innerHTML = '';
    items.forEach(function (o) {
      var on = got.indexOf(o.id) >= 0, d = document.createElement('div'); d.className = 'sticker' + (on ? ' on' : '');
      d.innerHTML = (o.id === 'star' || o.id === 'goose' || o.id === 'bunny' || o.id === 'fox') ? '<svg viewBox="-70 -105 140 120" aria-hidden="true">' + CHAR[o.id]('happy') + '</svg>' : '<svg viewBox="0 0 400 300" aria-hidden="true">' + BG[o.id]() + '</svg>';
      d.title = on ? '' : T('Not yet', 'अजून नाही'); d.setAttribute('aria-label', (o.label || o.en) + (on ? '' : ' (locked)'));
      box.appendChild(d);
    });
    $('stickerHelp').textContent = T(got.length + ' of ' + items.length + ' stickers. Finish stories with different heroes and places to collect them all.', items.length + ' पैकी ' + got.length + ' स्टिकर. वेगवेगळे नायक आणि जागा वापरून गोष्टी पूर्ण करा आणि सगळे गोळा करा.');
  }

  function startBook() { page = 0; found = {}; totalFound = 0; $('chooser').hidden = true; $('bookView').hidden = false; renderBook(); $('bookView').scrollIntoView({ behavior: calm() ? 'auto' : 'smooth', block: 'start' }); }
  function leaveBook() { try { window.speechSynthesis.cancel(); } catch (e) { } $('bookView').hidden = true; $('chooser').hidden = false; step = 0; S = { hero: null, place: null, friend: null, quest: null, color: null }; renderStep(); $('chooser').scrollIntoView({ block: 'start' }); }

  function countFound() { var n = 0; for (var k in found) if (found[k]) n++; return n; }
  function renderBook() {
    var d = pageData(S, page), isStory = page >= 1 && page <= 6, isEnd = page === 7;
    var drawn = isEnd ? 6 : page;
    scene.innerHTML = sceneSvg(S, drawn);
    scene.setAttribute('aria-label', d.text);
    // title overlay on cover
    if (page === 0) scene.insertAdjacentHTML('beforeend', '<g class="covertitle"><rect x="20" y="16" width="360" height="64" rx="18" fill="#241B4E" opacity=".82"/><text x="200" y="45" text-anchor="middle" font-family="Baloo,sans-serif" font-weight="800" font-size="19" fill="#FFE9B8">' + esc(T('The Story of', 'गोष्ट')) + '</text><text x="200" y="68" text-anchor="middle" font-family="Baloo,sans-serif" font-weight="800" font-size="' + (mr() ? 17 : 19) + '" fill="#fff">' + esc(mr() ? by(HEROES, S.hero).mn + ' आणि ' + by(QUESTS, S.quest).mtitle : by(HEROES, S.hero).en + ' and ' + by(QUESTS, S.quest).title) + '</text></g>');
    if (isEnd) scene.insertAdjacentHTML('beforeend', '<g class="theend"><rect x="90" y="30" width="220" height="70" rx="22" fill="#fff" opacity=".97"/><text x="200" y="78" text-anchor="middle" font-family="Baloo,sans-serif" font-weight="800" font-size="40" fill="#B8325A">' + esc(T('The End', 'समाप्त')) + '</text></g>');
    // sparkles
    if (isStory) sparklePositions(page).forEach(function (p, i) {
      var key = page + '-' + i, g = el('g', { 'class': 'spark' + (found[key] ? ' got' : ''), tabindex: found[key] ? '-1' : '0', role: 'button', 'aria-label': T('Sparkle', 'चमचम') });
      g.innerHTML = '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="26" fill="transparent"/><polygon points="' + starPts(p[0], p[1], 13, 5.5) + '" fill="#FFE066" stroke="#E0A100" stroke-width="2" stroke-linejoin="round"/>';
      function tap(ev) { ev.preventDefault(); if (found[key]) return; found[key] = 1; totalFound++; g.setAttribute('class', 'spark got'); g.setAttribute('tabindex', '-1'); var c = countFound(); chime([880 + c * 110, 1175]); updateCount(); var here = [0, 1, 2].filter(function (j) { return found[page + '-' + j]; }).length; if (here === 3) toast(T('Hooray! You found all 3 sparkles!', 'वाह! तुम्हाला तिन्ही चमचम सापडल्या!')); }
      g.addEventListener('click', tap); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') tap(e); });
      scene.appendChild(g); if (found[key]) g.setAttribute('class', 'spark got');
    });
    // characters react to taps
    Array.prototype.forEach.call(scene.querySelectorAll('.chr'), function (c) { c.addEventListener('click', function () { c.classList.remove('jump'); void c.getBoundingClientRect(); c.classList.add('jump'); chime([523 + Math.random() * 300, 784]); }); });
    $('storyText').textContent = d.text;
    $('prevBtn').disabled = page === 0; $('nextBtn').style.visibility = isEnd ? 'hidden' : 'visible';
    $('nextBtn').setAttribute('aria-label', T(page === 0 ? 'Open the book' : 'Next page', page === 0 ? 'पुस्तक उघडा' : 'पुढचं पान')); $('prevBtn').setAttribute('aria-label', T('Previous page', 'मागचं पान'));
    $('readLbl').textContent = T('Read to me', 'वाचून दाखवा');
    $('soundLbl').textContent = T(soundOn ? 'Sound on' : 'Sound off', soundOn ? 'आवाज चालू' : 'आवाज बंद'); $('soundBtn').setAttribute('aria-pressed', soundOn);
    $('autoLbl').textContent = T(autoRead ? 'Auto-read on' : 'Auto-read off', autoRead ? 'आपोआप वाचन चालू' : 'आपोआप वाचन बंद'); $('autoBtn').setAttribute('aria-pressed', autoRead);
    var dots = ''; for (var i = 0; i <= 7; i++) dots += '<i class="' + (i === page ? 'cur' : i < page ? 'done' : '') + '"></i>'; $('dots').innerHTML = dots;
    $('endActions').hidden = !isEnd; $('againBtn').textContent = T('Read it again', 'पुन्हा वाचा'); $('newBtn').textContent = T('Make a new story', 'नवी गोष्ट बनवा'); $('printBtn').textContent = T('Print to colour', 'रंगवण्यासाठी छापा');
    $('stickerWin').hidden = !isEnd;
    updateCount();
    if (isEnd) finishStory();
    if (autoRead) speak(d.text);
    $('toast').textContent = '';
  }
  function updateCount() { var total = 18; $('sparkleCount').textContent = (page >= 1 && page <= 6) ? T('Sparkles: ' + countFound() + ' of ' + total, 'चमचम: ' + total + ' पैकी ' + countFound()) : (page === 7 ? T('You found ' + countFound() + ' of ' + total + ' sparkles!', 'तुम्हाला ' + total + ' पैकी ' + countFound() + ' चमचम सापडल्या!') : ''); }
  function toast(t) { var e = $('toast'); e.textContent = t; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show'); setTimeout(function () { e.classList.remove('show'); }, 2200); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var rewarded = false;
  function finishStory() {
    var got = []; try { got = JSON.parse(store('mb_stickers') || '[]'); } catch (e) { got = []; }
    var news = [];
    [S.hero, S.place].forEach(function (id) { if (got.indexOf(id) < 0) { got.push(id); news.push(id); } });
    store('mb_stickers', JSON.stringify(got));
    store('mb_stories', String((parseInt(store('mb_stories') || '0', 10) || 0) + (rewarded ? 0 : 1))); rewarded = true;
    $('stickerWin').innerHTML = news.length ? T('New sticker' + (news.length > 1 ? 's' : '') + ' for your sticker book!', 'तुमच्या स्टिकर पुस्तकासाठी नवीन स्टिकर!') : T('Great story! Try a new hero or place to win a new sticker.', 'छान गोष्ट! नवीन स्टिकर मिळवण्यासाठी नवीन नायक किंवा जागा निवडा.');
    chime([523, 659, 784, 1046, 1318]);
    renderStickers();
  }
  function go(n) { if (n < 0 || n > 7) return; page = n; if (page < 7) rewarded = false; renderBook(); }

  function buildPrint() {
    var a = $('printArea'); a.innerHTML = '';
    for (var n = 0; n <= 6; n++) {
      var d = pageData(S, n), sec = document.createElement('section'); sec.className = 'pp';
      sec.innerHTML = '<svg viewBox="0 0 400 300" aria-hidden="true">' + sceneSvg(S, n) + '</svg><p>' + esc(d.text) + '</p><p class="pfoot">themoonberryhouse.com</p>'; a.appendChild(sec);
    }
  }

  $('backStep').addEventListener('click', function () { if (step > 0) { step--; renderStep(); } });
  $('surprise').addEventListener('click', surprise);
  $('prevBtn').addEventListener('click', function () { go(page - 1); });
  $('nextBtn').addEventListener('click', function () { chime([660]); go(page + 1); });
  $('readBtn').addEventListener('click', function () { speak(pageData(S, page).text); });
  $('soundBtn').addEventListener('click', function () { soundOn = !soundOn; store('mb_sound', soundOn ? '1' : '0'); renderBook(); chime([660, 880]); });
  $('autoBtn').addEventListener('click', function () { autoRead = !autoRead; store('mb_auto', autoRead ? '1' : '0'); renderBook(); });
  $('leaveBook').addEventListener('click', leaveBook); $('newBtn').addEventListener('click', leaveBook);
  $('againBtn').addEventListener('click', function () { found = {}; totalFound = 0; go(0); });
  $('printBtn').addEventListener('click', function () { buildPrint(); document.body.classList.add('print-story'); window.print(); });
  window.addEventListener('afterprint', function () { document.body.classList.remove('print-story'); });
  var tx = null;
  $('bookView').addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  $('bookView').addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 70) go(page + (dx < 0 ? 1 : -1)); }, { passive: true });
  document.addEventListener('keydown', function (e) { if ($('bookView').hidden) return; if (e.target.tagName === 'INPUT') return; if (e.key === 'ArrowRight') go(page + 1); if (e.key === 'ArrowLeft') go(page - 1); });
  new MutationObserver(function () { if ($('bookView').hidden) renderStep(); else renderBook(); }).observe(html, { attributes: true, attributeFilter: ['lang'] });

  soundOn = store('mb_sound') !== '0'; autoRead = store('mb_auto') === '1';
  renderStep();
})();
