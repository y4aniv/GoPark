"use client";

import BrandLogo from "@/components/BrandLogo";
import { AppShell, Burger, Button, Flex, Skeleton, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import axios from "axios";
import { useEffect, useState } from "react";
import styles from "@/styles/app/parkingsId.module.css";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

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

export default function ParkingsIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const [appShellNavbarOpened, { toggle: appShellNavbarToggle }] = useDisclosure(false);
  const [parking, setParking] = useState<Parking | null>(null);
  const [error, setError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  
  const pathname = usePathname();

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/parkings/${params.id}`);
        setParking(response.data.parking);
      } catch {
        setError(true);
      }
    };

    fetchParkingData();
  }, [params.id]);

  useEffect(() => {
    setCurrentUrl(pathname);
  }, [pathname]);

  const getButtonVariant = (url: string) => (currentUrl === url ? "filled" : "transparent");

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: true },
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
            {error ? (
              <>--</>
            ) : parking ? (
              parking.name
            ) : (
              <Skeleton w="100%" h={30} />
            )}
          </Title>

          <Button
            variant={getButtonVariant(`/parkings/${params.id}`)}
            component={Link}
            href={`/parkings/${params.id}`}
          >
            Places de parking
          </Button>
          <Button
            variant={getButtonVariant(`/parkings/${params.id}/subscriptions`)}
            component={Link}
            href={`/parkings/${params.id}/subscriptions`}
          >
            Abonnements
          </Button>
          <Button
            variant={getButtonVariant(`/parkings/${params.id}/statistics`)}
            component={Link}
            href={`/parkings/${params.id}/statistics`}
          >
            Statistiques
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
