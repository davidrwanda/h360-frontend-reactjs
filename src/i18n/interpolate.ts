/**
 * Replace {{variable}} placeholders with provided values.
 * interpolate("Hello {{name}}", { name: "David" }) => "Hello David"
 */
export function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`,
  );
}
