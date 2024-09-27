"use client";

import {
  ActionIcon,
  Badge,
  Code,
  Flex,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { DataTable } from "mantine-datatable";
import { IconCar, IconCarOff } from "@tabler/icons-react";
import axios from "axios";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

const PAGE_SIZE = 15;

export default function SubscriptionsTable({
  parking,
}: {
  parking: {
    id: string;
    name: string;
    address: string;
    city: string;
    zip_code: string;
    levels: number;
    spots_per_level: number;
    spots: string[];
    subscriptions: string[];
  } | null;
}) {
  const [subscriptions, setSubscriptions] = useState<
    {
      id: string;
      person: {
        id: string;
        first_name: string;
        last_name: string;
      };
      spot: {
        id: string;
        tag: string;
      }
    }[]
  >([]);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(subscriptions.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parking) {
      setLoading(true);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking?.id}/subscriptions`
        )
        .then((response) => {
          setSubscriptions(response.data.subscriptions);
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [parking]);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(subscriptions.slice(from, to));
  }, [page, subscriptions]);

  return (
    <>
      <Stack>
        {!error ? (
          <DataTable
            records={records}
            minHeight={150}
            noRecordsText={"Aucun abonnement trouvé"}
            loadingText={"Chargement..."}
            fetching={loading}
            columns={[
              {
                accessor: "id",
                title: "#",
                render: ({ id }) => <Code>{id}</Code>,
              },
             {
                accessor: "person",
                title: "Personne",
                render: ({ person }) => (
                  <Text>
                    {person.first_name} {person.last_name}
                  </Text>
                ),
             }, {
                accessor: "spot",
                title: "Place",
                render: ({ spot }) => (
                  <Text>
                    {spot.tag}
                  </Text>
                )
             }
            ]}
            totalRecords={subscriptions.length - 1}
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
