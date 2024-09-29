import { Button, Drawer, Group, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { useForm } from '@mantine/form';
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { DateInput } from "@mantine/dates";

interface CreatePersonDrawerProps {
    opened: boolean;
    onClose: () => void;
}

export default function CreatePersonDrawer({
    opened,
    onClose,
}: CreatePersonDrawerProps): React.ReactElement {
    const [loading, setLoading] = useState<boolean>(false);
      
    const form = useForm({
        initialValues: {
          firstName: "",
          lastName: "",
          birthDate: "",
        },
        validate: {
          firstName: (value) => value.trim().length < 0 ? "Ce champ est requis" : null,
          lastName: (value) => value.trim().length < 0 ? "Ce champ est requis" : null,
          birthDate: (value) => value.trim().length < 0 ? "Ce champ est requis" : null,
        }
    })

    const router = useRouter();

    return (
        <Drawer opened={opened} onClose={onClose}>
        <form onSubmit={form.onSubmit(async() => {
          console.log("ok")
        })}>
          <Stack>
            <Title order={2}>Ajouter une personne</Title>
            <TextInput
              label="Prénom"
              placeholder="Bruno"
              key={form.key("firstName")}
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label="Nom"
              placeholder="Cordier"
              key={form.key("lastName")}
              {...form.getInputProps("lastName")}
            />
            <DateInput valueFormat="YYYY-MM-DD" key={form.key("birthDate")} {...form.getInputProps("birthDate")} label="Date de naissance" placeholder="2021-01-01" />
            <Button type="submit" loading={loading}>Créer la personne</Button>
          </Stack>
        </form>
      </Drawer>
    )
}