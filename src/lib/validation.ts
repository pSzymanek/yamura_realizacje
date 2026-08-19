import { z } from "zod";

import { STATUS_VALUES } from "@/lib/statuses";

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Podaj poprawną datę.",
  )
  .transform((value) => value || null);

export const loginSchema = z.object({
  email: z.email("Podaj poprawny adres email."),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków."),
});

export const projectSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(1, "Podaj numer zamówienia.")
    .max(80, "Numer może mieć maksymalnie 80 znaków."),
  title: z
    .string()
    .trim()
    .min(1, "Podaj nazwę realizacji.")
    .max(160, "Nazwa może mieć maksymalnie 160 znaków."),
  customerName: z
    .string()
    .trim()
    .min(1, "Podaj klienta.")
    .max(160, "Nazwa klienta może mieć maksymalnie 160 znaków."),
  customerEmail: z.email("Podaj poprawny adres email klienta."),
  status: z.enum(STATUS_VALUES),
});

export const projectDetailsSchema = projectSchema.extend({
  projectId: z.uuid(),
  nextStep: z
    .string()
    .trim()
    .max(300, "Następny krok może mieć maksymalnie 300 znaków."),
  nextStepDate: optionalDate,
});

export const updateSchema = z.object({
  projectId: z.uuid(),
  title: z
    .string()
    .trim()
    .min(1, "Podaj tytuł aktualizacji.")
    .max(160, "Tytuł może mieć maksymalnie 160 znaków."),
  description: z
    .string()
    .trim()
    .min(1, "Dodaj opis aktualizacji.")
    .max(5000, "Opis może mieć maksymalnie 5000 znaków."),
  status: z
    .union([z.enum(STATUS_VALUES), z.literal("")])
    .transform((value) => value || null),
  nextStep: z
    .string()
    .trim()
    .max(300, "Następny krok może mieć maksymalnie 300 znaków."),
  nextStepDate: optionalDate,
});

export const MAX_PHOTO_COUNT = 4;
export const MAX_PHOTO_SIZE = 6 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
