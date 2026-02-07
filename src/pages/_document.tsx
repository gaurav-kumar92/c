import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Google AdSense Script */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9788212864829344"
     crossOrigin="anonymous"></script>
        {/* Google AdSense Verification Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-9788212864829344"></meta>
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
      <script src="https://pl28641636.effectivegatecpm.com/00/fd/2d/00fd2d287f4e960073648f80a79ab1e7.js"></script>
    </Html>
  );
}
