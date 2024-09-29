"use client";

import { ActionIcon, Code, Flex, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { DataTable } from "mantine-datatable";
import axios from "axios";
import { IconX } from "@tabler/icons-react";

const PAGE_SIZE = 15;

interface Car {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  color: string;
}

export default function CarsTable() {
  const [cars, setCars] = useState<Car[]>([]);
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [filters, setFilters] = useState<{
    id: string;
    licensePlate: string;
    brand: string;
    model: string;
    color: string;
  }>({
    id: "",
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
  });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cars`);
        setCars(response.data.cars);
        setError(false);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(cars.slice(from, to));
  }, [page, cars]);

  return (
    <Stack>
      {!error ? (
        <DataTable
          records={records}
          minHeight={150}
          noRecordsText="Aucune voiture trouvée"
          loadingText="Chargement..."
          fetching={loading}
          columns={[
            {
              accessor: "id",
              title: "#",
              render: ({ id }: Car) => <Code>{id}</Code>,
              filter: (
                <TextInput
                  label="Filtrer par ID"
                  placeholder="4d95d650-473c-4b0f-a6da-d253806c8ada"
                  leftSeciont={<Code>=</Code>}
                  rightSection={
                    <ActionIcon size={"sm"} onClick={() => setFilters({ ...filters, id: "" })} variant="transparent">
                      <IconX />
                    </ActionIcon>
                  }
                  value={filters.id}
                  onChange={(event) => setFilters({ ...filters, id: event.currentTarget.value })}
                  />
              ),
              filtering: filters.id !== "",
            },
            { accessor: "license_plate", title: "Immatriculation" },
            { accessor: "brand", title: "Marque" },
            { accessor: "model", title: "Modèle" },
            { accessor: "color", title: "Couleur" },
          ]}
          totalRecords={cars.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={setPage}
        />
      ) : (
        <Flex h="150px" justify="center" align="center">
          <Text ta="center">Une erreur est survenue lors du chargement des données</Text>
        </Flex>
      )}
    </Stack>
  );
}
