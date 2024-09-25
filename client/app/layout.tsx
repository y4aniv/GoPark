import "@/styles/globals.css";
import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";
import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";

import AppShellDefault from "@/components/AppShellDefault";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GoPark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider
          theme={{
            primaryColor: "dark",
            defaultRadius: "md",
            fontFamily: "var(--font-family)",
          }}
        >
          <AppShellDefault>{children}</AppShellDefault>
        </MantineProvider>
      </body>
    </html>
  );
}
