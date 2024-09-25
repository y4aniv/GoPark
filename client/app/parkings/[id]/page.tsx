"use client";

import { AppShell, Button } from "@mantine/core";

export default function Parkings({
  params,
}: {
  params: {
    id: string;
  };
}): React.ReactNode {
  return (
    <>
      <h1>
        {"Parking "} {params.id}
      </h1>
    </>
  );
}
