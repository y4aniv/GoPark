"use client";

import {
  ActionIcon,
  Flex,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Code,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { DataTable } from "mantine-datatable";
import Link from "next/link";
import axios from "axios";
import { IconSearch, IconX } from "@tabler/icons-react";

const PAGE_SIZE = 5;

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

export default function ParkingsTable({
  parkings,
  error,
}: {
  parkings: Parking[];
  error: boolean;
}) {
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<Parking[]>([]);
  const [filters, setFilters] = useState<{
    id: string;
    name: string;
    address: string;
    zipCode: string;
    availableSpots: number;
    capacity: number;
  }>({
    id: "",
    name: "",
    address: "",
    zipCode: "",
    availableSpots: 0,
    capacity: 0,
  });

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(parkings.slice(from, to));
  }, [page, parkings]);

  useEffect(() => {
    setRecords(
      parkings
        .filter((parking) => {
          return (
            (filters.id === "" || parking.id.toString().includes(filters.id)) &&
            (filters.name === "" ||
              parking.name
                .toLowerCase()
                .includes(filters.name.toLowerCase())) &&
            (filters.address === "" ||
              parking.address
                .toLowerCase()
                .includes(filters.address.toLowerCase())) &&
            (filters.zipCode === "" ||
              parking.zip_code.includes(filters.zipCode)) &&
            (filters.availableSpots === 0 ||
              parking.available_spots >= filters.availableSpots) &&
            (filters.capacity === 0 ||
              parking.levels * parking.spots_per_level >= filters.capacity)
          );
        })
        .slice(0, PAGE_SIZE)
    );
  }, [filters, parkings]);

  return (
    <Stack>
      {!error ? (
        <DataTable
          records={records}
          minHeight={150}
          noRecordsText="Aucun parking trouvé"
          loadingText="Chargement..."
          fetching={parkings.length === 0}
          columns={[
            {
              accessor: "id",
              title: "#",
              render: ({ id }: Parking) => (
                <Link href={`/parkings/${id}`}>
                  <Code>{id}</Code>
                </Link>
              ),
              filter: (
                <TextInput
                  label="Filtrer par ID"
                  placeholder="c8157290-8740-4b5a-b2e4-616c5ef8cfe8"
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
              accessor: "name",
              title: "Nom",
              filter: (
                <TextInput
                  label="Filtrer par nom"
                  placeholder="Parking des Champs Elysées"
                  leftSection={<Code>=</Code>}
                  rightSection={
                    <ActionIcon
                      size={"sm"}
                      onClick={() => setFilters({ ...filters, name: "" })}
                      variant="transparent"
                    >
                      <IconX />
                    </ActionIcon>
                  }
                  value={filters.name}
                  onChange={(event) =>
                    setFilters({ ...filters, name: event.currentTarget.value })
                  }
                />
              ),
              filtering: filters.name !== "",
            },
            {
              accessor: "address",
              title: "Adresse",
              filter: (
                <TextInput
                  label="Filtrer par adresse"
                  placeholder="Avenue des Champs Elysées"
                  leftSection={<Code>=</Code>}
                  rightSection={
                    <ActionIcon
                      size={"sm"}
                      onClick={() => setFilters({ ...filters, address: "" })}
                      variant="transparent"
                    >
                      <IconX />
                    </ActionIcon>
                  }
                  value={filters.address}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      address: event.currentTarget.value,
                    })
                  }
                />
              ),
              filtering: filters.address !== "",
            },
            {
              accessor: "city",
              title: "Ville",
              render: ({ city, zip_code }: Parking) => (
                <span>
                  {city}, {zip_code}
                </span>
              ),
              filter: (
                <TextInput
                  label="Filtrer par code postal"
                  placeholder="Paris, 75008"
                  leftSection={<Code>=</Code>}
                  rightSection={
                    <ActionIcon
                      size={"sm"}
                      onClick={() => setFilters({ ...filters, zipCode: "" })}
                      variant="transparent"
                    >
                      <IconX />
                    </ActionIcon>
                  }
                  value={filters.zipCode}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      zipCode: event.currentTarget.value,
                    })
                  }
                />
              ),
              filtering: filters.zipCode !== "",
            },
            {
              accessor: "availableSpots",
              title: "Places Disponibles",
              render: ({ available_spots }: Parking) => (
                <span>{available_spots}</span>
              ),
              filter: (
                <NumberInput
                  label="Filtrer par places disponibles"
                  placeholder="10"
                  leftSection={<Code>{">="}</Code>}
                  rightSection={
                    <ActionIcon
                      size={"sm"}
                      onClick={() =>
                        setFilters({ ...filters, availableSpots: 0 })
                      }
                      variant="transparent"
                    >
                      <IconX />
                    </ActionIcon>
                  }
                  value={filters.availableSpots}
                  onChange={(value) => {
                    if (value === "" || typeof value === "string") {
                      setFilters({ ...filters, availableSpots: 0 });
                    } else {
                      setFilters({
                        ...filters,
                        availableSpots: parseInt(value.toString(), 10),
                      });
                    }
                  }}
                  min={0}
                />
              ),
              filtering: filters.availableSpots !== 0,
            },
            {
              accessor: "capacity",
              title: "Capacité",
              render: ({ levels, spots_per_level }: Parking) => (
                <span>{levels * spots_per_level}</span>
              ),
              filter: (
                <NumberInput
                  label="Filtrer par capacité"
                  placeholder="1000"
                  leftSection={<Code>{">="}</Code>}
                  rightSection={
                    <ActionIcon
                      size={"sm"}
                      onClick={() => setFilters({ ...filters, capacity: 0 })}
                      variant="transparent"
                    >
                      <IconX />
                    </ActionIcon>
                  }
                  value={filters.capacity}
                  onChange={(value) => {
                    if (value === "" || typeof value === "string") {
                      setFilters({ ...filters, capacity: 0 });
                    } else {
                      setFilters({
                        ...filters,
                        capacity: value ? parseInt(value.toString(), 10) : 0,
                      });
                    }
                  }}
                  min={0}
                />
              ),
            },
          ]}
          totalRecords={parkings.length}
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
  );
}
