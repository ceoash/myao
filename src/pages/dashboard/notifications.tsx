import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import prisma from "@/libs/prismadb";

interface notificationsProps {
    notifications: any;
    count: number;
}

const notifications = ({
    notifications,
    count
}: notificationsProps) => {
  return (
    <div>
      <h1>Notifications</h1>
      <p>Count: {count}</p>
      <ul>
        {notifications.map((notification: any) => (
          <li key={notification.id}>
            {notification.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default notifications

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

    const notifications = await prisma.notification.findMany({
        where: {
            userId: session.user.id
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    const count = await prisma.notification.count({
        where: {
            userId: session.user.id,
            read: false
        }
    });

    const transform = notifications.map((notification) => {
        return {
            ...notification,
            createdAt: notification.createdAt.toString(),
            updatedAt: notification.updatedAt.toString()
        }
    });
    
    return {
        props: {
            notifications: transform,
            count
        }
    }
}