/**
 * View path segments for authentication routes.
 */
export type AuthViewPaths = {
  /**
   * Path segment for the sign-in view
   * @default "sign-in"
   */
  signIn: string;
  /**
   * Path segment for the sign-up view
   * @default "sign-up"
   */
  signUp: string;
  /**
   * Path segment for the magic link authentication view
   * @default "magic-link"
   */
  magicLink: string;
  /**
   * Path segment for the forgot password view
   * @default "forgot-password"
   */
  forgotPassword: string;
  /**
   * Path segment for the reset password view
   * @default "reset-password"
   */
  resetPassword: string;
  /**
   * Path segment for the sign-out view
   * @default "sign-out"
   */
  signOut: string;
};

export const viewPaths: AuthViewPaths = {
  signIn: "sign-in",
  signUp: "sign-up",
  magicLink: "magic-link",
  forgotPassword: "forgot-password",
  resetPassword: "reset-password",
  signOut: "sign-out",
};

/**
 * Valid auth view key.
 */
export type AuthView = keyof AuthViewPaths;
