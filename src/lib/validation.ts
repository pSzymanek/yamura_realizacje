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

export const customerProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Podaj imię i nazwisko.").max(120),
  phone: z.string().trim().max(40, "Numer telefonu jest za długi."),
  addressLine1: z.string().trim().max(180, "Adres jest za długi."),
  addressLine2: z.string().trim().max(180, "Adres jest za długi."),
  postalCode: z.string().trim().max(20, "Kod pocztowy jest za długi."),
  city: z.string().trim().max(100, "Nazwa miejscowości jest za długa."),
});

export const projectSchema = z
  .object({
    orderNumber: z
      .string()
      .trim()
      .min(1, "Podaj numer projektu.")
      .max(80, "Numer może mieć maksymalnie 80 znaków."),
    title: z
      .string()
      .trim()
      .min(1, "Podaj nazwę projektu.")
      .max(160, "Nazwa może mieć maksymalnie 160 znaków."),
    isInternal: z
      .union([z.boolean(), z.string()])
      .transform((val) => val === true || val === "true" || val === "1" || val === "on")
      .optional()
      .default(false),
    customerName: z
      .string()
      .trim()
      .max(160, "Nazwa klienta może mieć maksymalnie 160 znaków.")
      .optional()
      .default(""),
    customerEmail: z
      .string()
      .trim()
      .max(254)
      .optional()
      .default(""),
    customerUserId: z
      .string()
      .trim()
      .optional()
      .default(""),
    status: z.enum(STATUS_VALUES),
  })
  .superRefine((data, ctx) => {
    if (!data.isInternal) {
      if (!data.customerName || data.customerName.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Podaj klienta.",
          path: ["customerName"],
        });
      }
      if (!data.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Podaj poprawny adres email klienta.",
          path: ["customerEmail"],
        });
      }
    }
  });

export const projectDetailsSchema = z
  .object({
    projectId: z.uuid(),
    orderNumber: z
      .string()
      .trim()
      .min(1, "Podaj numer projektu.")
      .max(80, "Numer może mieć maksymalnie 80 znaków."),
    title: z
      .string()
      .trim()
      .min(1, "Podaj nazwę projektu.")
      .max(160, "Nazwa może mieć maksymalnie 160 znaków."),
    isInternal: z
      .union([z.boolean(), z.string()])
      .transform((val) => val === true || val === "true" || val === "1" || val === "on")
      .optional()
      .default(false),
    customerName: z
      .string()
      .trim()
      .max(160, "Nazwa klienta może mieć maksymalnie 160 znaków.")
      .optional()
      .default(""),
    customerEmail: z
      .string()
      .trim()
      .max(254)
      .optional()
      .default(""),
    status: z.enum(STATUS_VALUES),
    nextStep: z
      .string()
      .trim()
      .max(300, "Następny krok może mieć maksymalnie 300 znaków."),
    nextStepDate: optionalDate,
  })
  .superRefine((data, ctx) => {
    if (!data.isInternal) {
      if (!data.customerName || data.customerName.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Podaj klienta.",
          path: ["customerName"],
        });
      }
      if (!data.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Podaj poprawny adres email klienta.",
          path: ["customerEmail"],
        });
      }
    }
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
  stage: z.string().trim().optional().transform((v) => v || null),
  eventDate: optionalDate,
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
