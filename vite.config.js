import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
  };

  if (command == "build") {
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
