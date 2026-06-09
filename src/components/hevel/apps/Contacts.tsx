import React, { useMemo, useRef, useState } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

interface Contact {
  id: string;
  name: string;
  handle: string;
  hue: number;
  phone?: string;
  email?: string;
  note?: string;
  city?: string;
  /** prose-style relationship line */
  relation?: string;
  lastSeen?: string;
  favorite?: boolean;
}

const CONTACTS: Contact[] = [
  { id: "a1", name: "Anders Holm", handle: "@anders.h", hue: 260, phone: "+46 70 421 18 02", email: "anders@studiohov.se", city: "stockholm", relation: "writes with you on the chapter drafts.", lastSeen: "monday", favorite: true },
  { id: "d1", name: "dad", handle: "+46 70 ··· 04", hue: 60, phone: "+46 70 113 22 04", city: "uppsala", relation: "calls on sundays. makes pie.", lastSeen: "tuesday", favorite: true },
  { id: "e1", name: "Elin", handle: "@elin.b", hue: 340, phone: "+46 73 200 91 11", email: "elin@bokform.se", city: "malmö", relation: "designed the first havel mark.", lastSeen: "3 weeks ago" },
  { id: "i1", name: "Ines", handle: "@ines.m", hue: 12, phone: "+46 76 998 04 41", email: "ines.m@studiohov.se", city: "stockholm", relation: "runs the studio. answers fast.", lastSeen: "yesterday" },
  { id: "j1", name: "Jonas", handle: "@jonas", hue: 200, phone: "+46 70 882 14 90", email: "jonas@gmail.com", city: "göteborg", relation: "walks with you at golden hour.", lastSeen: "18m", favorite: true },
  { id: "l1", name: "linnea", handle: "+46 70 ··· 21", hue: 320, phone: "+46 70 411 88 21", city: "berlin", relation: "sends packages from elsewhere.", lastSeen: "2h" },
  { id: "m1", name: "Mira", handle: "@mira.signal", hue: 28, phone: "+46 70 612 33 18", email: "mira@hov.io", city: "stockholm", relation: "tests every launcher build before anyone.", lastSeen: "just now", favorite: true },
  { id: "m2", name: "mum", handle: "+46 70 ··· 03", hue: 80, phone: "+46 70 113 22 03", city: "uppsala", relation: "always picks up. asks about food.", lastSeen: "sunday" },
  { id: "o1", name: "Oskar", handle: "@oskarw", hue: 220, phone: "+46 73 044 21 80", email: "o@oskarw.com", city: "oslo", relation: "trades book recommendations in the margins.", lastSeen: "last week" },
  { id: "s1", name: "Sofia", handle: "@sofiaeklund", hue: 300, phone: "+46 70 555 12 04", email: "sofia.eklund@regeringen.se", city: "stockholm", relation: "you owe her a coffee.", lastSeen: "10 days ago" },
  { id: "t1", name: "Tova", handle: "@tova", hue: 160, phone: "+46 76 220 91 30", city: "stockholm", relation: "vet for the cat.", lastSeen: "april" },
  { id: "v1", name: "Viktor", handle: "@viktor.k", hue: 180, phone: "+46 70 332 14 77", email: "viktor@kollektiv.se", city: "stockholm", relation: "plays bass on tuesdays.", lastSeen: "last tuesday" },
];

const Avatar: React.FC<{ name: string; hue: number; size?: number }> = ({ name, hue, size = 34 }) => (
  <div
    className="flex items-center justify-center font-serif"
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      background: `linear-gradient(135deg, hsl(${hue} 35% 30%), hsl(${(hue + 40) % 360} 25% 18%))`,
      color: "hsl(var(--foreground) / 0.85)",
      fontSize: size * 0.42,
      border: "1px solid hsl(var(--border) / 0.4)",
      flexShrink: 0,
    }}
  >
    {name.trim().charAt(0).toUpperCase()}
  </div>
);

export const Contacts: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [favs, setFavs] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CONTACTS.filter((c) => c.favorite).map((c) => [c.id, true])),
  );

  const active = useMemo(() => CONTACTS.find((c) => c.id === activeId) || null, [activeId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? CONTACTS.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.handle.toLowerCase().includes(q) ||
            (c.city || "").toLowerCase().includes(q) ||
            (c.relation || "").toLowerCase().includes(q),
        )
      : CONTACTS;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  const grouped = useMemo(() => {
    const m: Record<string, Contact[]> = {};
    filtered.forEach((c) => {
      const l = c.name.trim().charAt(0).toUpperCase();
      if (!m[l]) m[l] = [];
      m[l].push(c);
    });
    return m;
  }, [filtered]);

  return (
    <AppScreen appName="contacts" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      {active ? (
        <DetailView
          contact={active}
          isFav={!!favs[active.id]}
          onToggleFav={() =>
            setFavs((f) => ({ ...f, [active.id]: !f[active.id] }))
          }
          onBack={() => setActiveId(null)}
        />
      ) : (
        <ListView
          grouped={grouped}
          favs={favs}
          query={query}
          setQuery={setQuery}
          onOpen={setActiveId}
        />
      )}
    </AppScreen>
  );
};

// ── List ────────────────────────────────────────────────────────────────────

const ListView: React.FC<{
  grouped: Record<string, Contact[]>;
  favs: Record<string, boolean>;
  query: string;
  setQuery: (v: string) => void;
  onOpen: (id: string) => void;
}> = ({ grouped, favs, query, setQuery, onOpen }) => {
  const letters = Object.keys(grouped).sort();
  const total = Object.values(grouped).reduce((acc, l) => acc + l.length, 0);
  const favList = Object.values(grouped)
    .flat()
    .filter((c) => favs[c.id]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ touchAction: "auto" }}>
      <div className="px-6 pt-2 pb-3">
        <p
          className="font-serif"
          style={{ fontSize: 22, lineHeight: 1.25, color: "hsl(var(--foreground) / 0.92)" }}
        >
          {total} people{" "}
          <span className="italic" style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>
            you've been keeping.
          </span>
        </p>
      </div>

      <div className="px-6 pb-3">
        <div className="flex items-center" style={{ borderBottom: "1px solid hsl(var(--border) / 0.4)", paddingBottom: 6 }}>
          <span
            className="font-serif italic"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.5)", marginRight: 8 }}
          >
            find
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="a name, a city, a thread…"
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent outline-none font-serif"
            style={{ fontSize: 14, color: "hsl(var(--foreground) / 0.9)" }}
          />
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-3 pb-4"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Favorites strip */}
        {!query && favList.length > 0 && (
          <div className="px-3 pb-3 pt-1">
            <p
              className="font-serif italic"
              style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.5)", marginBottom: 6, letterSpacing: "0.06em" }}
            >
              close to you
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {favList.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpen(c.id)}
                  className="flex flex-col items-center gap-1.5"
                  style={{ minWidth: 52 }}
                >
                  <Avatar name={c.name} hue={c.hue} size={44} />
                  <span
                    className="font-serif truncate"
                    style={{ fontSize: 11, color: "hsl(var(--foreground) / 0.8)", maxWidth: 64 }}
                  >
                    {c.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {letters.map((l) => (
          <div key={l} className="mb-1">
            <div className="px-3 pt-3 pb-1">
              <span
                className="font-serif italic"
                style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.45)", letterSpacing: "0.1em" }}
              >
                {l.toLowerCase()}
              </span>
            </div>
            {grouped[l].map((c) => (
              <button
                key={c.id}
                onClick={() => onOpen(c.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md"
              >
                <Avatar name={c.name} hue={c.hue} />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-serif truncate"
                    style={{ fontSize: 15, color: "hsl(var(--foreground) / 0.92)" }}
                  >
                    {c.name}
                    {favs[c.id] && (
                      <span style={{ color: "hsl(var(--primary) / 0.7)", marginLeft: 6, fontSize: 10 }}>
                        ★
                      </span>
                    )}
                  </p>
                  <p
                    className="font-serif italic truncate"
                    style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.55)" }}
                  >
                    {c.city ? `${c.city} · ` : ""}{c.handle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ))}

        {letters.length === 0 && (
          <p
            className="font-serif italic text-center py-12"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.5)" }}
          >
            no one by that name.
          </p>
        )}
      </div>
    </div>
  );
};

// ── Detail ────────────────────────────────────────────────────────────────────

const DetailView: React.FC<{
  contact: Contact;
  isFav: boolean;
  onToggleFav: () => void;
  onBack: () => void;
}> = ({ contact, isFav, onToggleFav, onBack }) => {
  const Field: React.FC<{ label: string; value?: string; action?: string }> = ({ label, value, action }) => {
    if (!value) return null;
    return (
      <div className="px-6 py-3" style={{ borderBottom: "1px solid hsl(var(--border) / 0.25)" }}>
        <p
          className="font-serif italic"
          style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.5)", letterSpacing: "0.06em", marginBottom: 3 }}
        >
          {label}
        </p>
        <p
          className="font-serif"
          style={{ fontSize: 15, color: "hsl(var(--foreground) / 0.9)", lineHeight: 1.4 }}
        >
          {value}
          {action && (
            <span
              className="italic"
              style={{ fontSize: 12, color: "hsl(var(--primary) / 0.85)", marginLeft: 10 }}
            >
              {action}
            </span>
          )}
        </p>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ touchAction: "auto" }}>
      <div
        className="px-5 pb-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}
      >
        <button
          onClick={onBack}
          onPointerDown={(e) => e.stopPropagation()}
          className="font-serif italic"
          style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.7)" }}
        >
          ‹ back
        </button>
        <div className="flex-1" />
        <button
          onClick={onToggleFav}
          onPointerDown={(e) => e.stopPropagation()}
          className="font-serif italic"
          style={{
            fontSize: 13,
            color: isFav ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.6)",
          }}
        >
          {isFav ? "★ close" : "☆ keep close"}
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="flex flex-col items-center px-6 pt-6 pb-5">
          <Avatar name={contact.name} hue={contact.hue} size={88} />
          <p
            className="font-serif"
            style={{ fontSize: 24, color: "hsl(var(--foreground) / 0.95)", marginTop: 14 }}
          >
            {contact.name}
          </p>
          <p
            className="font-serif italic"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.6)", marginTop: 2 }}
          >
            {contact.handle}
          </p>
          {contact.relation && (
            <p
              className="font-serif italic text-center"
              style={{
                fontSize: 14,
                color: "hsl(var(--foreground) / 0.7)",
                marginTop: 14,
                lineHeight: 1.5,
                maxWidth: 280,
              }}
            >
              “{contact.relation}”
            </p>
          )}
          {contact.lastSeen && (
            <p
              className="font-serif italic"
              style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.45)", marginTop: 10, letterSpacing: "0.05em" }}
            >
              last spoke {contact.lastSeen}
            </p>
          )}
        </div>

        {/* Quick prose actions */}
        <div
          className="px-6 py-3"
          style={{
            borderTop: "1px solid hsl(var(--border) / 0.3)",
            borderBottom: "1px solid hsl(var(--border) / 0.3)",
          }}
        >
          <p
            className="font-serif"
            style={{ fontSize: 14, lineHeight: 1.6, color: "hsl(var(--foreground) / 0.75)" }}
          >
            you could{" "}
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>call</span>
            ,{" "}
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>message</span>
            , or just{" "}
            <span className="italic" style={{ color: "hsl(var(--primary))" }}>say hello</span>
            .
          </p>
        </div>

        <Field label="phone" value={contact.phone} action="call" />
        <Field label="email" value={contact.email} action="write" />
        <Field label="city" value={contact.city} />
        {contact.note && <Field label="note" value={contact.note} />}

        <div className="px-6 py-6">
          <p
            className="font-serif italic text-center"
            style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.35)", letterSpacing: "0.08em" }}
          >
            kept since 2024
          </p>
        </div>
      </div>
    </div>
  );
};
