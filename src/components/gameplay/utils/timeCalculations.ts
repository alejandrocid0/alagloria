
export const calculateTimeValues = (scheduledTime: string | null) => {
  const currentTime = new Date();
  const parsedScheduledTime = scheduledTime ? new Date(scheduledTime) : null;
  const isBeforeGameStart = parsedScheduledTime && currentTime < parsedScheduledTime;
  
  const timeUntilStartInMinutes = parsedScheduledTime 
    ? Math.max(0, Math.floor((parsedScheduledTime.getTime() - currentTime.getTime()) / (1000 * 60))) 
    : 0;
  
  const timeUntilStartInSeconds = parsedScheduledTime 
    ? Math.max(0, Math.floor((parsedScheduledTime.getTime() - currentTime.getTime()) / 1000)) 
    : 0;
  
  const isWithinFiveMinutes = timeUntilStartInMinutes <= 5;

  return {
    isBeforeGameStart,
    timeUntilStartInMinutes,
    timeUntilStartInSeconds,
    isWithinFiveMinutes
  };
};
