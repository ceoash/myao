import Button from "./dashboard/Button";
import axios from "axios";
import { Session } from "next-auth";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { FaCreditCard } from "react-icons/fa";

interface PreviewPageProps {
  listing: {
    id: string;
    title: string;
    price: number;
    buyer: {
      id: string;
      username: string;
    };
    seller: {
      id: string;
      username: string;
    };
    status: string;
    image: string;
  };
  session: Session;
  handleStatusChange: (status: string, userId: string) => void;
}

const PreviewPage = ({
  listing,
  session,
  handleStatusChange,
}: PreviewPageProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      isMounted &&
        toast.success(
          "Payment complete -- You will receive an email confirmation shortly with further instructions."
        );
      handleStatusChange("completed", session?.user.id);
      return;
    }

    if (query.get("canceled")) {
      isMounted && toast.error("Payment canceled -- please try again.");
      return;
    }
  }, [isMounted]);

  const submitPayment = async () => {
    const data = {
      title: listing.title,
      price: listing.price,
      id: listing.id,
    };

    const res = await axios.post("/api/checkout_sessions", {
      data: data,
    });
  };

  return (
    <form action="/api/checkout_sessions" className="w-full" method="POST">
      <input type="hidden" value={listing.price} name="price" />
      <input type="hidden" value={listing.title} name="title" />
      <input type="hidden" value={listing.id} name='id' />
      {/*  
      <input type="hidden" value={listing.buyer.id} name='buyerId' />
      <input type="hidden" value={listing.seller.id} name='sellerId' />
      <input type="hidden" value={listing.status} name='status' />
      <input type="hidden" value={listing.image} name='image' />
      <input type="hidden" value={session?.user.id} name='sessionUser' /> */}
        <Button submit options={{ size: "lg" }} accept>
          <FaCreditCard className="mr-1" />
          Pay
        </Button>
    </form>
  );
};

export default PreviewPage;
