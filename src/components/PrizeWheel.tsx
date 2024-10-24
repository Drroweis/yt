import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameStore';
import useAuthStore from '../store/authStore';
import { endpoints } from '../config/api';
import SpinCounter from './SpinCounter';
import PrizeSector from './wheel/PrizeSector';
import WheelIndicator from './wheel/WheelIndicator';
import { PRIZES } from './game/prizeConfig';
import type { Prize } from '../types/game';

const PrizeWheel: React.FC = () => {
  const { user } = useAuthStore();
  const { spinsLeft, isSpinning, setSpinning, decrementSpins, setLastPrize } = useGameStore();
  const [rotation, setRotation] = useState(0);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [winSymbol, setWinSymbol] = useState<string | null>(null);

  const spinWheel = async () => {
    if (isSpinning || spinsLeft <= 0) return;
    
    setSpinning(true);
    setWinAmount(null);
    setWinSymbol(null);
    
    // Ensure wheel spins at least 5 full rotations plus random additional rotations
    const baseRotations = 5;
    const randomExtraRotations = Math.random() * 3; // 0 to 3 extra rotations
    const totalRotations = baseRotations + randomExtraRotations;
    
    // Calculate final rotation including the prize sector
    const randomPrizeIndex = Math.floor(Math.random() * PRIZES.length);
    const sectorAngle = 360 / PRIZES.length;
    const prizeRotation = sectorAngle * randomPrizeIndex;
    const finalRotation = rotation + (360 * totalRotations) + prizeRotation;
    
    setRotation(finalRotation);
    
    try {
      const response = await fetch(endpoints.game.spin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Spin failed');
      
      const data = await response.json();
      decrementSpins();
      
      // Wait for wheel to finish spinning before showing result
      setTimeout(() => {
        setSpinning(false);
        setLastPrize(PRIZES[randomPrizeIndex]);
        setWinAmount(data.prize.amount);
        setWinSymbol(data.prize.type);
      }, 5000);
    } catch (error) {
      setSpinning(false);
      console.error('Spin error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 px-4 max-w-7xl mx-auto w-full">
      {/* Prize Wheel Container */}
      <div className="relative w-full max-w-[min(80vmin,600px)] aspect-square">
        <div className="absolute inset-0 bg-black/50 rounded-full blur-xl"></div>
        
        {/* Wheel */}
        <motion.div
          className="relative w-full h-full rounded-full bg-[#e8f5e9] shadow-[0_0_20px_rgba(101,255,0,0.5)] border-[12px] border-[#7dff00] overflow-hidden"
          animate={{ 
            rotate: rotation,
          }}
          transition={{ 
            duration: 5,
            ease: [0.13, 0.99, 0.29, 1], // Custom easing for more realistic spinning
            type: "tween"
          }}
        >
          {/* Prize sectors */}
          {PRIZES.map((prize, index) => (
            <PrizeSector 
              key={prize.id}
              prize={prize}
              index={index}
              totalPrizes={PRIZES.length}
            />
          ))}
          
          {/* Center Button */}
          <button
            onClick={spinWheel}
            disabled={isSpinning || spinsLeft <= 0}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     w-20 h-20 rounded-full bg-gradient-to-r from-[#7dff00] to-[#5cb300]
                     text-white font-bold text-xl shadow-[0_0_20px_rgba(101,255,0,0.5)]
                     disabled:opacity-50 disabled:cursor-not-allowed z-10
                     border-4 border-[#7dff00] transition-all duration-300
                     hover:scale-105 active:scale-95"
          >
            {isSpinning ? '...' : 'GO'}
          </button>
        </motion.div>

        {/* Wheel Platform */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-8
                      bg-gradient-to-b from-[#7dff00] to-[#5cb300] rounded-[50%]
                      shadow-[0_0_20px_rgba(101,255,0,0.3)]"></div>

        {/* Wheel Indicator */}
        <WheelIndicator />
      </div>

      {/* Spin Counter */}
      <SpinCounter />

      {/* Prize Reveal */}
      <AnimatePresence>
        {winAmount !== null && winSymbol !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl shadow-xl text-center max-w-md w-full border border-[#7dff00]/30"
          >
            <h3 className="text-2xl font-bold mb-3 text-[#7dff00]">
              Congratulations! 🎉
            </h3>
            <p className="text-lg">
              You won{' '}
              <span className="font-bold text-[#7dff00]">{winAmount}</span>{' '}
              <span className={`font-bold ${PRIZES.find(p => p.symbol === winSymbol)?.color || ''}`}>
                {winSymbol}
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrizeWheel;