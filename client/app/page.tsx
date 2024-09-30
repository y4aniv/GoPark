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
import { useEffect, useState } from "react";
import axios from "axios";

interface Parking {
  id: number;
  name: string;
  address: string;
  city: string;
  zip_code: string;
  levels: number;
  spots_per_level: number;
  available_spots: number;
}

interface Person {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string; // ISO 8601 format
}

interface Car {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  color: string;
}

export default function Root(): React.ReactElement {
  const [createParkingDrawerOpened, { open: openCreateParkingDrawer, close: closeCreateParkingDrawer }] = useDisclosure();
  const [createCarDrawerOpened, { open: openCreateCarDrawer, close: closeCreateCarDrawer }] = useDisclosure();
  const [createPersonDrawerOpened, { open: openCreatePersonDrawer, close: closeCreatePersonDrawer }] = useDisclosure();
  
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [errors, setErrors] = useState<{
    parkings: boolean;
    persons: boolean;
    cars: boolean;
  }>({
    parkings: false,
    persons: false,
    cars: false
  });

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/parkings`);
        setParkings(response.data.parkings);
        setErrors({ ...errors, parkings: false });
      } catch {
        setErrors({ ...errors, parkings: true });
      }
    };

    fetchParkings();
  }, []);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/persons`);
        setPersons(response.data.persons);
        setErrors({ ...errors, persons: false });
      } catch {
        setErrors({ ...errors, persons: true });
      }
    };

    fetchPersons();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cars`);
        setCars(response.data.cars);
        setErrors({ ...errors, cars: false });
      } catch {
        setErrors({ ...errors, cars: true });
      }
    };

    fetchCars();
  }, []);

  return (
    <>
    <CreateParkingDrawer opened={createParkingDrawerOpened} onClose={closeCreateParkingDrawer} parkings={parkings} setParkings={setParkings}  />
    <CreateCarDrawer opened={createCarDrawerOpened} onClose={closeCreateCarDrawer} cars={cars} setCars={setCars} persons={persons} />
    <CreatePersonDrawer opened={createPersonDrawerOpened} onClose={closeCreatePersonDrawer} persons={persons} setPersons={setPersons} />
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
            <ParkingsTable parkings={parkings} error={errors.parkings} />
            <Flex justify="space-between" wrap={"wrap"} gap={"md"}>
              <Title order={2}>Liste des voitures</Title>
              <Button onClick={openCreateCarDrawer}>
                Ajouter une voiture
              </Button>
            </Flex>
            <CarsTable cars={cars} error={errors.cars} />
            <Flex justify="space-between" wrap={"wrap"} gap={"md"}>
              <Title order={2}>Liste des personnes</Title>
              <Button onClick={openCreatePersonDrawer}>
                Ajouter une personne
              </Button>
            </Flex>
            <PersonsTable persons={persons} error={errors.persons} />
          </Stack>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
