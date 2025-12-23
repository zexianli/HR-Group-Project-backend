import { z } from 'zod';

// date regex for <input type='date'>
export const DATE_YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;

const WORK_AUTH = ['CITIZEN', 'GREEN_CARD', 'H1B', 'L2', 'F1_CPT_OPT', 'H4', 'OTHER'];
const GENDER = ['MALE', 'FEMALE', 'NO_ANSWER'];

const nonEmpty = (label) => z.string().trim().min(1, `${label} is required`);
const dateStr = (label) => z.string().trim().regex(DATE_YYYY_MM_DD, `${label} must be YYYY-MM-DD`);

// Address: buildingApt optional; others required
const addressSchema = z.object({
  buildingApt: z.string().trim().optional().default(''),
  street: nonEmpty('address.street'),
  city: nonEmpty('address.city'),
  state: nonEmpty('address.state'),
  zip: nonEmpty('address.zip'),
});

// Driver license object (when present, inner fields required)
const driverLicenseSchema = z.object({
  number: nonEmpty('driverLicense.number'),
  expirationDate: dateStr('driverLicense.expirationDate'),
});

export const onboardingSchema = z
  .object({
    // Required basics
    firstName: nonEmpty('firstName'),
    lastName: nonEmpty('lastName'),
    ssn: nonEmpty('ssn'),
    dateOfBirth: dateStr('dateOfBirth'),
    gender: z.enum(GENDER),
    cellPhone: nonEmpty('cellPhone'),
    workAuthorizationType: z.enum(WORK_AUTH),

    // Address (required)
    address: addressSchema,

    // Emergency contacts required (1+)
    emergencyContacts: z
      .array(
        z.object({
          firstName: nonEmpty('emergencyContacts.firstName'),
          lastName: nonEmpty('emergencyContacts.lastName'),
          phone: nonEmpty('emergencyContacts.phone'),
          relationship: nonEmpty('emergencyContacts.relationship'),

          // optional
          middleName: z.string().trim().optional().default(''),
          email: z.string().trim().toLowerCase().optional().default(''),
        })
      )
      .min(1, 'At least one emergency contact is required'),

    // Optional fields (safe defaults)
    middleName: z.string().trim().optional().default(''),
    preferredName: z.string().trim().optional().default(''),
    profilePictureKey: z.string().trim().optional().default(''),
    workPhone: z.string().trim().optional().default(''),

    otherWorkAuthorizationTitle: z.string().trim().optional().default(''),
    workAuthorizationStart: dateStr('workAuthorizationStart').optional().nullable(),
    workAuthorizationEnd: dateStr('workAuthorizationEnd').optional().nullable(),

    driverLicense: driverLicenseSchema.optional(),
    driverLicenseDocKey: z.string().trim().optional().default(''),

    carInformation: z
      .object({
        make: z.string().trim().optional().default(''),
        model: z.string().trim().optional().default(''),
        color: z.string().trim().optional().default(''),
      })
      .optional()
      .default({}),

    reference: z
      .object({
        firstName: z.string().trim().optional().default(''),
        lastName: z.string().trim().optional().default(''),
        middleName: z.string().trim().optional().default(''),
        phone: z.string().trim().optional().default(''),
        email: z.string().trim().toLowerCase().optional().default(''),
        relationship: z.string().trim().optional().default(''),
      })
      .optional()
      .default({}),
  })
  .superRefine((data, ctx) => {
    // Work auth OTHER -> require title
    if (data.workAuthorizationType === 'OTHER' && !data.otherWorkAuthorizationTitle?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['otherWorkAuthorizationTitle'],
        message: 'otherWorkAuthorizationTitle is required when workAuthorizationType is OTHER',
      });
    }

    // Driver license present -> require doc key too
    if (data.driverLicense) {
      if (!data.driverLicenseDocKey?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['driverLicenseDocKey'],
          message: 'driverLicenseDocKey is required when driverLicense is provided',
        });
      }
    }
  });

export function validateOnboarding(req, res, next) {
  try {
    const parsed = onboardingSchema.parse(req.body);
    req.validatedBody = parsed;
    return next();
  } catch (err) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    return next(err);
  }
}
