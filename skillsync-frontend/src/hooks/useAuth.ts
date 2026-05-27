import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, loginUser, registerUser, updateMyProfile } from "../api/auth";
import { authStore } from "../store/authStore";

/** Handles login, registration, profile bootstrap and profile updates. */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const store = authStore();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
    enabled: store.isAuthenticated,
    staleTime: 30_000,
    retry: false
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (tokens) => {
      store.setTokens(tokens);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  const registerMutation = useMutation({ mutationFn: registerUser });
  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  return { profileQuery, loginMutation, registerMutation, updateProfileMutation };
};
