# Custom code

Merchant-specific code lives here: custom entities and glue code the spec asks for.
Everything outside this folder, `tests/acceptance/`, `content/help/`, and
`supabase/migrations/custom_*.sql` is the template and is read-only for the build agent.
Use only components from `components/ui` and patterns from `patterns`.

`images.json` holds the merchant's own photos for the hero, services, gallery, and about slots.
Every photo needs alt text. See "Merchant photos" in the main README.
