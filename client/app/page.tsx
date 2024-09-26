"use client";

import { AppShell, Flex, Stack, Title } from "@mantine/core";

import BrandLogo from "@/components/BrandLogo";
import CarsTable from "@/components/CarsTable";
import { DataTable } from "mantine-datatable";
import ParkingsTable from "@/components/ParkingsTable";
import PersonsTable from "@/components/PersonsTable";

export default function Root(): React.ReactNode {
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <Flex justify="center" align="center" h={"100%"}>
          <BrandLogo width={100} />
        </Flex>
      </AppShell.Header>
      <AppShell.Main>
        <Stack p={"xl"} gap={"xl"}>
          <ParkingsTable />
          <CarsTable />
          <PersonsTable />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
