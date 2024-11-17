import "@/styles/globals.css";
import "@coinbase/onchainkit/styles.css";
import type { AppProps } from "next/app";
import { Providers } from "@/providers/providers";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
