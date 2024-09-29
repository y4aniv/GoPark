"use client";

import { Flex, Loader, Stack, Text, Title } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { PieChart, BarChart } from "@mantine/charts";

// Type pour les statistiques de parking
interface ParkingStatistics {
  total_spots: number;
  total_levels: number;
  total_cars: number;
  total_subscriptions: number;
  available_spots: number;
  taken_spots: number;
  reserved_spots: number;
  not_reserved_spots: number;
  car_brands: Record<string, number>;
}

// Type pour les propriétés du parking
interface ParkingProps {
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

interface ParkingStatisticsProps {
  parking: ParkingProps | null;
}

export default function ParkingStatistics({ parking }: ParkingStatisticsProps) {
  const [statistics, setStatistics] = useState<ParkingStatistics | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (parking) {
      const fetchStatistics = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/parkings/${parking.id}/statistics`);
          setStatistics(response.data.statistics);
        } catch {
          setError(true);
        }
      };
      fetchStatistics();
    }
  }, [parking]);

  return (
    <Stack>
      {error ? (
        <Flex h={"150px"} justify={"center"} align={"center"}>
          <Text>Une erreur est survenue lors du chargement des données</Text>
        </Flex>
      ) : (
        <>
          {statistics ? (
            <Stack gap={"xl"} w={"100%"}>
              <Flex wrap={"wrap"} gap={"xl"} justify={"center"}>
                <StatisticCard value={statistics.total_spots} label="Nombre de places" />
                <StatisticCard value={statistics.total_cars} label="Nombre de voitures" />
                <StatisticCard value={statistics.total_levels} label="Nombre d'étages" />
                <StatisticCard value={statistics.total_subscriptions} label="Nombre d'abonnements" />
              </Flex>
              <Flex wrap={"wrap"} gap={"xl"} justify={"center"} w={"100%"}>
                <PieChartSection value1={statistics.available_spots} label1="Places disponibles" value2={statistics.taken_spots} label2="Places prises" />
                <PieChartSection value1={statistics.reserved_spots} label1="Places réservées" value2={statistics.not_reserved_spots} label2="Places non réservées" />
              </Flex>
              <Flex wrap={"wrap"} gap={"xl"} justify={"center"} w={"100%"}>
                <Stack w={"100%"}>
                  <BarChart
                    h={400}
                    w={"100%"}
                    tooltipAnimationDuration={200}
                    data={Object.entries(statistics.car_brands || {})
                      .map(([brand, count]) => ({ brand, count }))
                      .sort((a, b) => a.count - b.count)}
                    dataKey="brand"
                    series={[{ name: "count", color: "dark", label: "Nombre de voitures" }]}
                  />
                  <Text ta={"center"}>Répartition des marques de voitures</Text>
                </Stack>
              </Flex>
            </Stack>
          ) : (
            <Flex h={"150px"} justify={"center"} align={"center"}>
              <Loader />
            </Flex>
          )}
        </>
      )}
    </Stack>
  );
}

function StatisticCard({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <Title order={2}>{value}</Title>
      <Text ta={"center"}>{label}</Text>
    </div>
  );
}

function PieChartSection({ value1, label1, value2, label2 }: { value1: number; label1: string; value2: number; label2: string }) {
  return (
    <Stack>
      <PieChart
        withLabelsLine
        labelsPosition="outside"
        labelsType="percent"
        withLabels
        withTooltip
        data={[
          { name: label1, value: value1, color: "dark" },
          { name: label2, value: value2, color: "gray" },
        ]}
      />
      <Text ta={"center"}>{`Répartition des ${label1.toLowerCase()}`}</Text>
    </Stack>
  );
}
