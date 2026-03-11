import "@/app/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Providers } from "@/app/providers";
import SiteLayout from "@/components/SiteLayout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin") || router.pathname.startsWith("/Admin");

  return (
    <Providers>
      {isAdmin ? (
        <Component {...pageProps} />
      ) : (
        <SiteLayout>
          <Component {...pageProps} />
        </SiteLayout>
      )}
    </Providers>
  );
}

