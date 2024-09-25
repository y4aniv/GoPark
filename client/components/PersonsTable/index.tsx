"use client";

import { Code, Flex, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { DataTable } from "mantine-datatable";
import axios from "axios";

const PAGE_SIZE = 15;

export default function PersonsTable() {
  const [persons, setPersons] = useState([]);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(persons.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/persons`)
      .then((response) => {
        setPersons(response.data.persons);
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
    setRecords(persons.slice(from, to));
  }, [page, persons]);

  return (
    <>
      <Stack>
        <Title order={2}>{"Liste des personnes"}</Title>
        {!error ? (
          <DataTable
            records={records}
            minHeight={150}
            noRecordsText={"Aucune personne trouvée"}
            loadingText={"Chargement..."}
            fetching={loading}
            columns={[
              {
                accessor: "id",
                title: "#",
                render: ({ id }) => <Code>{id}</Code>,
              },
              {
                accessor: "first_name",
                title: "Prénom",
              },
              {
                accessor: "last_name",
                title: "Nom de famille",
              },
              {
                accessor: "birth_date",
                title: "Date de naissance",
                render: ({ birth_date }) => {
                  const date = new Date(birth_date);
                  return date.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                },
              },
            ]}
            totalRecords={persons.length}
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
