import {
    Drawer,
    Skeleton,
    Stack,
    Title,
    Text,
    Flex,
    Alert,
  } from "@mantine/core";
  import axios from "axios";
  import { useEffect, useState } from "react";
  
  interface CarViewDrawerProps {
    opened: boolean;
    onClose: () => void;
    carId: string;
  }
  
  export default function CarViewDrawer({
    opened,
    onClose,
    carId,
  }: CarViewDrawerProps): React.ReactElement {
    const [car, setCar] = useState<{
      id: string;
      brand: string;
      color: string;
      license_plate: string;
      model: string;
      owner: {
        id: string;
        first_name: string;
        last_name: string;
      };
      spot: {
        id: string;
        tag: string;
      };
      parking: {
        id: string;
        name: string;
      };
      bad_parked: boolean;
    } | null>(null);
    const [error, setError] = useState<boolean>(false);
    useEffect(() => {
      if (carId) {
        axios
          .get(`${process.env.NEXT_PUBLIC_API_URL}/cars/${carId}`)
          .then((response) => {
            setCar(response.data.car);
          });
      }
    }, [carId]);
    return (
      <Drawer opened={opened} onClose={onClose}>
        <Stack gap={"xl"}>
          <Title order={2}>
            {car ? `Voiture n°${car.license_plate}` : <Skeleton />}
          </Title>
          <Flex gap={"xl"}>
            <Stack gap={0}>
              <Title order={3}>
                {car?.owner.first_name + " " + car?.owner.last_name || (
                  <Skeleton />
                )}
              </Title>
              <Text>Propriétaire</Text>
            </Stack>
          </Flex>
          <Flex gap={"xl"}>
            <Stack gap={0}>
              <Title order={3}>{car?.brand || <Skeleton />}</Title>
              <Text>Marque</Text>
            </Stack>
            <Stack gap={0}>
              <Title order={3}>{car?.model || <Skeleton />}</Title>
              <Text>Modèle</Text>
            </Stack>
            <Stack gap={0}>
              <Title order={3}>{car?.color || <Skeleton />}</Title>
              <Text>Couleur</Text>
            </Stack>
          </Flex>
          <Flex gap={"xl"}>
            {car?.spot?.id && (
              <>
                <Stack gap={0}>
                  <Title order={3}>{car?.parking.name || <Skeleton />}</Title>
                  <Text>Nom du parking</Text>
                </Stack>
                <Stack gap={0}>
                  <Title order={3}>{car?.spot.tag || <Skeleton />}</Title>
                  <Text>Place de parking</Text>
                </Stack>
              </>
            )}
          </Flex>
  
          {car?.bad_parked && (
            <Alert title={"Voiture mal garée"}>
              Cette voiture est garée sur une place qui ne lui est pas attribuée
            </Alert>
          )}
  
          {error && (
            <Flex h={"150px"} justify={"center"} align={"center"}>
              <Text ta={"center"}>
                Une erreur est survenue lors du chargement des données
              </Text>
            </Flex>
          )}
        </Stack>
      </Drawer>
    );
  }
  