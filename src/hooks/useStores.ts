import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores";

export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: storesService.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStore(id: string | undefined) {
  return useQuery({
    queryKey: ["stores", id],
    queryFn: () => storesService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyStores(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["my-stores", ownerId],
    queryFn: () => storesService.getByOwner(ownerId!),
    enabled: !!ownerId,
  });
}
