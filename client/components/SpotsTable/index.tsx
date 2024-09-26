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
import { IconCar } from "@tabler/icons-react";
import axios from "axios";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

const PAGE_SIZE = 15;

export default function SpotsTable({
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
  const [level, setLevel] = useState<string>("0");
  const [spots, setSpots] = useState<
    {
      id: string;
      level: number;
      spot: number;
      tag: string;
      car: string | null;
      is_taken: boolean;
      parking: string;
      subscription: string | null;
    }[]
  >([]);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(spots.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parking) {
      setLoading(true);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking?.id}/spots?level=${level}`
        )
        .then((response) => {
          setSpots(response.data.spots);
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [level, parking]);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(spots.slice(from, to));
  }, [page, spots]);

  function openParkCarModal(id: string) {
    var licensePlateInput = "";

    modals.openConfirmModal({
      title: "Garer une voiture",
      labels: {
        confirm: "Ajouter",
        cancel: "Annuler",
      },
      children: (
        <Stack>
          <TextInput label={"Nom du parking"} value={parking?.name} disabled />
          <TextInput
            label={"Tag de la place"}
            value={spots.find((spot) => spot.id === id)?.tag}
            disabled
          />
          <TextInput
            label={"Immatriculation de la voiture"}
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
            setSpots(
              spots.map((spot) =>
                spot.id === id
                  ? {
                      ...spot,
                      car: response.data.car.license_plate,
                      is_taken: true,
                    }
                  : spot
              )
            );
          })
          .catch((err) => {
            switch (err.response.data.message) {
              case "PARKING_NOT_FOUND":
                notifications.show({
                  title: "Impossible de garer la voiture",
                  message: "Le parking n'a pas été trouvé. Veuillez réessayer.",
                  color: "red",
                });
                break;

              case "SPOT_NOT_FOUND":
                notifications.show({
                  title: "Impossible de garer la voiture",
                  message: "La place n'a pas été trouvée. Veuillez réessayer.",
                  color: "red",
                });
                break;

              case "NO_DATA":
                notifications.show({
                  title: "Impossible de garer la voiture",
                  message: "Veuillez remplir tous les champs.",
                  color: "red",
                });
                break;

              case "CAR_NOT_FOUND":
                notifications.show({
                  title: "Impossible de garer la voiture",
                  message:
                    "La voiture n'a pas été trouvée. Veuillez réessayer.",
                  color: "red",
                });
                break;

              case "CAR_ALREADY_PARKED":
                notifications.show({
                  title: "Impossible de garer la voiture",
                  message: "La voiture est déjà garée.",
                  color: "red",
                });
                break;

              case "SPOT_ALREADY_TAKEN":
                notifications.show({
                  title: "Impossible de garer la voiture",
                  message: "La place est déjà occupée.",
                  color: "red",
                });
                break;

              default:
                notifications.show({
                  title: "Impossible de garer la voiture",
                  message: "Une erreur est survenue. Veuillez réessayer.",
                  color: "red",
                });
                break;
            }
          });
      },
    });
  }

  return (
    <>
      <Stack>
        <Select
          label={"Niveau"}
          placeholder={"Sélectionner un niveau"}
          data={[
            { value: "0", label: "Niveau 0" },
            ...(parking?.levels
              ? Array.from({ length: parking.levels - 1 }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: `Niveau ${i + 1}`,
                }))
              : []),
          ]}
          defaultValue={"0"}
          disabled={!parking}
          onChange={(value) => setLevel(value as string)}
        />
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
                render: ({ id }) => <Code>{id}</Code>,
              },
              {
                accessor: "tag",
                title: "Tag",
              },
              {
                accessor: "is_taken",
                title: "Occupé",
                render: ({ is_taken }) =>
                  is_taken ? (
                    <Badge color={"red"}>{"Oui"}</Badge>
                  ) : (
                    <Badge>{"Non"}</Badge>
                  ),
              },
              {
                accessor: "subscription",
                title: "Réservé",
                render: ({ subscription }) =>
                  subscription ? (
                    <Badge color={"green"}>{"Oui"}</Badge>
                  ) : (
                    <Badge>{"Non"}</Badge>
                  ),
              },
              {
                accessor: "car",
                title: "Voiture",
                render: ({ car }) =>
                  car ? <Code>{car}</Code> : <Text>{"-"}</Text>,
              },
              {
                accessor: "subscription",
                title: "Abonnement",
                render: ({ subscription }) =>
                  subscription ? (
                    <Code>{subscription}</Code>
                  ) : (
                    <Text>{"-"}</Text>
                  ),
              },
              {
                accessor: "actions",
                title: "Actions",
                render: ({ id }) => (
                  <Group wrap={"nowrap"}>
                    <Tooltip label={"Garer une voiture"}>
                      <ActionIcon
                        variant={"white"}
                        onClick={() => {
                          openParkCarModal(id);
                        }}
                      >
                        {<IconCar />}
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                ),
              },
            ]}
            totalRecords={spots.length - 1}
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
