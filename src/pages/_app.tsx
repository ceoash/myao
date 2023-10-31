import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();
import dotenv from "dotenv";
import { initializeSocket, SocketProvider } from "@/context/SocketContext";
import { UnreadMessagesProvider } from "@/context/UnreadMessagesContext";
import { StripeProvider } from "@/context/StripeContext";
import { AlertProvider } from "@/providers/AlertProvider";

export default function App({
  Component,
  pageProps: { ...pageProps },
}: AppProps) {
  dotenv.config();

  const socket = initializeSocket();

  return (

    <SocketProvider socket={socket}>
      <SessionProvider session={pageProps.session}>
        <UnreadMessagesProvider>
          <StripeProvider>
            <AlertProvider>
              <Component {...pageProps} />
            </AlertProvider>
          </StripeProvider>
        </UnreadMessagesProvider>
      </SessionProvider>
    </SocketProvider>
  );
}
