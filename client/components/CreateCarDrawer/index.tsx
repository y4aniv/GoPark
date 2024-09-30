import { Autocomplete, Button, Drawer, Group, NumberInput, Select, Stack, TextInput, Title } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from '@mantine/form';
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import brands from "@/data/brands.json";
import models from "@/data/models.json";
import colors from "@/data/colors.json";

interface CreateCarDrawerProps {
    opened: boolean;
    onClose: () => void;
    cars: any;
    setCars: (cars: any) => void;
    persons: any;
}

export default function CreateCarDrawer({
    opened,
    onClose,
    cars,
    setCars,
    persons,
}: CreateCarDrawerProps): React.ReactElement {
    const [loading, setLoading] = useState<boolean>(false);
      
    const form = useForm({
        initialValues: {
          licensePlate: "",
          brand: "",
          model: "",
          color: "",
          owner: "",
        },
        validate: {
          licensePlate: (value) => value.trim().length < 1 ? "Ce champ est requis" : 
                                    !/^[A-Z]{2}[0-9]{3}[A-Z]{2}$/.test(value) ? "Le numéro de plaque d'immatriculation doit être de la forme AA123AA" : null,
          brand: (value) => value.trim().length < 1 ? "Ce champ est requis" : null,
          model: (value) => value.trim().length < 1 ? "Ce champ est requis" : null,
          color: (value) => value.trim().length < 1 ? "Ce champ est requis" : null,
          owner: (value) => value.trim().length < 1 ? "Ce champ est requis" : null,
        }
    })

    const router = useRouter();

    return (
        <Drawer opened={opened} onClose={onClose}>
        <form onSubmit={form.onSubmit(async() => {
          setLoading(true);
          try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/cars/create`, {
              license_plate: form.values.licensePlate.trim(),
              brand: form.values.brand.trim(),
              model: form.values.model.trim(),
              color: form.values.color.trim(),
              owner: form.values.owner,
            })
            onClose();
            notifications.show({
              title: "Voiture créée",
              message: `La voiture avec la plaque d'immatriculation "${response.data.car.license_plate}" a été créée avec succès`,
            });
            setCars([...cars, response.data.car].sort((a: any, b: any) => a.license_plate.localeCompare(b.license_plate)));
          }catch (error: any) {
            switch (error.response.data.message){
              case "CAR_ALREADY_EXISTS":
                form.setFieldError("licensePlate", `La voiture avec la plaque d'immatriculation "${form.values.licensePlate}" existe déjà`);
                break;
              case "OWNER_NOT_FOUND":
                form.setFieldError("owner", `La personne n'existe pas`);
                break;
              default:
                notifications.show({
                  title: "Impossible de créer la voiture",
                  message: `Une erreur est survenue lors de la création de la voiture: ${error?.response?.data?.message ?? "UNKNOWN_ERROR"}`,
                });
            }
          } finally {
            setLoading(false);
          }
        })}>
          <Stack>
            <Title order={2}>Ajouter une voiture</Title>
            <TextInput
              label="Plaque d'immatriculation"
              placeholder="AA123AA"
              key={form.key("licensePlate")}
              {...form.getInputProps("licensePlate")}
            />
            <Autocomplete
              label="Marque"
              placeholder="Renault"
              key={form.key("brand")}
              {...form.getInputProps("brand")}
              data={brands}
            />
            <Autocomplete
              label="Modèle"
              placeholder="Clio"
              key={form.key("model")}
              {...form.getInputProps("model")}
              data={models}
            />
            <Autocomplete
              label="Couleur"
              placeholder="Blanc"
              key={form.key("color")}
              {...form.getInputProps("color")}
              data={colors}
              />
            <Select
              searchable
              label="Propriétaire" 
              key={form.key("owner")}
              {...form.getInputProps("owner")}
              data={
                persons?.map((person: any) => ({
                  value: person.id,
                  label: `${person.first_name} ${person.last_name} - ${new Date(person.birth_date).toLocaleDateString()}`,
                })) || []
              }
              />
            <Button type="submit" loading={loading}>Créer la voiture</Button>
          </Stack>
        </form>
      </Drawer>
    )
}