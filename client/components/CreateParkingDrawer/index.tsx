import { Button, Drawer, Group, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { useForm } from '@mantine/form';
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

interface CreateParkingDrawerProps {
    opened: boolean;
    onClose: () => void;
}

export default function CreateParkingDrawer({
    opened,
    onClose,
}: CreateParkingDrawerProps): React.ReactElement {
    const [loading, setLoading] = useState<boolean>(false);
      
    const form = useForm({
        initialValues: {
          name: "",
          address: "",
          zipCode: "",
          city: "",
          levels: 1,
          spotsPerLevel: 1,
        },
        validate: {
          name: (value) => value.length < 3 ? "Le nom du parking doit contenir au moins 3 caractères" : null,
          address: (value) => value.length === 0 ? "Ce champ est obligatoire" : null,
          zipCode: (value) => value.length === 0 ? "Ce champ est obligatoire" :
                              value.length !== 5 || isNaN(Number(value)) ? "Le code postal est invalide" : null,
          city: (value) => value.length === 0 ? "Ce champ est obligatoire" : null,
          levels: (value) =>  value < 1 ? "Le nombre de niveaux doit être supérieur à 0" :
                              value % 1 !== 0 ? "Le nombre de niveaux est invalide" : null,
          spotsPerLevel: (value) => value < 1 ? "Le nombre de places par niveau doit être supérieur à 0" :
                              value % 1 !== 0 ? "Le nombre de places par niveau est invalide" : null,
        }
    })

    const router = useRouter();

    return (
        <Drawer opened={opened} onClose={onClose}>
        <form onSubmit={form.onSubmit(async() => {
          setLoading(true);
          try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/parkings/create`, {
              name: form.values.name.trim(),
              address: form.values.address.trim(),
              zipCode: form.values.zipCode.trim(),
              city: form.values.city.trim(),
              levels: form.values.levels,
              spotsPerLevel: form.values.spotsPerLevel,
            })

            router.push(`/parkings/${response.data.parking.id}`);
            
          } catch (error: any) {
            switch (error.response.data.message){
              case "PARKING_ALREADY_EXISTS":
                form.setFieldError("name", `Le parking "${form.values.name}" existe déjà`);
                break;
              default:
                notifications.show({
                  title: "Une erreur est survenue",
                  message: `Le serveur a rencontré un problème, veuillez réessayer plus tard. ${error?.response?.data?.message ?? "UNKNOWN_ERROR"}`,
                })
            }
          } finally {
            setLoading(false);
          }
        })}>
          <Stack>
            <Title order={2}>Ajouter un parking</Title>
            <TextInput
              label="Nom du parking"
              placeholder="Parking des Champs-Élysées"
              key={form.key("name")}
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Adresse"
              placeholder="Avenue des Champs-Élysées"
              key={form.key("address")}
              {...form.getInputProps("address")}
            />
            <Group grow>
              <TextInput 
                label="Code postal" 
                placeholder="75008" 
                key={form.key("zipCode")}
                {...form.getInputProps("zipCode")}
              />
              <TextInput 
                label="Ville" 
                placeholder="Paris" 
                key={form.key("city")}
                {...form.getInputProps("city")}
              />
            </Group>
            <Group grow>
              <NumberInput label="Nombre de niveaux" placeholder="5" min={1} key={form.key("levels")} {...form.getInputProps("levels")} />
              <NumberInput label="Nombre de places par niveau" placeholder="10" min={1} key={form.key("spotsPerLevel")} {...form.getInputProps("spotsPerLevel")} />
            </Group>
            <TextInput label="Nombre de places" disabled value={
              isNaN(form.values.levels) || form.values.levels % 1 !== 0 || form.values.levels < 1 || isNaN(form.values.spotsPerLevel) || form.values.spotsPerLevel % 1 !== 0 || form.values.spotsPerLevel < 1 ? "N/A" : form.values.levels * form.values.spotsPerLevel
            } />
            <Button type="submit" loading={loading}>Créer le parking</Button>
          </Stack>
        </form>
      </Drawer>
    )
}