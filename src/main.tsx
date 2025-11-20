import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WagmiConfig, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig, ConnectKitProvider } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const config = createConfig(
  getDefaultConfig({
    appName: "JTrace",
    walletConnectProjectId: "YOUR_WALLETCONNECT_PROJECT_ID", // ganti
    chains: [sepolia],
  })
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <ConnectKitProvider>
          <App />
        </ConnectKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  </React.StrictMode>
);
