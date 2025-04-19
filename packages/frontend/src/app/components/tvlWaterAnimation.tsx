"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Contribution {
  address: string;
  amount: number;
  chain: string;
}

interface Contributor {
  address: string;
  amount: number;
  chain: string;
}

export default function TVLWaterAnimation() {
  const [currentTVL, setCurrentTVL] = useState<number>(310997157);
  const [targetTVL, setTargetTVL] = useState<number>(1000000000);
  const [recentContribution, setRecentContribution] = useState<Contribution | null>(null);
  const [fillPercentage, setFillPercentage] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const waveRef = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();

  // Set window width after component mounts (client-side only)
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    
    // Optional: Update windowWidth on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate fill percentage on mount and when TVL changes
  useEffect(() => {
    const percentage = Math.min(100, (currentTVL / targetTVL) * 100);
    setFillPercentage(percentage);
  }, [currentTVL, targetTVL]);

  // Simulate random TVL increases
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const contribution = Math.floor(Math.random() * 50000) + 10000;
        setCurrentTVL(prev => prev + contribution);
        
        // Show contribution toast
        setRecentContribution({
          address: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
          amount: contribution,
          chain: ['Ethereum', 'Solana', 'Avalanche', 'Polygon'][Math.floor(Math.random() * 4)]
        });
        
        // Clear contribution toast after 4 seconds
        setTimeout(() => {
          setRecentContribution(null);
        }, 4000);
        
        // Animate water movement
        controls.start({
          y: [0, -10, 0],
          transition: { duration: 0.6, ease: "easeInOut" }
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [controls]);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-blue-900/40 overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400 mb-2">SUI Ecosystem TVL</h2>
        <p className="text-gray-300">Let's pump the Sui ecosystem and push TVL to the moon! 🚀</p>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* TVL Container with Water Animation */}
        <div className="w-full md:w-2/3 relative">
          <div className="bg-gray-900 p-5 rounded-xl border border-blue-800/30 relative h-[300px] overflow-hidden">
            <div className="absolute inset-x-0 top-3 flex justify-between items-center px-4 z-10">
              <div className="bg-blue-900/40 px-3 py-1 rounded-lg backdrop-blur-sm">
                <span className="text-blue-200 text-sm">Target: </span>
                <span className="text-white font-bold">${(targetTVL / 1000000).toFixed(1)}M</span>
              </div>
              <div className="bg-gradient-to-r from-green-900/60 to-blue-900/60 px-3 py-1 rounded-lg backdrop-blur-sm">
                <span className="text-blue-200 text-sm">Current: </span>
                <span className="text-white font-bold">${(currentTVL / 1000000).toFixed(2)}M</span>
              </div>
            </div>
            
            {/* Progress Percentage */}
            <div className="absolute inset-x-0 top-16 z-10 text-center">
              <span className="text-4xl font-bold text-white drop-shadow-lg">{fillPercentage.toFixed(1)}%</span>
              <span className="block text-blue-300 text-sm mt-1">Progress to Goal</span>
            </div>
            
            {/* Water Container */}
            <div className="absolute inset-0 flex flex-col-reverse overflow-hidden">
              <motion.div 
                ref={waveRef}
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 relative"
                style={{ height: `${fillPercentage}%` }}
                animate={controls}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {/* Wave overlay */}
                <div className="absolute -top-10 left-0 w-[200%] h-20">
                  {windowWidth > 0 && (
                    <motion.div 
                      className="w-full h-full"
                      style={{
                        backgroundImage: "url('/wave.svg')",
                        backgroundRepeat: "repeat-x",
                        backgroundSize: "50% 100%",
                      }}
                      animate={{ 
                        x: [0, -windowWidth / 2], 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 10, 
                        ease: "linear"
                      }}
                    />
                  )}
                </div>
                
                {/* Random bubbles */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white opacity-60"
                    style={{
                      width: Math.random() * 10 + 5 + "px",
                      height: Math.random() * 10 + 5 + "px",
                      left: Math.random() * 100 + "%",
                      bottom: Math.random() * 100 + "%"
                    }}
                    animate={{
                      y: [-20, 0],
                      opacity: [0.6, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: Math.random() * 2 + 1,
                      delay: Math.random() * 5
                    }}
                  />
                ))}
              </motion.div>
            </div>
            
            {/* Rocket animation */}
            <motion.div
              className="absolute right-8 z-10"
              style={{ bottom: `${fillPercentage}%` }}
              animate={{
                y: [0, -5, 0],
                rotate: [-2, 2, -2]
              }}
              transition={{
                repeat: Infinity,
                duration: 2
              }}
            >
              <Image
                src="/rocket.png"
                alt="Rocket"
                width={60}
                height={60}
                className="drop-shadow-lg"
              />
            </motion.div>
          </div>
          
          {/* Recent contribution toast notification */}
          <AnimatePresence>
            {recentContribution && (
              <motion.div
                className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-900/90 to-blue-900/90 rounded-lg p-3 backdrop-blur-md shadow-lg border border-green-500/30 z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", damping: 20 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-400 font-medium">New contributor! 🔥</p>
                    <p className="text-white text-sm">
                      {recentContribution.address} just added ${(recentContribution.amount / 1000).toFixed(1)}K from {recentContribution.chain}!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Call to Action */}
        <div className="w-full md:w-1/3 space-y-4">
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-600/30">
            <h3 className="text-xl font-bold text-blue-300 mb-3">💧 Help Fill The Pool</h3>
            <p className="text-gray-300 mb-3">Add liquidity to SUI ecosystem and earn rewards. Join the movement!</p>
            
            <div className="flex space-x-2 mb-4">
              {['🚀', '🔥', '💰', '🌊'].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="w-10 h-10 flex items-center justify-center bg-blue-800/50 rounded-lg text-lg"
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
            
            <motion.button
              className="w-full py-2.5 rounded-md font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Connect Wallet to Contribute
            </motion.button>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-blue-800/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-blue-300">Top Contributors</h4>
              <span className="text-xs bg-blue-900/40 px-2 py-1 rounded text-blue-200">LAST 24 HRS</span>
            </div>
            <div className="space-y-2">
              {[
                { address: "0xf4d...a9b2", amount: 320000, chain: "ETH" },
                { address: "0x3c8...d71e", amount: 180000, chain: "SOL" },
                { address: "0x9a5...34fc", amount: 120000, chain: "AVAX" }
              ].map((contributor: Contributor, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-blue-900/10 last:border-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-bold text-blue-300">
                      {i+1}
                    </div>
                    <span className="text-sm text-gray-300 font-mono">{contributor.address}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-green-400 font-medium">${(contributor.amount / 1000).toFixed(1)}K</span>
                    <span className="text-xs text-gray-400 ml-1">({contributor.chain})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Cross-chain TVL contribution to SUI ecosystem is growing rapidly. Bridge your assets from any chain with Wormhole and earn high yield while supporting next-gen L1.
        </p>
      </div>
    </div>
  );
}