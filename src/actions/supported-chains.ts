import { QueryClient } from "@tanstack/query-core";
import { z } from "zod";

const staleTime = process.env.STALE_TIME
  ? Number(process.env.STALE_TIME)
  : // biome-ignore lint/style/useNumberNamespace: Default stale time
    Infinity;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime },
  },
});

const SupportedChainsResponseSchema = z.array(
  z.object({ name: z.string(), chainId: z.number(), supported: z.boolean() }),
);

export async function getSupportedChains() {
  return queryClient.fetchQuery({
    queryKey: ["supported-chains"],
    queryFn: async () => {
      const response = await fetch("https://sourcify.dev/server/chains");
      const data = await response.json();
      const parsedData = SupportedChainsResponseSchema.parse(data);
      return parsedData
        .filter(({ supported }) => supported)
        .map(({ name, chainId }) => ({ name, chainId }));
    },
  });
}
