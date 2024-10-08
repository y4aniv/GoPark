"use client";

import { Stack, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import axios from "axios";
import SpotsTable from "@/components/SpotsTable";

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

export default function ParkingsId({
  params,
}: {
  params: { id: string };
}): React.ReactElement {
  const [appShellNavbarOpened, { toggle: appShellNavbarToggle }] =
    useDisclosure(false);
  const [parking, setParking] = useState<Parking | null>(null);
  const [error, setError] = useState(false);

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

  return (
    <Stack p="xl">
      <Title order={2}>Liste des places de parking</Title>
      <SpotsTable parking={parking} />
    </Stack>
  );
}
