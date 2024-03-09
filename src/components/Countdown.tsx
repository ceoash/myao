import React, { useState, useEffect } from "react";

function CountdownTimer({
  date,
  children,
  className,
}: {
  date: string | Date;
  children?: React.ReactNode;
  className?: string;
}) {
  // Calculate 24 hours after the set date
  const targetDate =
    typeof date === "string"
      ? new Date(date).getTime() + 24 * 60 * 60 * 1000
      : date.getTime() + 24 * 60 * 60 * 1000;

  // Initialize state with the time left until the target date
  const [timeLeft, setTimeLeft] = useState(targetDate - new Date().getTime());

  useEffect(() => {
    // Update the countdown every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // Update state with new time left
      setTimeLeft(distance);

      // If the count down is over, stop the interval
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(0); // Optional: Set timeLeft to 0 or some other indication that the countdown is over
      }
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [targetDate]);

  // Convert timeLeft from milliseconds to hours:minutes:seconds
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  if (timeLeft === 0)
    return (
      <div className={`text-red-400 italic ${className}`}>Too Late! Offer has expired</div>
    );
  return (
    <div>
      <div className={`text-red-400 text-center flex gap-1 italic ${className}`}>
        <p className="">Expires in:</p>
        <div>
          {hours > 0 && `${hours}h`} {minutes > 0 && `${minutes}m`} {seconds > 0 && `${seconds}s`}
        </div>
      </div>
      {children}
    </div>
  );
}

export default CountdownTimer;
