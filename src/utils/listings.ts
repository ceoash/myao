import prisma from "@/libs/prismadb";
interface Offer {
    price: number;
    createdAt: string; // Assuming the createdAt is a string representation of a date
  }
  
  interface AggregatedData {
    price: number;
    createdAt: string;
  }
  
  // Utility function to add intervals to a date
  const addIntervals = (date: Date, hours: number): number => date.getTime() + hours * 60 * 60 * 1000;
  
  // Function to determine the interval based on the difference in days
  const determineIntervalHours = (diffDays: number): number => {
    if (diffDays <= 5 / 24) return 1;
    if (diffDays <= 0.5) return 2;
    if (diffDays <= 1) return 4;
    if (diffDays <= 3) return 12;
    if (diffDays <= 5) return 24;
    if (diffDays <= 14) return 48;
    if (diffDays <= 30) return 24 * 7;
    return Number.MAX_SAFE_INTEGER;
  };
  
  // Function to aggregate data based on intervals
  const aggregateDataByInterval = (data: Offer[], intervalHours: number): AggregatedData[] => {
    let aggregatedData: AggregatedData[] = [];
    let currentDate = new Date(Math.min(...data.map((offer) => new Date(offer.createdAt).getTime())));
    const maxDate = new Date(Math.max(...data.map((offer) => new Date(offer.createdAt).getTime())));
  
    while (currentDate <= maxDate) {
      const endDate = new Date(addIntervals(currentDate, intervalHours));
      const offersInInterval = data.filter((offer) => {
        const offerDate = new Date(offer.createdAt);
        return offerDate >= currentDate && offerDate < endDate;
      });
  
      const total = offersInInterval.reduce((acc, curr) => acc + curr.price, 0);
      if (offersInInterval.length > 0) {
        aggregatedData.push({ price: total, createdAt: currentDate.toISOString() });
      }
      currentDate = endDate;
    }
  
    return aggregatedData;
  };
  
  interface Session {
    user: {
      id: string;
    };
  }
  
  // Simplified function to fetch and configure chart data
  export const fetchAndConfigureChartData = async (id: string, session: Session): Promise<{ filteredSessionOffers: AggregatedData[]; filteredParticipantOffers: AggregatedData[] }> => {

    const sessionOffers: any[]  = await prisma.bid.findMany({ 
        where: {
            listingId: id,
            userId: session.user.id,
        }
     });
    const participantOffers: any[] = await prisma.bid.findMany({ 
        where: {
            listingId: id,
            userId: {
                not: session.user.id,
            },
        }
     });
  
    // Determine interval hours based on the overall data range
    const allOffers = [...sessionOffers, ...participantOffers];
    const diffDays = (Math.max(...allOffers.map((offer) => new Date(offer.createdAt).getTime())) - Math.min(...allOffers.map((offer) => new Date(offer.createdAt).getTime()))) / (1000 * 60 * 60 * 24);
    const intervalHours = determineIntervalHours(diffDays);
  
    // Aggregate offers
    const aggSOffers = aggregateDataByInterval(sessionOffers, intervalHours);
    const aggPOffers = aggregateDataByInterval(participantOffers, intervalHours);
  
    // Filter out entries where both offers are 0 for the same interval
    const filteredSessionOffers = aggSOffers.filter(({ createdAt }) => aggPOffers.some(offer => offer.createdAt === createdAt && offer.price > 0));
    const filteredParticipantOffers = aggPOffers.filter(({ createdAt }) => aggSOffers.some(offer => offer.createdAt === createdAt && offer.price > 0));
  
    return { filteredSessionOffers, filteredParticipantOffers };
  };
  