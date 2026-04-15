import { secret } from "encore.dev/config";
import { Service } from "encore.dev/service";

export default new Service("quickbooks");

export const quickbooksClientId = secret("QuickbooksClientId");
export const quickbooksClientSecret = secret("QuickbooksClientSecret");
export const quickbooksRedirectUri = secret("QuickbooksRedirectUri");
