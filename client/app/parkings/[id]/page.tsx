"use client";

import {
  AppShell,
  Burger,
  Button,
  Card,
  Code,
  Container,
  Flex,
  Group,
  Select,
  Skeleton,
  Stack,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";

import BrandLogo from "@/components/BrandLogo";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import SpotsTable from "@/components/SpotsTable";
import axios from "axios";
import styles from "@/styles/app/parkingsId.module.css";
import { useDisclosure } from "@mantine/hooks";

const PAGE_SIZE = 15;

export default function ParkingsId({
  params,
}: {
  params: {
    id: string;
  };
}): React.ReactNode {
  const [AppShellNavbarOpened, { toggle: AppShellNavbarToggle }] =
    useDisclosure();
  const [parking, setParking] = useState<{
    id: string;
    name: string;
    address: string;
    city: string;
    zip_code: string;
    levels: number;
    spots_per_level: number;
    spots: string[];
    subscriptions: string[];
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/parkings/${params.id}`)
      .then((response) => {
        setParking(response.data.parking);
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !AppShellNavbarOpened },
      }}
    >
      <AppShell.Header>
        <Burger
          opened={AppShellNavbarOpened}
          onClick={AppShellNavbarToggle}
          hiddenFrom="sm"
          size="sm"
          className={styles.AppShellHeader__Burger}
        />
        <Flex justify="center" align="center" h={"100%"}>
          <BrandLogo width={100} />
        </Flex>
      </AppShell.Header>
      <AppShell.Navbar>
        <Stack p={"md"}>
        <Button variant={"transparent"} leftSection={<IconArrowLeft />} component="a" href={"/"}>
            {"Retour à l'accueil"}
          </Button>
            <Title order={4} ta={"center"} p={"md"}>
              {parking?.name || error ? (
                <>
                  {parking?.name}
                  {error && "--"}
                </>
              ) : (
                <Skeleton w={"100%"} h={30} />
              )}
            </Title>
          <Button>
            {"Places de parking"}
          </Button>
          <Button  variant={"transparent"}>
            {"Abonnements"}
          </Button>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <Stack p={"xl"}>
          <Title order={2}>{"Liste des places de parking"}</Title>
          <SpotsTable parking={parking} />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
