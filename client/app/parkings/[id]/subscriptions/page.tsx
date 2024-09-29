"use client";

import {
  Button,
  Flex,
  Stack,
  Title
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import axios from "axios";
import SubscriptionsTable from "@/components/SubscriptionsTable";
import CreateSubscriptionDrawer from "@/components/CreateSubscriptionDrawer";

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

const PAGE_SIZE = 15;

export default function ParkingIdSubscription({
  params,
}: {
  params: { id: string };
}): React.ReactNode {
  const [appShellNavbarOpened, { toggle: appShellNavbarToggle }] =
    useDisclosure(false);
  const [parking, setParking] = useState<Parking | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/parkings/${params.id}`
        );
        setParking(response.data.parking);
        setError(false);
      } catch (err) {
        setError(true);
      }
    };

    fetchParkingData();
  }, [params.id]);

  const [createSubscriptionDrawerOpened, { open: openCreateSubscriptionDrawer, close: closeCreateSubscriptionDrawer }] = useDisclosure();

  return (
    <>
      <CreateSubscriptionDrawer opened={createSubscriptionDrawerOpened} onClose={closeCreateSubscriptionDrawer} parking={parking} />
      <Stack p="xl">
        <Flex justify="space-between" wrap={"wrap"} gap={"md"}>
          <Title order={2}>Liste des abonnements</Title>
            <Button onClick={openCreateSubscriptionDrawer}>
              Ajouter un abonnement
            </Button>
        </Flex>
        <SubscriptionsTable parking={parking} />
      </Stack>
    </>
  );
}
