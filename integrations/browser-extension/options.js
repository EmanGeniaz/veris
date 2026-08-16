const DEFAULTS = { endpoint: "https://demo.veriszone.ai/api/policy/inspect", key: "", actor: "", failClosed: false };
const $ = (id) => document.getElementById(id);

chrome.storage.sync.get(DEFAULTS).then((s) => {
  $("endpoint").value = s.endpoint;
  $("key").value = s.key;
  $("actor").value = s.actor;
  $("failClosed").checked = !!s.failClosed;
});

$("save").addEventListener("click", async () => {
  await chrome.storage.sync.set({
    endpoint: $("endpoint").value.trim(),
    key: $("key").value.trim(),
    actor: $("actor").value.trim(),
    failClosed: $("failClosed").checked,
  });
  const ok = $("ok"); ok.style.display = "inline"; setTimeout(() => (ok.style.display = "none"), 1500);
});
