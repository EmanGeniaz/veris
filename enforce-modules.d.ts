/* Ambient declarations for the pure-JS enforcement-plane engines (Veris
   Enforce) so the TypeScript gateway route can import them while `allowJs`
   stays off. These modules are plain JavaScript, consumed by the .jsx surfaces
   and — for real runtime decisions — by app/api/gateway/chat/route.ts. Typed
   loosely on purpose: the engines are the source of truth, not these stubs. */
declare module "@/lib/enforce";
declare module "@/lib/egress";
declare module "@/lib/hitl";
declare module "@/lib/mcp-registry";
declare module "@/lib/memory";
