import { appMeta } from "encore.dev";

type Props = { type: "web"; organizationSlug?: string } | { type: "api" };

export const getBaseUrl = (props: Props) => {
  const isProd = appMeta().environment.type === "production";

  if (props.type === "web") {
    if (props.organizationSlug) {
      return isProd
        ? `https://${props.organizationSlug}.instrideapp.com`
        : `http://localhost:3000/org/${props.organizationSlug}`;
    }

    return isProd ? "https://instrideapp.com" : "http://localhost:3000";
  }

  return isProd ? "https://api.instrideapp.com" : "http://localhost:4000";
};
