import { timeInterval } from "@/utils/formatTime";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface BidProps {
  bid: any;
  participant: any;
  me: any;
}

const Bid = ({ bid, participant, me }: BidProps) => {

  if (!participant || !me) return null;
  console.log(me)
  
    const [timeSinceCreated, setTimeSinceCreated] = useState<string>("");
  
  useEffect(() => {
    if (!bid.createdAt) return;
    const created = new Date(bid?.createdAt);
    timeInterval(created, setTimeSinceCreated);
  }, []);

  const direction = Number(bid?.price) > Number(bid?.previous) 

  const now = Date.now();

  return (
    <div className="flex gap-4 justify-between py-2 mb-2 border-b border-gray-200">
      <div className="flex items-center">
        <div className={`w-4 mr-2`}>
          <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1280.000000 1280.000000"
            preserveAspectRatio="xMidYMid meet"
            className={direction ? "text-green-500" : "text-red-500 rotate-180"}
          >
            <g
              transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
              fill="currentColor"
              stroke="none"
            >
              <path
                d="M6238 12785 c-140 -27 -278 -90 -388 -178 -30 -24 -242 -224 -470
                              -443 -229 -220 -1466 -1406 -2750 -2637 -1284 -1231 -2367 -2274 -2406 -2318
                              -83 -94 -151 -217 -190 -344 -25 -81 -27 -105 -27 -240 0 -134 2 -159 26 -238
                              94 -307 304 -517 614 -614 l88 -28 1472 -3 1473 -2 2 -2513 3 -2512 28 -85
                              c114 -341 383 -571 724 -620 56 -8 628 -10 2013 -8 2061 4 1936 1 2075 46 231
                              75 445 280 535 514 64 165 60 -7 60 2704 l0 2474 1473 2 1472 3 88 28 c308 96
                              521 309 613 612 25 81 27 105 27 240 0 134 -2 159 -26 238 -46 148 -119 275
                              -219 379 -29 30 -766 739 -1638 1574 -872 836 -2107 2021 -2745 2633 -638 612
                              -1187 1135 -1220 1162 -78 63 -219 133 -320 160 -106 27 -283 34 -387 14z"
              />
            </g>
          </svg>
        </div>
        <div>
          <span className="font-extrabold">£{Number(bid?.price).toLocaleString()}</span> by{" "}
          <Link
            href={`/dashboard/profile/${participant && me ? bid.userId === me.id ? me.id : participant.id : bid?.userId }`}
            className="underline"
          >
            {participant && me ? bid.userId === me.id ? 'You' : participant.username : bid?.userId}
          </Link>
        </div>{" "}
      </div>

      <div className="text-gray-500 text-sm italic">{timeSinceCreated || 'just now'}</div>
    </div>
  );
};

export default Bid;
