import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Loading from '@/components/LoadingScreen';
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
