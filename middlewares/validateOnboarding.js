import { z } from 'zod';

// date regex for <input type='date'>
export const DATE_YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;
const SSN_PATTERN = /^\d{3}-\d{2}-\d{4}$/;

const WORK_AUTH = ['CITIZEN', 'GREEN_CARD', 'H1B', 'L2', 'F1_CPT_OPT', 'H4', 'OTHER'];
const GENDER = ['MALE', 'FEMALE', 'NO_ANSWER'];

const nonEmpty = (label) => z.string().trim().min(1, `${label} is required`);

const dateStr = (label) =>
  z
    .string()
    .trim()
    .regex(DATE_YYYY_MM_DD, `${label} must be YYYY-MM-DD`)
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: `${label} must be a valid date` }
    );

const dateOfBirthStr = dateStr('dateOfBirth').refine((val) => new Date(val) < new Date(), {
  message: 'dateOfBirth must be in the past',
});

const ssnStr = z.string().trim().regex(SSN_PATTERN, 'SSN must be in format XXX-XX-XXXX');

const phoneStr = (label) =>
  z
    .string()
    .trim()
    .length(10, `${label} must be exactly 10 digits`)
    .refine((val) => !isNaN(Number(val)), {
      message: `${label} must contain only digits`,
    });

const zipStr = z
  .string()
  .trim()
  .length(5, 'ZIP code must be 5 digits')
  .refine((val) => !isNaN(Number(val)), {
    message: 'ZIP code must contain only digits',
  });

const optionalEmailStr = () =>
  z.union([z.literal(''), z.string().trim().toLowerCase().email()]).default('');

// Address: buildingApt optional; others required
const addressSchema = z.object({
  buildingApt: z.string().trim().optional().default(''),
  street: nonEmpty('address.street'),
  city: nonEmpty('address.city'),
  state: nonEmpty('address.state'),
  zip: zipStr,
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
    ssn: ssnStr,
    dateOfBirth: dateOfBirthStr,
    gender: z.enum(GENDER),
    cellPhone: phoneStr('cellPhone'),
    workAuthorizationType: z.enum(WORK_AUTH),

    // Address (required)
    address: addressSchema,

    // Emergency contacts required (1+)
    emergencyContacts: z
      .array(
        z.object({
          firstName: nonEmpty('emergencyContacts.firstName'),
          lastName: nonEmpty('emergencyContacts.lastName'),
          phone: phoneStr('emergencyContacts.phone'),
          relationship: nonEmpty('emergencyContacts.relationship'),

          // optional
          middleName: z.string().trim().optional().default(''),
          email: optionalEmailStr(),
        })
      )
      .min(1, 'At least one emergency contact is required'),

    // Optional fields (safe defaults)
    middleName: z.string().trim().optional().default(''),
    preferredName: z.string().trim().optional().default(''),
    profilePictureKey: z.string().trim().optional().default(''),
    workPhone: z
      .string()
      .trim()
      .optional()
      .default('')
      .refine((val) => !val || (val.length === 10 && !isNaN(Number(val))), {
        message: 'workPhone must be exactly 10 digits if provided',
      }),

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
        phone: z
          .string()
          .trim()
          .optional()
          .default('')
          .refine((val) => !val || (val.length === 10 && !isNaN(Number(val))), {
            message: 'reference.phone must be exactly 10 digits if provided',
          }),
        email: optionalEmailStr(),
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
    // if (data.driverLicense) {
    //   if (!data.driverLicenseDocKey?.trim()) {
    //     ctx.addIssue({
    //       code: z.ZodIssueCode.custom,
    //       path: ['driverLicenseDocKey'],
    //       message: 'driverLicenseDocKey is required when driverLicense is provided',
    //     });
    //   }
    // }
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
