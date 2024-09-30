import {
  Button,
  Drawer,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

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

interface CreateSubscriptionDrawerProps {
  opened: boolean;
  onClose: () => void;
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
  subscriptions: Subscription[];
  setSubscriptions: (subscriptions: Subscription[]) => void;
}

export default function CreateSubscriptionDrawer({
  opened,
  onClose,
  parking,
  subscriptions,
  setSubscriptions,
}: CreateSubscriptionDrawerProps): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const [spots, setSpots] = useState<
    | {
        id: string;
        level: number;
        tag: string;
      }[]
    | null
  >([]);
  const [persons, setPersons] = useState<
    | {
        id: string;
        first_name: string;
        last_name: string;
        birth_date: string;
        cars: string[];
        subscriptions: string[];
      }[]
    | null
  >([]);

  const form = useForm({
    initialValues: {
      parking: parking?.id,
      spot: "",
      owner: "",
    },
    validate: {
      spot: (value) => (value.length < 0 ? "Ce champ est requis" : null),
      owner: (value) => (value.length < 0 ? "Ce champ est requis" : null),
    },
  });

  useEffect(() => {
    if (parking) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking?.id}/spots/available`
        )
        .then((response) => {
          setSpots(response.data.spots);
        });
    }
  }, [parking?.id]);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/persons`).then((response) => {
      setPersons(response.data.persons);
    });
  }, []);

  const router = useRouter();

  return (
    <Drawer opened={opened} onClose={onClose}>
      <form
        onSubmit={form.onSubmit(async () => {
          try {
            setLoading(true);
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking?.id}/subscriptions/create`,
              {
                spot: form.values.spot,
                owner: form.values.owner,
              }
            );

            onClose();

            notifications.show({
              title: "Abonnement créé",
              message: `L'abonnement pour la place ${form.values.spot} a été créé avec succès`,
            });

            setSubscriptions(
              [...subscriptions, response.data.subscription].sort((a, b) =>
                a.spot.tag.localeCompare(b.spot.tag)
              )
            );
          } catch (error: any) {
            notifications.show({
              title: "Impossible de créer l'abonnement",
              message: `Une erreur est survenue lors de la création de l'abonnement: ${
                error?.response?.data?.message ?? "UNKNOWN_ERROR"
              }`,
            });
          } finally {
            setLoading(false);
          }
        })}
      >
        <Stack>
          <Title order={2}>Ajouter un abonnement</Title>
          <TextInput
            label="Nom du parking"
            placeholder="Parking des Champs-Élysées"
            value={parking?.name}
            disabled
          />
          <Select
            searchable
            label="Bénéficiaire"
            key={form.key("owner")}
            {...form.getInputProps("owner")}
            data={
              persons?.map((person) => ({
                value: person.id,
                label: `${person.first_name} ${person.last_name} - ${new Date(
                  person.birth_date
                ).toLocaleDateString()}`,
              })) || []
            }
          />
          <Select
            searchable
            label="Place"
            key={form.key("spot")}
            {...form.getInputProps("spot")}
            data={
              spots?.map((spot) => ({
                value: spot.id,
                label: `Niveau ${spot.level} - Place ${spot.tag}`,
              })) || []
            }
          />
          <Button type="submit" loading={loading}>
            Créer l'abonnement
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}
