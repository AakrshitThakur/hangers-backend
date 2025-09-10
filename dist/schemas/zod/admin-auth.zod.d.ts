import { z } from "zod";
declare const adminSignupSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
declare const adminSigninSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export { adminSignupSchema, adminSigninSchema };
//# sourceMappingURL=admin-auth.zod.d.ts.map