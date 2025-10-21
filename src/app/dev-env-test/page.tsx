// src/app/dev-env-test/page.tsx
export default function DevEnvTest() {
  return (
    <pre>
      Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ?? "undefined"}
      {"\n"}
      Supabase Key:{" "}
      {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Defined" : "undefined"}
    </pre>
  );
}
