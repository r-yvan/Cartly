import { authOptions } from "@/lib/auth";

/** OAuth providers that are actually configured, so buttons only show when they work. */
export const oauthProviders = () =>
  authOptions.providers.filter((p) => p.type === "oauth").map((p) => p.id);

/** Only allow same-site relative redirects after sign-in. */
export const safeCallback = (value?: string) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";

export const AUTH_ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "That email is already registered with a different sign-in method. Use the one you signed up with.",
  AccessDenied: "Access was denied. You may have cancelled the sign-in.",
  Configuration: "Sign-in isn't configured correctly on the server. Please try again later.",
  OAuthSignin: "We couldn't start the sign-in with that provider. Please try again.",
  OAuthCallback: "The provider sent back an invalid response. Please try again.",
  OAuthCreateAccount: "We couldn't create your account from that provider. Please try again.",
  Callback: "Something went wrong while finishing sign-in. Please try again.",
  SessionRequired: "Please sign in to view that page.",
  CredentialsSignin: "Incorrect email or password",
};
