"use client";

import CarsTable from "@/components/CarsTable";
import { DataTable } from "mantine-datatable";
import ParkingsTable from "@/components/ParkingsTable";
import PersonsTable from "@/components/PersonsTable";
import { Stack } from "@mantine/core";

export default function Root(): React.ReactNode {
  return (
    <Stack p={"xl"} gap={"xl"}>
      <ParkingsTable />
      <CarsTable />
      <PersonsTable />
    </Stack>
  );
}
