"use client";

import { Code, Flex, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

import { DataTable } from "mantine-datatable";
import axios from "axios";

const PAGE_SIZE = 15;

export default function CarsTable() {
  const [cars, setCars] = useState([]);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(cars.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/cars`)
      .then((response) => {
        setCars(response.data.cars);
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
    setRecords(cars.slice(from, to));
  }, [page, cars]);

  return (
    <>
      <Stack>
        <Title order={2}>{"Liste des voitures"}</Title>
        {!error ? (
          <DataTable
            records={records}
            minHeight={150}
            noRecordsText={"Aucune voiture trouvée"}
            loadingText={"Chargement..."}
            fetching={loading}
            columns={[
              {
                accessor: "id",
                title: "#",
                render: ({ id }) => <Code>{id}</Code>,
              },
              {
                accessor: "license_plate",
                title: "Immatriculation",
              },
              {
                accessor: "brand",
                title: "Marque",
              },
              {
                accessor: "model",
                title: "Modèle",
              },
              {
                accessor: "color",
                title: "Couleur",
              },
            ]}
            totalRecords={cars.length}
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
