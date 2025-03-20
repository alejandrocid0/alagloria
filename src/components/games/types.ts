
export interface Game {
  id: string;
  title: string;
  date: Date;
  description: string | null;
  participants: number;
  maxParticipants: number;
  prizePool: number;
  image: string | undefined;
  category: string;
}
