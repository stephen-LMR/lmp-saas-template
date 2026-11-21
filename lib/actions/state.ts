// What a form action hands back to its form: errors by field, and what was typed so the
// person does not have to type it again. "_form" is a problem with the whole form.
export type FormState = { errors: Record<string, string>; values: Record<string, string>; done?: string } | null;

export function typed(form: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map(k => [k, typeof form.get(k) === "string" ? (form.get(k) as string) : ""]));
}
