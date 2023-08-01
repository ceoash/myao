export function timeSince(dateString: string | Date, short: boolean = false) {

  const date = new Date(dateString);

  var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return `${Math.floor(interval)}${short ? "Y" : " year ago"}`
    }
    return `${Math.floor(interval)}${short ? "Y" : "  years ago"}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return `${Math.floor(interval)}${short ? "M" : " month ago"}`;
    }
    return `${Math.floor(interval)}${short ? "M" : " months ago"}`;
  }
  interval = seconds / 604800;

  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return `${Math.floor(interval)}${short ? "W" : " week ago"}`;
    }
    return `${Math.floor(interval)}${short ? "W" : " weeks ago"}`;
  }
  interval = seconds / 86400;

  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return `${Math.floor(interval)}${short ? "D" : " day ago"}`;
    }
    return `${Math.floor(interval)}${short ? "D" : " days ago"}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return `${Math.floor(interval)}${short ? "H" : " hour ago"}`;
    }
    return `${Math.floor(interval)}${short ? "H" : " hours ago"}`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return `${Math.floor(interval)}${short ? "Min" : " minute ago"}`;
    }
    return `${Math.floor(interval)}${short ? "Mins" : " minutes ago"}`;
  }
  if (Math.floor(interval) === 1) {
    return "Just now";
  }
  return "Just now";
}

export function timeInterval(
  createdAt: Date,
  setTimeSinceCreated: (timeSinceCreated: string) => void,
  short: boolean = false
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

export function getTimeOfDay() {
  const date = new Date();
  const hour = date.getHours();

  if (hour >= 0 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export function msToTime(ms: number) {
  let seconds = (ms / 1000).toFixed(1);
  let minutes = (ms / (1000 * 60)).toFixed(1);
  let hours = (ms / (1000 * 60 * 60)).toFixed(1);
  let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (Number(seconds) < 60) return String(Math.trunc(Number(seconds))) + " Sec";
  else if (Number(minutes) < 60) return String(Math.trunc(Number(minutes))) + " Min";
  else if (Number(hours) < 24) return String(Math.trunc(Number(hours))) + " Hrs";
  else return String(Math.trunc(Number(days))) + " Days"
}
