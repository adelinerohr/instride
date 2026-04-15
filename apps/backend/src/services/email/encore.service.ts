import { secret } from "encore.dev/config";
import { Service } from "encore.dev/service";
import { Resend } from "resend";

export default new Service("email");

export const resendApiKey = secret("ResendApiKey");

export const resend = new Resend(resendApiKey());
