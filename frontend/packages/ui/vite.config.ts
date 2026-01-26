import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";

// 使用异步函数解决 ESM 兼容性问题
export default async () => {
  const UnoCSS = (await import("unocss/vite")).default;

  return defineConfig({
    plugins: [uni(), UnoCSS()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@zenspace/core": path.resolve(__dirname, "../core/src"),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss"; @import "@/styles/mixins.scss";`,
        },
      },
    },
    server: {
      port: 8080,
      host: "0.0.0.0",
    },
  });
};
