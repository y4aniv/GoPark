"use client";

import { ActionIcon, Code, Flex, Stack, Text, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { DataTable } from "mantine-datatable";
import { IconX } from "@tabler/icons-react";
import CarViewDrawer from "@/components/CarViewDrawer";
import { useDisclosure } from "@mantine/hooks";

const PAGE_SIZE = 15;

interface Car {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  color: string;
  owner: string;
}

export default function CarsTable({
  cars,
  error,
}: {
  cars: Car[];
  error: boolean;
}) {
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<Car[]>([]);
  const [filters, setFilters] = useState<{
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    color: string;
    owner: string;
  }>({
    id: "",
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
    owner: "",
  });
  const [
    carViewDrawerOpened,
    { open: openCarViewDrawer, close: closeCarViewDrawer },
  ] = useDisclosure(false);
  const [carViewDrawerCarId, setCarViewDrawerCarId] = useState<string>("");

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(cars.slice(from, to));
  }, [page, cars]);

  useEffect(() => {
    setRecords(
      cars
        .filter((car) => {
          return (
            (filters.id === "" || car.id.toString().includes(filters.id)) &&
            (filters.licensePlate === "" ||
              car.license_plate
                .toLowerCase()
                .includes(filters.licensePlate.toLowerCase())) &&
            (filters.brand === "" ||
              car.brand.toLowerCase().includes(filters.brand.toLowerCase())) &&
            (filters.model === "" ||
              car.model.toLowerCase().includes(filters.model.toLowerCase())) &&
            (filters.color === "" ||
              car.color.toLowerCase().includes(filters.color.toLowerCase())) &&
            (filters.owner === "" ||
              car.owner.toLowerCase().includes(filters.owner.toLowerCase()))
          );
        })
        .slice(0, PAGE_SIZE)
    );
  }, [filters, cars]);

  function handleCarClick(id: string) {
    setCarViewDrawerCarId(id);
    openCarViewDrawer();
  }

  return (
    <>
      <CarViewDrawer
        opened={carViewDrawerOpened}
        onClose={closeCarViewDrawer}
        carId={carViewDrawerCarId}
      />
      <Stack>
        {!error ? (
          <DataTable
            records={records}
            minHeight={150}
            noRecordsText="Aucune voiture trouvée"
            loadingText="Chargement..."
            fetching={cars.length === 0}
            columns={[
              {
                accessor: "id",
                title: "#",
                render: ({ id }: Car) => (
                  <Code
                    onClick={() => handleCarClick(id.toString())}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontWeight: "bold",
                    }}
                  >
                    {id}
                  </Code>
                ),
                filter: (
                  <TextInput
                    label="Filtrer par ID"
                    placeholder="4d95d650-473c-4b0f-a6da-d253806c8ada"
                    leftSection={<Code>=</Code>}
                    rightSection={
                      <ActionIcon
                        size={"sm"}
                        onClick={() => setFilters({ ...filters, id: "" })}
                        variant="transparent"
                      >
                        <IconX />
                      </ActionIcon>
                    }
                    value={filters.id}
                    onChange={(event) =>
                      setFilters({ ...filters, id: event.currentTarget.value })
                    }
                  />
                ),
                filtering: filters.id !== "",
              },
              {
                accessor: "license_plate",
                title: "Immatriculation",
                filter: (
                  <TextInput
                    label="Filtrer par immatriculation"
                    placeholder="AB-123-CD"
                    leftSection={<Code>=</Code>}
                    rightSection={
                      <ActionIcon
                        size={"sm"}
                        onClick={() =>
                          setFilters({ ...filters, licensePlate: "" })
                        }
                        variant="transparent"
                      >
                        <IconX />
                      </ActionIcon>
                    }
                    value={filters.licensePlate}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        licensePlate: event.currentTarget.value,
                      })
                    }
                  />
                ),
                filtering: filters.licensePlate !== "",
              },
              {
                accessor: "brand",
                title: "Marque",
                filter: (
                  <TextInput
                    label="Filtrer par marque"
                    placeholder="Tesla"
                    leftSection={<Code>=</Code>}
                    rightSection={
                      <ActionIcon
                        size={"sm"}
                        onClick={() => setFilters({ ...filters, brand: "" })}
                        variant="transparent"
                      >
                        <IconX />
                      </ActionIcon>
                    }
                    value={filters.brand}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        brand: event.currentTarget.value,
                      })
                    }
                  />
                ),
                filtering: filters.brand !== "",
              },
              {
                accessor: "model",
                title: "Modèle",
                filter: (
                  <TextInput
                    label="Filtrer par modèle"
                    placeholder="Model S"
                    leftSection={<Code>=</Code>}
                    rightSection={
                      <ActionIcon
                        size={"sm"}
                        onClick={() => setFilters({ ...filters, model: "" })}
                        variant="transparent"
                      >
                        <IconX />
                      </ActionIcon>
                    }
                    value={filters.model}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        model: event.currentTarget.value,
                      })
                    }
                  />
                ),
              },
              {
                accessor: "color",
                title: "Couleur",
                filter: (
                  <TextInput
                    label="Filtrer par couleur"
                    placeholder="Rouge"
                    leftSection={<Code>=</Code>}
                    rightSection={
                      <ActionIcon
                        size={"sm"}
                        onClick={() => setFilters({ ...filters, color: "" })}
                        variant="transparent"
                      >
                        <IconX />
                      </ActionIcon>
                    }
                    value={filters.color}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        color: event.currentTarget.value,
                      })
                    }
                  />
                ),
                filtering: filters.color !== "",
              },
              {
                accessor: "owner",
                title: "Propriétaire",
                render: ({ owner }) => {
                  return <Code>{owner}</Code>;
                },
                filter: (
                  <TextInput
                    label="Filtrer par propriétaire"
                    placeholder="John Doe"
                    leftSection={<Code>=</Code>}
                    rightSection={
                      <ActionIcon
                        size={"sm"}
                        onClick={() => setFilters({ ...filters, owner: "" })}
                        variant="transparent"
                      >
                        <IconX />
                      </ActionIcon>
                    }
                    value={filters.owner}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        owner: event.currentTarget.value,
                      })
                    }
                  />
                ),
                filtering: filters.owner !== "",
              },
            ]}
            totalRecords={cars.length}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
          />
        ) : (
          <Flex h="150px" justify="center" align="center">
            <Text ta="center">
              Une erreur est survenue lors du chargement des données
            </Text>
          </Flex>
        )}
      </Stack>
    </>
  );
}
