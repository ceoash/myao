import { useState, useEffect } from 'react';
import axios from 'axios';
import { ProfileUser } from '@/interfaces/authenticated';



function useUserStats(activeSubTab: string, participant: ProfileUser | undefined, sessionUser: ProfileUser, setParticipant: (prev: any) => any) {
    const [loadingState, setLoadingState] = useState({ user: false });

    useEffect(() => {
        if (activeSubTab === "user") {
            const getUserStats = async () => {
                if (!participant) console.log("No participant");
                const userId = participant?.id;
                const url = `/api/dashboard/getUserStats`;

                try {
                    setLoadingState((prev) => ({ ...prev, user: true }));

                    const response = await axios.post(url, {
                        userId,
                        sessionId: sessionUser?.id,
                    });

                    const stats = response.data;
                    const totalListings = stats.sentCount + stats.receivedCount;
                    const totalCancelledListings = stats.cancelledSentCount + stats.cancelledReceivedCount;
                    const totalCompletedListings = stats.completedSentCount + stats.completedReceivedCount;
                    const trustScore = Math.trunc(((totalCompletedListings - totalCancelledListings) / totalListings) * 100);
          
                    setParticipant((prev: any) => ({ ...prev, ...stats, trustScore }));
                    setLoadingState((prev) => ({ ...prev, user: false }));

                    setLoadingState((prev) => ({ ...prev, user: false }));
                } catch (error) {
                    console.error(error);
                }
            };

            getUserStats();
        }
    }, [activeSubTab]);

    return loadingState;
}

export default useUserStats