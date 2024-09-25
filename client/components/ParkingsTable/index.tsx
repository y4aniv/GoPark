"use client";

import { Code, Flex, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { DataTable } from "mantine-datatable";
import Link from "next/link";
import axios from "axios";

const PAGE_SIZE = 5;

export default function ParkingsTable() {
  const [parkings, setParkings] = useState([]);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(parkings.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/parkings`)
      .then((response) => {
        setParkings(response.data.parkings);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(parkings.slice(from, to));
  }, [page, parkings]);

  return (
    <>
      <Stack>
        <Title order={2}>{"Liste des parkings"}</Title>
        {!error ? (
          <DataTable
            records={records}
            minHeight={150}
            noRecordsText={"Aucun parking trouvé"}
            loadingText={"Chargement..."}
            fetching={loading}
            columns={[
              {
                accessor: "id",
                title: "#",
                render: ({ id }) => (
                  // <Link href={`/parkings/${id}`}>
                  <Code>{id}</Code>
                  // </Link>
                ),
              },
              {
                accessor: "name",
                title: "Nom",
              },
              {
                accessor: "address",
                title: "Adresse",
              },
              {
                accessor: "city",
                title: "Ville",
                render: ({ city, zip_code }) => (
                  <span>
                    {city}, {zip_code}
                  </span>
                ),
              },
              {
                accessor: "capacity",
                title: "Capacité",
                render: ({ levels, spots_per_level }) => (
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
          <Flex h={"150px"} justify={"center"} align={"center"}>
            <Text>
              {"Une erreur est survenue lors du chargement des données"}
            </Text>
          </Flex>
        )}
      </Stack>
    </>
  );
}
