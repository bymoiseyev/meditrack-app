import { useState } from 'react';

// ── Icons ────────────────────────────────────────────────────────────────────

function IconPill() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07Z"/>
      <line x1="8.5" y1="11.5" x2="15.5" y2="4.5"/>
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="4" x2="20" y2="20"/>
      <line x1="20" y1="4" x2="4" y2="20"/>
    </svg>
  );
}

// ── Nav item data ─────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Läkemedel',   icon: <IconPill />,      active: true  },
  { label: 'Beställningar', icon: <IconClipboard />, active: false },
];

// ── Sidebar content (shared between desktop and mobile drawer) ────────────────

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">

      {/* Top — logo + close button (close only shown on mobile) */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          {/* Logo square */}
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900 tracking-tight">MediTrack</div>
            <div className="text-[11px] text-slate-400 font-medium">Healthcare inventory</div>
          </div>
        </div>

        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-100 mb-3" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-2 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              item.active
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className={item.active ? 'text-white' : 'text-slate-400'}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer info card */}
      <div className="mx-3 mb-4 mt-3">
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            MediTrack – internal medication and order management.
          </p>
        </div>
      </div>

    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-[268px] flex-shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200">
        <SidebarContent />
      </aside>

      {/* ── MOBILE TOP BAR (below lg) ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center gap-3 bg-white border-b border-slate-200 px-4 h-14">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <IconMenu />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-900">MediTrack</span>
        </div>
      </header>

      {/* ── MOBILE OVERLAY ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)' }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-[268px] bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
