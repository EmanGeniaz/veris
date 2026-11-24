/* Global stylesheets imported for their side effects (app/layout.tsx imports
   ./globals.css). TypeScript 6 checks side-effect imports by default
   (noUncheckedSideEffectImports), and Next.js only declares *.module.css, so
   plain .css needs this declaration. CSS modules keep Next's typed
   declaration, which is more specific. */
declare module "*.css";
