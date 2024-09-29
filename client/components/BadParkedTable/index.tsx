"use client";

import {
  Flex,
  Stack,
  Text,
} from "@mantine/core";
import { useEffect, useState, useMemo } from "react";
import { DataTable } from "mantine-datatable";

const PAGE_SIZE = 15;

interface Owner {
  id: string;
  first_name: string;
  last_name: string;
}

interface Spot {
  id: string;
  tag: string;
  owner: Owner;
}

interface BadParkedData {
  id: string;
  brand: string;
  color: string;
  license_plate: string;
  owner: Owner;
  spot: Spot;
}

interface Props {
  data: BadParkedData[] | null;
}

export default function BadParkedTable({ data }: Props) {
  const [page, setPage] = useState(1);
  const records = useMemo(() => {
    if (!data) return [];
    const from = (page - 1) * PAGE_SIZE;
    return data.slice(from, from + PAGE_SIZE);
  }, [data, page]);

  const columns = useMemo(() => [
    { accessor: "spot.tag", title: "Place N°" },
    { accessor: "license_plate", title: "Plaque d'immatriculation" },
    {
      accessor: "owner",
      title: "Propriétaire de la voiture",
      render: ({ owner }: BadParkedData) => `${owner.first_name} ${owner.last_name}`
    },
    {
      accessor: "spot.owner",
      title: "Propriétaire de la place",
      render: ({ spot }: BadParkedData) => `${spot.owner.first_name} ${spot.owner.last_name}`
    },
  ], []);

  return (
    <Stack>
      {data ? (
        <DataTable
          records={records}
          minHeight={150}
          noRecordsText="Aucune voiture mal garée"
          columns={columns}
          totalRecords={data.length}
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
