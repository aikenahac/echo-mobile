import { UserBookScreenParams } from "@/lib/types/search-params";
import { useLocalSearchParams } from "expo-router";

export function useUserBookParams(): UserBookScreenParams {
  const params = useLocalSearchParams();

  return {
    userBookId: String(params.userBookId)
  }
}