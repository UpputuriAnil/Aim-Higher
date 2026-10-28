import React from 'react';

export const StudentIllustration = () => (
  <svg viewBox="0 0 500 400" className="w-100" style={{ maxWidth: '420px', height: 'auto', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }}>
    <defs>
      <linearGradient id="deskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4338ca" />
        <stop offset="100%" stopColor="#312e81" />
      </linearGradient>
      <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e0e7ff" />
        <stop offset="100%" stopColor="#c7d2fe" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
      </linearGradient>
    </defs>

    {/* Background Decorative Circles & Aura */}
    <circle cx="250" cy="200" r="150" fill="url(#glowGrad)" />
    <circle cx="380" cy="90" r="18" fill="#38bdf8" opacity="0.3" />
    <circle cx="100" cy="140" r="10" fill="#a855f7" opacity="0.4" />
    <circle cx="420" cy="240" r="8" fill="#f43f5e" opacity="0.4" />

    {/* Floating Elements (Books, Stars, Lightbulb) */}
    {/* Floating Book 1 */}
    <g transform="translate(70, 80) rotate(-12)">
      <rect x="0" y="0" width="48" height="34" rx="4" fill="#3b82f6" />
      <rect x="3" y="3" width="42" height="28" rx="2" fill="#60a5fa" />
      <line x1="8" y1="12" x2="38" y2="12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="20" x2="28" y2="20" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
    </g>

    {/* Floating Academic Cap */}
    <g transform="translate(360, 60) rotate(15)">
      <polygon points="25,5 50,18 25,30 0,18" fill="#1e1b4b" />
      <polygon points="25,7 46,18 25,28 4,18" fill="#4338ca" />
      <rect x="13" y="24" width="24" height="10" rx="3" fill="#1e1b4b" />
      <path d="M 45 20 Q 52 28 48 38" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="48" cy="40" r="3" fill="#f59e0b" />
    </g>

    {/* Desk Surface */}
    <ellipse cx="250" cy="330" rx="190" ry="24" fill="#1e293b" opacity="0.25" />
    <path d="M 80 320 Q 250 310 420 320 L 400 338 Q 250 330 100 338 Z" fill="url(#deskGrad)" />

    {/* Books Stack on Desk */}
    <g transform="translate(310, 270)">
      <rect x="0" y="32" width="65" height="14" rx="3" fill="#0ea5e9" />
      <rect x="5" y="18" width="55" height="14" rx="3" fill="#f59e0b" />
      <rect x="10" y="4" width="48" height="14" rx="3" fill="#10b981" />
      <line x1="8" y1="39" x2="58" y2="39" stroke="#bae6fd" strokeWidth="1.5" />
      <line x1="12" y1="25" x2="52" y2="25" stroke="#fde68a" strokeWidth="1.5" />
      <line x1="16" y1="11" x2="50" y2="11" stroke="#a7f3d0" strokeWidth="1.5" />
    </g>

    {/* Student Character */}
    {/* Body / Hoodie */}
    <path d="M 175 320 C 175 240, 235 240, 235 320 Z" fill="#4f46e5" />
    <path d="M 195 242 C 205 255, 215 255, 220 242 Z" fill="#6366f1" />

    {/* Head & Hair */}
    <ellipse cx="205" cy="205" rx="26" ry="30" fill="#fbcfe8" />
    {/* Modern Haircut */}
    <path d="M 178 198 C 176 168, 230 162, 232 195 C 220 180, 195 180, 185 198 Z" fill="#1e293b" />
    <path d="M 178 198 C 182 215, 180 220, 178 225 C 174 210, 175 202, 178 198 Z" fill="#1e293b" />

    {/* Glasses */}
    <circle cx="198" cy="205" r="7" fill="none" stroke="#0284c7" strokeWidth="2.5" />
    <circle cx="216" cy="205" r="7" fill="none" stroke="#0284c7" strokeWidth="2.5" />
    <line x1="205" y1="205" x2="209" y2="205" stroke="#0284c7" strokeWidth="2" />
    <path d="M 203 220 Q 208 225 213 220" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />

    {/* Laptop */}
    <g transform="translate(195, 260)">
      {/* Base */}
      <polygon points="10,48 105,48 95,58 20,58" fill="#94a3b8" />
      {/* Screen */}
      <rect x="25" y="8" width="70" height="42" rx="4" fill="#334155" />
      <rect x="28" y="11" width="64" height="36" rx="2" fill="url(#laptopGrad)" />
      {/* Screen UI mock (lines & chart) */}
      <line x1="33" y1="18" x2="55" y2="18" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <line x1="33" y1="24" x2="48" y2="24" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 60 38 L 68 28 L 76 33 L 86 20" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Coffee Mug */}
    <g transform="translate(140, 290)">
      <rect x="0" y="6" width="18" height="22" rx="4" fill="#f43f5e" />
      <path d="M 18 10 C 24 10, 24 20, 18 22" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
      <path d="M 5 2 Q 7 -3 9 2" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Floating Badge / "A+" */}
    <g transform="translate(100, 190)">
      <circle cx="20" cy="20" r="22" fill="#10b981" />
      <circle cx="20" cy="20" r="18" fill="#059669" />
      <text x="20" y="27" fontSize="18" fontWeight="bold" fill="#ffffff" textAnchor="middle" fontFamily="Inter, sans-serif">A+</text>
    </g>
  </svg>
);

export const TeacherIllustration = () => (
  <svg viewBox="0 0 500 400" className="w-100" style={{ maxWidth: '420px', height: 'auto', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15))' }}>
    <defs>
      <linearGradient id="teacherBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#064e3b" />
        <stop offset="100%" stopColor="#022c22" />
      </linearGradient>
    </defs>

    {/* Background Glow */}
    <circle cx="250" cy="200" r="150" fill="url(#teacherBgGrad)" />
    <circle cx="100" cy="90" r="14" fill="#38bdf8" opacity="0.3" />
    <circle cx="410" cy="120" r="12" fill="#f59e0b" opacity="0.3" />

    {/* Digital Presentation Board */}
    <g transform="translate(180, 70)">
      <rect x="0" y="0" width="220" height="150" rx="10" fill="#1e293b" />
      <rect x="6" y="6" width="208" height="138" rx="8" fill="url(#boardGrad)" stroke="#10b981" strokeWidth="1.5" />
      
      {/* Board Content (Analytics, Graph, Math) */}
      <text x="20" y="32" fill="#a7f3d0" fontSize="13" fontWeight="bold" fontFamily="Inter, sans-serif">Aim Higher Class #104</text>
      <line x1="20" y1="40" x2="190" y2="40" stroke="#047857" strokeWidth="1.5" />
      
      {/* Bars Chart */}
      <rect x="25" y="85" width="16" height="35" rx="3" fill="#38bdf8" />
      <rect x="50" y="65" width="16" height="55" rx="3" fill="#34d399" />
      <rect x="75" y="50" width="16" height="70" rx="3" fill="#fbbf24" />
      <rect x="100" y="75" width="16" height="45" rx="3" fill="#f43f5e" />

      {/* Target icon */}
      <circle cx="160" cy="80" r="22" fill="#047857" />
      <circle cx="160" cy="80" r="15" fill="#065f46" />
      <circle cx="160" cy="80" r="7" fill="#34d399" />
    </g>

    {/* Teacher Character */}
    {/* Body & Blazer */}
    <path d="M 110 350 C 110 250, 190 250, 190 350 Z" fill="#0f172a" />
    <polygon points="140,250 160,250 150,285" fill="#f8fafc" />
    <polygon points="147,260 153,260 150,300" fill="#0ea5e9" />

    {/* Head & Hair */}
    <ellipse cx="150" cy="195" rx="26" ry="30" fill="#fed7aa" />
    <path d="M 124 190 C 122 155, 178 150, 180 185 C 168 170, 140 170, 130 190 Z" fill="#78350f" />
    
    {/* Glasses */}
    <circle cx="142" cy="195" r="7" fill="none" stroke="#0284c7" strokeWidth="2.5" />
    <circle cx="160" cy="195" r="7" fill="none" stroke="#0284c7" strokeWidth="2.5" />
    <line x1="149" y1="195" x2="153" y2="195" stroke="#0284c7" strokeWidth="2" />
    <path d="M 146 210 Q 151 216 156 210" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />

    {/* Teacher Pointer / Arm */}
    <path d="M 180 270 Q 220 220 250 160" fill="none" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
    <circle cx="250" cy="160" r="6" fill="#fed7aa" />
    <line x1="250" y1="160" x2="280" y2="120" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
    
    {/* Floor / Platform */}
    <ellipse cx="250" cy="355" rx="190" ry="22" fill="#0f172a" opacity="0.25" />
  </svg>
);
