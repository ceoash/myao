import getConversationById from '@/actions/getConversationById';
import getCurrentUser from '@/actions/getCurrentUser';
import { AdminConversation, AdminDirectMessage, IUser } from '@/interfaces/authenticated';
import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import React, { useEffect } from 'react'

    
interface Props {
    conversation: AdminConversation;
    session: Session;
    currentUser: IUser;
}
const index = ({
    conversation,
    session,
    currentUser
}: Props) => {


    const [messages, setMessages] = React.useState<AdminDirectMessage[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [status, setStatus] = React.useState('');

    useEffect(() => {
        const reverseMessages = [ ...conversation.directMessages ].reverse();
        setMessages(reverseMessages);
        setLoading(false);
    },[conversation.directMessages])
  return (
   
<div className="relative overflow-x-auto shadow-md sm:rounded-lg p-4">
    <div className=''>
    <h2>Conversation</h2>
    <h5 className='text-gray-500 mb-6 -mt-4'>ID: {conversation.id}</h5>

    </div>
    <div className="flex items-center justify-between pb-4 bg-white ">
        <div>
            <button id="dropdownActionButton" data-dropdown-toggle="dropdownAction" className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-3 py-1.5    " type="button">
                <span className="sr-only">Action button</span>
                Action
                <svg className="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                </svg>
            </button>
            
            <div id="dropdownAction" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                <ul className="py-1 text-sm text-gray-700 " aria-labelledby="dropdownActionButton">
                    <li>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100  ">Reward</a>
                    </li>
                    <li>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100  ">Promote</a>
                    </li>
                    <li>
                        <a href="#" className="block px-4 py-2 hover:bg-gray-100  ">Activate account</a>
                    </li>
                </ul>
                <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100   ">Delete User</a>
                </div>
            </div>
        </div>
        <label htmlFor="table-search" className="sr-only">Search</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input type="text" id="table-search-users" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50      " placeholder="Search for users" />
        </div>
    </div>
    <table className="w-full text-sm text-left text-gray-500 ">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
            <tr>
           
                <th></th>
                <th scope="col" className="px-6 py-3">
                    User
                </th>
                <th scope="col" className="px-6 py-3">
                    Message
                </th>
                <th scope="col" className="px-6 py-3">
                   Conversation ID
                </th>
                <th scope="col" className="px-6 py-3">
                   Message ID
                </th>
               
                <th scope="col" className="px-6 py-3">
                    Created
                </th>
               
            </tr>
        </thead>
        <tbody>
            
            {loading ? 'Loading' : messages.map((message, i) => {

                return(
                <tr key={message?.id} className="bg-white border-b   hover:bg-gray-50 ">
                <td>{i + 1}</td>
                
                
                <td className="px-6 py-4">
                    <div className='text-gray-800'>{message?.user.username}</div>
                    <div className='text-gray-500 text-sm'>{message?.user.id}</div>
                </td>
                <td className="px-6 py-4">
                    { message?.text && message.text.length > 20 ? message?.text?.slice(0, 40) + '...' : message?.text}  
                </td>

                <td className="px-6 py-4">
                    <div className="pl-3">
                        <div >{conversation?.id}</div>
                    </div>  
                </td>
                <td className="px-6 py-4">
                    <div className="pl-3">
                        <div >{message?.id}</div>
                    </div>  
                </td>
                
                <td className="px-6 py-4">
                    {new Date(conversation?.createdAt).toLocaleDateString(
                        "en-gb",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                    ) }
                </td>
                
            </tr>)
            }) }
        </tbody>
    </table>
</div>

  )
}


export const getServerSideProps: GetServerSideProps = async (context) => {

    const session = await getSession(context);
  
    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const conversationId = context.params?.id as string;


    const currentUser = await getCurrentUser(session);
    const conversation = await getConversationById(conversationId);
  
    return {
      props: {
        conversation,
        session,
        currentUser,
      },
    };
  };
  
  export default index;