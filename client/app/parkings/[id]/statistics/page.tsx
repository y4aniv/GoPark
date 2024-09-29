"use client";

import {
  AppShell,
  Burger,
  Button,
  Skeleton,
  Stack,
  Title,
  Flex,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import axios from "axios";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import ParkingStatistics from "@/components/ParkingStatistics";
import styles from "@/styles/app/parkingsId.module.css";

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

export default function ParkingIdStatistics({
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
      } catch (err) {
        setError(true);
      }
    };

    fetchParkingData();
  }, [params.id]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !appShellNavbarOpened },
      }}
    >
      <AppShell.Header>
        <Burger
          opened={appShellNavbarOpened}
          onClick={appShellNavbarToggle}
          hiddenFrom="sm"
          size="sm"
          className={styles.appShellHeaderBurger}
        />
        <Flex justify="center" align="center" h="100%">
          <BrandLogo width={100} />
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar>
        <Stack p="md">
          <Button
            variant="transparent"
            leftSection={<IconArrowLeft />}
            component={Link}
            href="/"
          >
            Retour à l'accueil
          </Button>

          <Title order={4} ta="center" p="md">
            {parking?.name || error ? (
              <>
                {parking?.name}
                {error && "--"}
              </>
            ) : (
              <Skeleton w="100%" h={30} />
            )}
          </Title>

          <Button variant="transparent" component={Link} href={`/parkings/${params.id}/`}>
            Places de parking
          </Button>
          <Button variant="transparent" component={Link} href={`/parkings/${params.id}/subscriptions`}>
            Abonnements
          </Button>
          <Button>Statistiques</Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack p="xl">
          <Title order={2}>Statistiques</Title>
          <ParkingStatistics parking={parking} />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
