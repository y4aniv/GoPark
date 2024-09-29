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
import { IconTrash } from "@tabler/icons-react";
import axios from "axios";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

const PAGE_SIZE = 15;

interface Parking {
  id: string;
  name: string;
  address: string;
  city: string;
  zip_code: string;
  levels: number;
  spots_per_level: number;
  spots: string[];
  subscriptions: string[];
}

interface Subscription {
  id: string;
  person: {
    id: string;
    first_name: string;
    last_name: string;
  };
  spot: {
    id: string;
    tag: string;
  };
}

interface Props {
  parking: Parking | null;
}

export default function SubscriptionsTable({ parking }: Props) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (parking) {
      setLoading(true);
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking.id}/subscriptions`)
        .then((response) => {
          setSubscriptions(response.data.subscriptions);
          setError(false);
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

  const openConfirmModal = (subscriptionId: string) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId);
    
    if (!subscription) return;

    modals.openConfirmModal({
      title: "Supprimer l'abonnement",
      labels: {
        cancel: "Annuler",
        confirm: "Confirmer",
      },
      children: (
        <Stack>
          <TextInput label="Nom du parking" value={parking?.name} disabled />
          <TextInput label="Place" value={subscription.spot.tag} disabled />
          <TextInput label="Personne" value={`${subscription.person.first_name} ${subscription.person.last_name}`} disabled />
          <TextInput label="Abonnement" value={subscriptionId} disabled />
        </Stack>
      ),
      onConfirm: () => {
        axios
          .post(`${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking?.id}/subscriptions/${subscriptionId}/delete`)
          .then(() => {
            setSubscriptions((prev) => prev.filter(s => s.id !== subscriptionId));
          })
          .catch(() => {
            notifications.show({
              title: "Erreur",
              message: "Une erreur est survenue lors de la suppression de l'abonnement",
            });
          });
      },
    });
  };

  return (
    <Stack>
      {!error ? (
        <DataTable
          records={records}
          minHeight={150}
          noRecordsText="Aucun abonnement trouvé"
          loadingText="Chargement..."
          fetching={loading}
          columns={[
            {
              accessor: "id",
              title: "#",
              render: ({ id }) => <Code>{id}</Code>,
            },
            {
              accessor: "spot",
              title: "Place",
              render: ({ spot }) => <Text>{spot.tag}</Text>,
            },
            {
              accessor: "person",
              title: "Propriétaire",
              render: ({ person }) => (
                <Text>{`${person.first_name} ${person.last_name}`}</Text>
              ),
            },
            {
              accessor: "actions",
              title: "Actions",
              render: ({ id }) => (
                <Group wrap="nowrap">
                  <Tooltip label="Supprimer l'abonnement">
                    <ActionIcon variant="white" onClick={() => openConfirmModal(id)}>
                      <IconTrash />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ),
            },
          ]}
          totalRecords={subscriptions.length}
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
