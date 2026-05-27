import { Redirect } from "expo-router";

import { AuthGate } from "../src/components/auth/AuthGate";
import { useAuth } from "../src/context/auth.context";

function IndexRedirect() {
  const { user } = useAuth();
  return <Redirect href={user ? "/(app)/homepage" : "/login"} />;
}

export default function Index() {
  return (
    <AuthGate mode="guest">
      <IndexRedirect />
    </AuthGate>
  );
}
