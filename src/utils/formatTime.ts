export function timeSince(date: Date) {
  var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  var interval = seconds / 31536000;
  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return Math.floor(interval) + " year";
    }
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return Math.floor(interval) + " month";
    }
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;

  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return Math.floor(interval) + " day";
    }
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return Math.floor(interval) + " hour";
    }
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return Math.floor(interval) + " mintue";
    }
    return Math.floor(interval) + " minutes";
  }
  if (Math.floor(interval) === 1) {
    return Math.floor(interval) + " second";
  }
  return Math.floor(seconds) + " seconds";
}

export function timeInterval(
  createdAt: Date,
  setTimeSinceCreated: (timeSinceCreated: string) => void
) {
  const updateTimeSinceCreated = () => {
    const currentTime = new Date();
    const elapsed = currentTime.getTime() - createdAt.getTime();
    let interval = 10000; // Default interval: 10 seconds

    if (elapsed >= 60 * 1000) {
      // 1 minute or more
      interval = 60000; // 1 minute
    }
    if (elapsed >= 60 * 60 * 1000) {
      // 1 hour or more
      interval = 60 * 60 * 1000; // 1 hour
    }
    if (elapsed >= 24 * 60 * 60 * 1000) {
      // 1 day or more
      interval = 24 * 60 * 60 * 1000; // 1 day
    }
    if (elapsed >= 30 * 24 * 60 * 60 * 1000) {
      // 1 month or more
      interval = 30 * 24 * 60 * 60 * 1000; // 1 month
    }
    if (elapsed >= 365 * 24 * 60 * 60 * 1000) {
      // 1 year or more
      interval = 365 * 24 * 60 * 60 * 1000; // 1 year
    }

    setTimeSinceCreated(timeSince(createdAt));
    setTimeout(updateTimeSinceCreated, interval);
  };

  updateTimeSinceCreated();
}
