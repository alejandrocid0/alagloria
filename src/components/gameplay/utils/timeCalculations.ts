
/**
 * Calculate time values for game scheduling
 */
export function calculateTimeValues(scheduledTime: string | Date) {
  const currentTime = new Date().getTime();
  const gameTime = new Date(scheduledTime).getTime();
  const timeUntilStartInMs = gameTime - currentTime;
  
  // Convert to minutes and seconds
  const timeUntilStartInMinutes = Math.floor(timeUntilStartInMs / 60000);
  const timeUntilStartInSeconds = Math.floor(timeUntilStartInMs / 1000);
  
  // Check if game is scheduled to start within 5 minutes
  const isWithinFiveMinutes = timeUntilStartInMinutes <= 5 && timeUntilStartInMinutes >= 0;
  
  // Check if we're before game start
  const isBeforeGameStart = timeUntilStartInMs > 0;
  
  return {
    isBeforeGameStart,
    timeUntilStartInMinutes,
    timeUntilStartInSeconds,
    isWithinFiveMinutes
  };
}
