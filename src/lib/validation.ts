import * as yup from "yup";

// Mirrors src/utils/validation.ts and src/utils/confirmationCode.ts in
// the backend, field for field. Client-side validation here is a UX
// nicety — the backend independently re-validates everything and stays
// the real source of truth (same principle as the confirmation code
// itself not being a security boundary).

const KENYAN_PHONE_REGEX = /^(?:\+254|254|0)(7|1)\d{8}$/;
const CONFIRMATION_CODE_REGEX = /^REF-DEL-[A-F0-9]{8}-[A-F0-9]{4}$/;

export const loginSchema = yup.object({
  email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;

export const createDeliverySchema = yup.object({
  customerName: yup
    .string()
    .trim()
    .required("Customer name is required")
    .max(120, "Customer name must be 120 characters or fewer"),
  customerPhone: yup
    .string()
    .trim()
    .required("Customer phone is required")
    .matches(
      KENYAN_PHONE_REGEX,
      "Enter a valid Kenyan phone number (e.g. 0712345678 or +254712345678)"
    ),
  address: yup
    .string()
    .trim()
    .required("Delivery address is required")
    .max(500, "Address must be 500 characters or fewer"),
  itemDescription: yup
    .string()
    .trim()
    .required("Item description is required")
    .max(500, "Item description must be 500 characters or fewer"),
});

export type CreateDeliveryFormValues = yup.InferType<typeof createDeliverySchema>;

export const assignDeliverySchema = yup.object({
  riderId: yup.string().required("Choose a rider to assign"),
});

export type AssignDeliveryFormValues = yup.InferType<typeof assignDeliverySchema>;

export const confirmDeliverySchema = yup.object({
  confirmationCode: yup
    .string()
    .trim()
    .uppercase()
    .required("Enter the confirmation code")
    .matches(CONFIRMATION_CODE_REGEX, "That code doesn't look like a Reflex confirmation code"),
});

export type ConfirmDeliveryFormValues = yup.InferType<typeof confirmDeliverySchema>;

export const cancelDeliverySchema = yup.object({
  note: yup.string().trim().max(500, "Note must be 500 characters or fewer").optional(),
});

export type CancelDeliveryFormValues = yup.InferType<typeof cancelDeliverySchema>;
