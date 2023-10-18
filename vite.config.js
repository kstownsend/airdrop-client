import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
  };

  if (command == "build") {
    console.log("building for production");
    const homepage = "https://willbreitkreutz.github.io/airdrop-client";
    return {
      ...config,
      ...{
        server: {
          host: true,
          origin: `${homepage}`,
        },
        define: {
          __API_ROOT__: `"https://airdrop.rsgis.dev"`,
        },
      },
    };
  } else {
    console.log("building for development");
    return {
      ...config,
      ...{
        define: {
          __API_ROOT__: `"http://localhost:3000"`,
        },
      },
    };
  }
});
