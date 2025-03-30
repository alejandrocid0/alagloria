
export const calculateTimeValues = (scheduledTime: string | Date | null) => {
  const currentTime = new Date();
  let parsedScheduledTime: Date | null = null;
  
  if (scheduledTime) {
    parsedScheduledTime = scheduledTime instanceof Date 
      ? scheduledTime 
      : new Date(scheduledTime);
  }
  
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
