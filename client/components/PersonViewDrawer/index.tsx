import { Drawer, Skeleton, Stack, Title, Text, Flex } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";

interface PersonViewDrawerProps {
  opened: boolean;
  onClose: () => void;
  personId: string;
}

export default function PersonViewDrawer({
  opened,
  onClose,
  personId,
}: PersonViewDrawerProps): React.ReactElement {
  const [person, setPerson] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    subscriptions: {
      id: string;
      spot: {
        id: string;
        tag: string;
      };
      parking: {
        id: string;
        name: string;
      };
    }[];
    cars: {
      id: string;
      brand: string;
      color: string;
      license_plate: string;
      model: string;
      spot: {
        id: string;
        tag: string;
      };
      parking: {
        id: string;
        name: string;
      };
      bad_parked: boolean;
    }[];
  } | null>(null);
  const [error, setError] = useState<boolean>(false);
  useEffect(() => {
    if (personId) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/persons/${personId}`)
        .then((response) => {
          setPerson(response.data.person);
        });
    }
  }, [personId]);
  return (
    <Drawer opened={opened} onClose={onClose}>
      <Stack gap={24}>
        <Title order={2}>
          {person ? `${person.first_name} ${person.last_name}` : <Skeleton />}
        </Title>
        <Flex justify={"space-between"}>
          <Stack gap={0}>
            <Title order={3}>{new Date(person?.birth_date || "").toLocaleDateString()}</Title>
            <Text>Date de naissance</Text>
          </Stack>
        </Flex>
        <Flex gap={"xl"}>
          <Stack gap={0}>
            <Title order={3}>{person?.subscriptions.length || 0}</Title>
            <Text>Abonnements</Text>
          </Stack>
          <Stack gap={0}>
            <Title order={3}>{person?.cars.length || 0}</Title>
            <Text>Voitures</Text>
          </Stack>
        </Flex>
      </Stack>
    </Drawer>
  );
}
