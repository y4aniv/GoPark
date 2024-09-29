"use client";

import { Code, Flex, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { DataTable } from "mantine-datatable";
import Link from "next/link";
import axios from "axios";

const PAGE_SIZE = 5;

// Type pour un parking
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

export default function ParkingsTable() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<Parking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/parkings`);
        setParkings(response.data.parkings);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchParkings();
  }, []);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(parkings.slice(from, to));
  }, [page, parkings]);

  return (
    <Stack>
      {!error ? (
        <DataTable
          records={records}
          minHeight={150}
          noRecordsText="Aucun parking trouvé"
          loadingText="Chargement..."
          fetching={loading}
          columns={[
            {
              accessor: "id",
              title: "#",
              render: ({ id }: Parking) => (
                <Link href={`/parkings/${id}`}>
                  <Code>{id}</Code>
                </Link>
              ),
            },
            { accessor: "name", title: "Nom" },
            { accessor: "address", title: "Adresse" },
            {
              accessor: "city",
              title: "Ville",
              render: ({ city, zip_code }: Parking) => (
                <span>
                  {city}, {zip_code}
                </span>
              ),
            },
            {
              accessor: "availableSpots",
              title: "Places Disponibles",
              render: ({ available_spots }: Parking) => (
                <span>{available_spots}</span>
              ),
            },
            {
              accessor: "capacity",
              title: "Capacité",
              render: ({ levels, spots_per_level }: Parking) => (
                <span>{levels * spots_per_level}</span>
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
          <Text ta="center">Une erreur est survenue lors du chargement des données</Text>
        </Flex>
      )}
    </Stack>
  );
}
