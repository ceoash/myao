import { Prisma } from '@prisma/client';
import { GetServerSideProps } from 'next';
import React, { useEffect } from 'react'
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import Loading from '@/components/LoadingScreen';

const Connect = ({}) => {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');
        const connectTo = urlParams.get('connectToUsername');
        const connectToId = urlParams.get('connectToId');

        console.log(token, email, connectTo, connectToId);
        
        if (token) {
          axios.post('/api/connect-login', { email, token, connectTo, connectToId })
            .then((res) => {
              const user = res.data.user;
              
                signIn('credentials', {
                    email: email,
                    password: token, 
                    callbackUrl: `${window.location.origin}/dashboard/wizard`
                });
            })
            .catch((err) => {
              console.log(err);
              toast.error(err.response.data.message);
            });
        }
      }, []);

      return <Loading />
  
}



export default Connect;
