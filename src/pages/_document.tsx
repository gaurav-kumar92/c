// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Adsterra Script - for pop-under and banner ads */}
        <script
          src="https://pl28641636.effectivegatecpm.com/00/fd/2d/00fd2d287f4e960073648f80a79ab1e7.js"
          async
        ></script>
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
      
    </Html>
  );
}
