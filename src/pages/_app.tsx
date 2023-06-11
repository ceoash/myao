import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();


export default function App({ 
  Component, 
  pageProps: {...pageProps} }: AppProps) {
   
  return <SessionProvider session={pageProps.session}>
    
    
    <Component {...pageProps} />
  </SessionProvider>

}
