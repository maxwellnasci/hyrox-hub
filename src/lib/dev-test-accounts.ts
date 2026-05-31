export type DevTestRole = "student" | "admin";

/** Fixed demo accounts — only used when import.meta.env.DEV is true. */
export const DEV_TEST_ACCOUNTS = {
  student: {
    email: "aluno.demo@hyrox-hub.test",
    password: "HyroxDemo2026!",
    label: "Login aluno (demo)",
  },
  admin: {
    email: "coach.demo@hyrox-hub.test",
    password: "HyroxDemo2026!",
    label: "Login admin (demo)",
  },
} as const satisfies Record<DevTestRole, { email: string; password: string; label: string }>;
