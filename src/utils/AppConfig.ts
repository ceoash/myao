export const AppConfig = {
  site_name: 'MYAO',
  title: 'Make You An Offer',
  description: 'This is the Make You An Offer application.',
  locale: 'en',
  siteUrl: process.env.NEXT_PUBLIC_URL || 'https://myao.vercel.app',
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL, // || 'http://localhost:3001'
};
