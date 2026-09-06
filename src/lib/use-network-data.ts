import { useQuery } from "@tanstack/react-query";
import * as mock from "@/data/network";
import { getNetworkData, type NetworkData } from "./civic-db.functions";

const placeholder: NetworkData = {
  live: false,
  nodes: mock.nodes,
  identities: mock.identities,
  actions: mock.actions,
  networkStats: mock.networkStats,
};

/**
 * Live network state for every page. First paint uses the bundled
 * placeholder snapshot; the query swaps in real data from the external
 * Supabase database as soon as it answers (and keeps it fresh).
 */
export function useNetworkData(): NetworkData {
  const { data } = useQuery({
    queryKey: ["network-data"],
    queryFn: () => getNetworkData(),
    staleTime: 15_000,
    refetchInterval: 30_000,
    placeholderData: placeholder,
  });
  return data ?? placeholder;
}
