import { Platform } from "react-native";

// Keep the native map implementation out of the web bundle.
const MapScreen =
  Platform.OS === "web"
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ? require("./map-screen.web").default
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : require("./map-screen.native").default;

export default MapScreen;
