"use client";

import { useEffect } from "react";
import { Button, Flex, Heading, Text } from "@/once-ui/components";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Flex
      fillWidth
      direction="column"
      alignItems="center"
      justifyContent="center"
      gap="l"
      paddingY="128"
    >
      <Heading variant="display-strong-m">Something went wrong!</Heading>
      <Text variant="body-default-l" onBackground="neutral-weak">
        {error.message || "An unexpected error occurred."}
      </Text>
      <Button onClick={() => reset()} variant="primary">
        Try again
      </Button>
    </Flex>
  );
}
