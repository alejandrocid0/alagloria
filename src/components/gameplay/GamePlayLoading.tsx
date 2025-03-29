
import Navbar from '@/components/Navbar';

const GamePlayLoading = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-20 md:pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gloria-purple/20 border-t-gloria-purple rounded-full"></div>
      </div>
    </div>
  );
};

export default GamePlayLoading;
