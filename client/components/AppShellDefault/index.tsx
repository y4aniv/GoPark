"use client";

import { AppShell, Flex } from "@mantine/core";

import BrandLogo from "../BrandLogo";

export default function AppShellDefault({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <Flex align={"center"} justify={"center"} h={"100%"}>
          <BrandLogo width={100} />
        </Flex>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
