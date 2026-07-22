import { ImageResponse } from "next/og";
import siteConfig from "~/site.config";

/**
 * Favicon — tarayıcı sekmesindeki ikon.
 * site.config.js'teki marka renginden ve logo baş harfinden üretilir,
 * yani niş değişince ikon da otomatik değişir. Dosya yönetmek gerekmez.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const { theme, logo, name } = siteConfig;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.primary[600],
          borderRadius: 7,
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {(logo.text || name).charAt(0)}
      </div>
    ),
    size,
  );
}
