import { useQuery } from 'react-query';
import axios from 'axios';

async function fetchDirectMessages(userId: any, recipientId: any) {
  const { data } = await axios.get(`/api/direct-messages?userId=${userId}&recipientId=${recipientId}`);
  return data;
}

export default function useDirectMessages(userId: any, recipientId: any) {
  return useQuery(['directMessages', userId, recipientId], () => fetchDirectMessages(userId, recipientId), {
    staleTime: 1000 * 60 * 5, // data will be considered fresh for 5 minutes
  });
}