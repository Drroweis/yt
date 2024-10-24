import React from 'react';
import type { Prize } from '../../types/game';

interface PrizeSectorProps {
  prize: Prize;
  index: number;
  totalPrizes: number;
}

const PrizeSector: React.FC<PrizeSectorProps> = ({ prize, index, totalPrizes }) => {
  const IconComponent = prize.icon;
  const angle = 360 / totalPrizes;
  const rotation = angle * index;

  return (
    <div
      className="absolute w-full h-full origin-center"
      style={{
        transform: `rotate(${rotation}deg)`,
        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(Math.PI / totalPrizes)}% ${50 - 50 * Math.sin(Math.PI / totalPrizes)}%)`
      }}
    >
      {/* Sector background with separator */}
      <div className="absolute inset-0 bg-[#e8f5e9]">
        {/* Sector separator line */}
        <div className="absolute top-0 right-0 w-[2px] h-full bg-[#7dff00]/50 transform -translate-x-1/2"></div>
        
        {/* Prize content */}
        <div
          className="absolute top-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2"
          style={{ transform: `rotate(${angle / 2}deg)` }}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${prize.color.replace('text-', 'bg-').replace('500', '100')} shadow-lg`}>
            <IconComponent className={`w-7 h-7 ${prize.color}`} />
          </div>
          <span className="text-base font-bold text-gray-800 drop-shadow-md">
            {prize.symbol}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrizeSector;