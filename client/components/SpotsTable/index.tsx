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

interface Spot {
  id: string;
  level: number;
  spot: number;
  tag: string;
  car: {
    id: string | null;
    license_plate: string | null;
  };
  is_taken: boolean;
  parking: string;
  subscription: string | null;
}

interface Props {
  parking: Parking | null;
}

export default function SpotsTable({ parking }: Props) {
  const [level, setLevel] = useState<string>("0");
  const [spots, setSpots] = useState<Spot[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<Spot[]>(spots.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setPage(1);
    setRecords(spots.slice(0, PAGE_SIZE));
  }, [level]);

  useEffect(() => {
    if (parking) {
      setLoading(true);
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking.id}/spots?level=${level}`)
        .then((response) => {
          setSpots(response.data.spots);
          setError(false);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [level, parking]);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(spots.slice(from, to));
  }, [page, spots]);

  const openParkCarModal = (id: string) => {
    let licensePlateInput = "";

    modals.openConfirmModal({
      title: "Garer une voiture",
      labels: {
        confirm: "Confirmer",
        cancel: "Annuler",
      },
      children: (
        <Stack>
          <TextInput label="Nom du parking" value={parking?.name} disabled />
          <TextInput
            label="Tag de la place"
            value={spots.find((spot) => spot.id === id)?.tag}
            disabled
          />
          <TextInput
            label="Immatriculation de la voiture"
            onChange={(event) => {
              licensePlateInput = event.currentTarget.value;
            }}
          />
        </Stack>
      ),
      onConfirm: () => {
        axios
          .post(
            `${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking?.id}/spots/${id}/park`,
            {
              license_plate: licensePlateInput.toUpperCase().trim(),
            }
          )
          .then((response) => {
            setSpots((prevSpots) =>
              prevSpots.map((spot) =>
                spot.id === id
                  ? {
                      ...spot,
                      car: {
                        id: response.data.car.id,
                        license_plate: response.data.car.license_plate,
                      },
                      is_taken: true,
                    }
                  : spot
              )
            );
          })
          .catch((err) => handleError(err, "garer"));
      },
    });
  };

  const openUnparkCarModal = (id: string) => {
    modals.openConfirmModal({
      title: "Retirer une voiture",
      labels: {
        confirm: "Confirmer",
        cancel: "Annuler",
      },
      children: (
        <Stack>
          <TextInput label="Nom du parking" value={parking?.name} disabled />
          <TextInput
            label="Tag de la place"
            value={spots.find((spot) => spot.id === id)?.tag}
            disabled
          />
          <TextInput
            label="Immatriculation de la voiture"
            value={spots.find((spot) => spot.id === id)?.car.license_plate ?? ""}
            disabled
          />
        </Stack>
      ),
      onConfirm: () => {
        axios
          .post(`${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking?.id}/spots/${id}/unpark`)
          .then(() => {
            setSpots((prevSpots) =>
              prevSpots.map((spot) =>
                spot.id === id
                  ? { ...spot, car: { id: null, license_plate: null }, is_taken: false }
                  : spot
              )
            );
          })
          .catch((err) => handleError(err, "retirer"));
      },
    });
  };

  const handleError = (err: any, action: string) => {
    const errorMessages: Record<string, string> = {
      PARKING_NOT_FOUND: "Le parking n'a pas été trouvé. Veuillez réessayer.",
      SPOT_NOT_FOUND: "La place n'a pas été trouvée. Veuillez réessayer.",
      NO_DATA: "Veuillez remplir tous les champs.",
      CAR_NOT_FOUND: "La voiture n'a pas été trouvée. Veuillez réessayer.",
      CAR_ALREADY_PARKED: "La voiture est déjà garée.",
      SPOT_ALREADY_TAKEN: "La place est déjà occupée.",
      SPOT_NOT_TAKEN: "Cette place n'est pas prise.",
    };

    notifications.show({
      title: `Impossible de ${action} la voiture`,
      message: errorMessages[err.response.data.message] || "Une erreur est survenue. Veuillez réessayer.",
    });
  };

  return (
    <Stack>
      <Select
        label="Niveau"
        placeholder="Sélectionner un niveau"
        data={[
          { value: "0", label: "Niveau 0" },
          ...(parking?.levels
            ? Array.from({ length: parking.levels - 1 }, (_, i) => ({
                value: (i + 1).toString(),
                label: `Niveau ${i + 1}`,
              }))
            : []),
        ]}
        defaultValue="0"
        disabled={!parking}
        onChange={(value) => setLevel(value as string)}
      />
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
              render: ({ id }) => <Code>{id}</Code>,
            },
            {
              accessor: "tag",
              title: "Tag",
            },
            {
              accessor: "is_taken",
              title: "Occupé",
              render: ({ is_taken }) => (
                <Badge color={is_taken ? "red" : undefined}>{is_taken ? "Oui" : "Non"}</Badge>
              ),
            },
            {
              accessor: "subscription",
              title: "Réservé",
              render: ({ subscription }) => (
                <Badge color={subscription ? "green" : undefined}>{subscription ? "Oui" : "Non"}</Badge>
              ),
            },
            {
              accessor: "car",
              title: "Voiture",
              render: ({ car }) => <Text>{car.id ? car.license_plate : "-"}</Text>,
            },
            {
              accessor: "subscription",
              title: "Abonnement",
              render: ({ subscription }) => <Code>{subscription ?? "-"}</Code>,
            },
            {
              accessor: "actions",
              title: "Actions",
              render: ({ id }) => (
                <Group wrap="nowrap">
                  <Tooltip
                    label={spots.find((spot) => spot.id === id)?.is_taken ? "Retirer la voiture" : "Garer une voiture"}
                  >
                    <ActionIcon
                      variant="white"
                      onClick={() => {
                        const isTaken = spots.find((spot) => spot.id === id)?.is_taken;
                        isTaken ? openUnparkCarModal(id) : openParkCarModal(id);
                      }}
                    >
                      {spots.find((spot) => spot.id === id)?.is_taken ? (
                        <IconCarOff stroke={1.5} />
                      ) : (
                        <IconCar stroke={1.5} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                </Group>
              ),
            },
          ]}
          totalRecords={spots.length}
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
