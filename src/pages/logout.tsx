import Loading from '@/components/LoadingScreen';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

const Logout = () => {
  const router = useRouter();
  const session = useSession();
  useEffect(() => {
    if(session?.status === 'authenticated') {
        signOut()
    }
    router.push('/login');
  }, [session?.status]);

  return (
    <div>
      <Loading />
    </div>
  );
};

export default Logout;
