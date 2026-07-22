/* Client persistence adapter. localStorage stays the synchronous read
   path the components already use; when the database is configured the
   same records mirror to the API and hydrate back on entry. */
const STORE_OF = { "vz-gw-evidence": "evidence", "vz-my-ideas": "ideas", "vz-ac-decisions": "decisions" };

export function readBus(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

export function writeBus(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* ignore */ }
}

export function pushBus(key, record, cap = 40) {
  const list = readBus(key);
  list.unshift(record);
  writeBus(key, list.slice(0, cap));
  const store = STORE_OF[key];
  if (store) {
    try { fetch(`/api/bus/${store}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) }).catch(() => {}); }
    catch { /* offline or unavailable - localStorage already has it */ }
  }
}

/* On entry: if the database is live, its rows become the local truth. */
export async function hydrateBus() {
  for (const [key, store] of Object.entries(STORE_OF)) {
    try {
      const res = await fetch(`/api/bus/${store}`);
      const data = await res.json();
      if (data && data.enabled && Array.isArray(data.rows) && data.rows.length) {
        const mapped = store === "evidence"
          ? data.rows.map(r => ({ item: r.item, initiative: r.initiative, scope: r.scope, control: r.control, risk: r.risk, owner: r.owner, status: r.status, approval: r.approval, version: r.version, time: new Date(r.createdAt).toLocaleDateString() }))
          : data.rows;
        writeBus(key, mapped.slice(0, 40));
      }
    } catch { /* fallback mode */ }
  }
}
