import { Abi as AbiSchema } from "abitype/zod";
import { isAddress } from "viem";
import { z } from "zod";
import { getSupportedChains } from "./supported-chains.js";

const SourcifyResponseSchema = z.object({ abi: AbiSchema });

export const GetAbiSchema = z.object({
  chainId: z
    .number({ message: "Unsupported chain ID" })
    .refine(async (chainId) => {
      const supportedChains = await getSupportedChains();
      return supportedChains.some((chain) => chain.chainId === chainId);
    })
    .describe("Chain ID to get ABI from"),
  address: z
    .string({ message: "Address must be a valid Ethereum address" })
    .refine((address) => isAddress(address))
    .describe("Address to get ABI for"),
});

export async function getAbi({
  chainId,
  address,
}: z.infer<typeof GetAbiSchema>) {
  const response = await fetch(
    `https://sourcify.dev/server/v2/contract/${chainId}/${address}?fields=abi`,
  );
  if (response.status === 404) {
    throw new Error("Contract not found in Sourcify repository");
  }

  const data = await response.json();
  const parsedData = SourcifyResponseSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error("Invalid response from Sourcify repository");
  }

  return parsedData.data.abi;
}
