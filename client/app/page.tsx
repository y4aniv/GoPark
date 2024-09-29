"use client";

import { AppShell, Button, Flex, Stack, Title } from "@mantine/core";
import BrandLogo from "@/components/BrandLogo";
import CarsTable from "@/components/CarsTable";
import ParkingsTable from "@/components/ParkingsTable";
import PersonsTable from "@/components/PersonsTable";
import { useDisclosure } from "@mantine/hooks";
import CreateParkingDrawer from "@/components/CreateParkingDrawer";
import CreateCarDrawer from "@/components/CreateCarDrawer";
import CreatePersonDrawer from "@/components/CreatePersonDrawer";

export default function Root(): React.ReactElement {
  const [createParkingDrawerOpened, { open: openCreateParkingDrawer, close: closeCreateParkingDrawer }] = useDisclosure();
  const [createCarDrawerOpened, { open: openCreateCarDrawer, close: closeCreateCarDrawer }] = useDisclosure();
  const [createPersonDrawerOpened, { open: openCreatePersonDrawer, close: closeCreatePersonDrawer }] = useDisclosure();

  return (
    <>
    <CreateParkingDrawer opened={createParkingDrawerOpened} onClose={closeCreateParkingDrawer} />
    <CreateCarDrawer opened={createCarDrawerOpened} onClose={closeCreateCarDrawer} />
    <CreatePersonDrawer opened={createPersonDrawerOpened} onClose={closeCreatePersonDrawer} />
      <AppShell header={{ height: 60 }}>
        <AppShell.Header>
          <Flex justify="center" align="center" h="100%">
            <BrandLogo width={100} />
          </Flex>
        </AppShell.Header>
        <AppShell.Main>
          <Stack p="xl" gap="xl">
            <Flex justify="space-between" wrap={"wrap"} gap={"md"}>
              <Title order={2}>Liste des parkings</Title>
              <Button onClick={openCreateParkingDrawer}>
                Ajouter un parking
              </Button>
            </Flex>
            <ParkingsTable />
            <Flex justify="space-between" wrap={"wrap"} gap={"md"}>
              <Title order={2}>Liste des voitures</Title>
              <Button onClick={openCreateCarDrawer}>
                Ajouter une voiture
              </Button>
            </Flex>
            <CarsTable />
            <Flex justify="space-between" wrap={"wrap"} gap={"md"}>
              <Title order={2}>Liste des personnes</Title>
              <Button onClick={openCreatePersonDrawer}>
                Ajouter une personne
              </Button>
            </Flex>
            <PersonsTable />
          </Stack>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
