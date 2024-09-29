import "@/styles/globals.css";
import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css"

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GoPark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) : React.ReactElement {
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
          <Notifications autoClose={3000} position="top-right" />
          <ModalsProvider>{children}</ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
