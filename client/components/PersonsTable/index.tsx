"use client";

import { ActionIcon, Code, Flex, Stack, Text, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { DataTable } from "mantine-datatable";
import { IconX } from "@tabler/icons-react";
import { DatePicker } from "@mantine/dates";
import PersonViewDrawer from "@/components/PersonViewDrawer";
import { useDisclosure } from "@mantine/hooks";

const PAGE_SIZE = 15;

interface Person {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string; // ISO 8601 format
}

export default function PersonsTable({
  persons,
  error,
}: {
  persons: Person[];
  error: boolean;
}) {
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<Person[]>([]);
  const [filters, setFilters] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    birthDate: [Date | null, Date | null];
  }>({
    id: "",
    firstName: "",
    lastName: "",
    birthDate: [null, null],
  });
  const [
    personViewDrawerOpened,
    { open: openPersonViewDrawer, close: closePersonViewDrawer },
  ] = useDisclosure(false);
  const [personViewDrawerPersonId, setPersonViewDrawerPersonId] =
    useState<string>("");

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(persons.slice(from, to));
  }, [page, persons]);

  useEffect(() => {
    setRecords(
      persons
        .filter((person) => {
          return (
            (filters.id === "" || person.id.toString().includes(filters.id)) &&
            (filters.firstName === "" ||
              person.first_name
                .toLowerCase()
                .includes(filters.firstName.toLowerCase())) &&
            (filters.lastName === "" ||
              person.last_name
                .toLowerCase()
                .includes(filters.lastName.toLowerCase())) &&
            (filters.birthDate[0] === null ||
              new Date(person.birth_date) >= filters.birthDate[0]) &&
            (filters.birthDate[1] === null ||
              new Date(person.birth_date) <= filters.birthDate[1])
          );
        })
        .slice(0, PAGE_SIZE)
    );
  }, [filters, persons]);

  function handlePersonClick(personId: string) {
    setPersonViewDrawerPersonId(personId);
    openPersonViewDrawer();
  }

  return (
    <>
      <PersonViewDrawer
        opened={personViewDrawerOpened}
        onClose={closePersonViewDrawer}
        personId={personViewDrawerPersonId}
      />
      <Stack>
        {!error ? (
          <DataTable
            records={records}
            minHeight={150}
            noRecordsText={"Aucune personne trouvée"}
            loadingText={"Chargement..."}
            fetching={persons.length === 0}
            columns={[
              {
                accessor: "id",
                title: "#",
                render: ({ id }) => (
                  <Code
                    onClick={() => handlePersonClick(id.toString())}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontWeight: "bold",
                    }}
                  >
                    {id}
                  </Code>
                ),
                filter: (
                  <TextInput
                    label="Filtrer par ID"
                    placeholder="c8157290-8740-4b5a-b2e4-616c5ef8cfe8"
                    leftSection={<Code>=</Code>}
                    rightSection={
                      <ActionIcon
                        size={"sm"}
                        onClick={() => setFilters({ ...filters, id: "" })}
                        variant="transparent"
                      >
                        <IconX />
                      </ActionIcon>
                    }
                    value={filters.id}
                    onChange={(event) =>
                      setFilters({ ...filters, id: event.currentTarget.value })
                    }
                  />
                ),
                filtering: filters.id !== "",
              },
              {
                accessor: "first_name",
                title: "Prénom",
                filter: (
                  <TextInput
                    label="Filtrer par prénom"
                    placeholder="John"
                    leftSection={<Code>=</Code>}
                    rightSection={
                      <ActionIcon
                        size={"sm"}
                        onClick={() =>
                          setFilters({ ...filters, firstName: "" })
                        }
                        variant="transparent"
                      >
                        <IconX />
                      </ActionIcon>
                    }
                    value={filters.firstName}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        firstName: event.currentTarget.value,
                      })
                    }
                  />
                ),
                filtering: filters.firstName !== "",
              },
              {
                accessor: "last_name",
                title: "Nom de famille",
                filter: (
                  <TextInput
                    label="Filtrer par nom de famille"
                    placeholder="Doe"
                    leftSection={<Code>=</Code>}
                    rightSection={
                      <ActionIcon
                        size={"sm"}
                        onClick={() => setFilters({ ...filters, lastName: "" })}
                        variant="transparent"
                      >
                        <IconX />
                      </ActionIcon>
                    }
                    value={filters.lastName}
                    onChange={(event) =>
                      setFilters({
                        ...filters,
                        lastName: event.currentTarget.value,
                      })
                    }
                  />
                ),
                filtering: filters.lastName !== "",
              },
              {
                accessor: "birth_date",
                title: "Date de naissance",
                render: ({ birth_date }) => {
                  const date = new Date(birth_date);
                  return date.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                },
                filter: (
                  <DatePicker
                    type="range"
                    onChange={(value) => {
                      setFilters({ ...filters, birthDate: value });
                    }}
                    value={filters.birthDate}
                  />
                ),
                filtering:
                  filters.birthDate[0] !== null ||
                  filters.birthDate[1] !== null,
              },
            ]}
            totalRecords={persons.length}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
          />
        ) : (
          <Flex h={"150px"} justify={"center"} align={"center"}>
            <Text ta="center">
              {"Une erreur est survenue lors du chargement des données"}
            </Text>
          </Flex>
        )}
      </Stack>
    </>
  );
}
