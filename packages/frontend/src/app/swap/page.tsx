"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WormholeConnect from "@wormhole-foundation/wormhole-connect";
import Image from "next/image";
import Link from "next/link";

// Define types for route data
interface BridgeRoute {
  from: string;
  to: string;
  label: string;
}

export default function SwapPage(): JSX.Element {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if wallet is connected on page load
  useEffect(() => {
    const storedAddress = localStorage.getItem("sui_address");
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Popular bridge routes data
  const popularRoutes: BridgeRoute[] = [
    { from: "ethereum", to: "sui", label: "ETH → SUI" },
    { from: "solana", to: "sui", label: "SOL → SUI" },
    { from: "polygon", to: "sui", label: "MATIC → SUI" },
    { from: "sui", to: "ethereum", label: "SUI → ETH" },
  ];

  return (
    <div className="min-h-screen w-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            <div>
              <h1 className="text-3xl font-bold text-white">Bridge Assets</h1>
              <p className="text-gray-400 mt-1">
                Move your tokens across blockchains with Wormhole Connect
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 px-4 py-2 rounded-lg transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Home
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Bridge Component */}
          <div className="md:col-span-2">
            <motion.div
              className="bg-gray-800 rounded-xl border border-blue-900/40 overflow-hidden shadow-xl h-[650px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              {isLoading ? (
                <div className="h-full flex justify-center items-center">
                  <div className="flex flex-col items-center">
                    <svg
                      className="animate-spin h-12 w-12 text-blue-500 mb-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-blue-300">Loading Wormhole Connect...</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Wallet Address Banner (if connected) */}
                  {walletAddress && (
                    <div className="p-3 bg-blue-900/20 border-b border-blue-900/30">
                      <div className="flex items-center justify-center space-x-2 p-2 bg-blue-900/30 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1-1-1H3v-1l2-2 2.257-2.257A6 6 0 0118 8zm-8 6l2-2 1-1-1-1-2-2-1 1 2 2-2 2 1 1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-blue-200 font-mono">
                          Ready to bridge
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Wormhole Connect Component */}
                  <div className="h-full overflow-auto">
                    <WormholeConnect />
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Information Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* About Wormhole */}
            <motion.div
              className="bg-gray-800 rounded-xl p-5 border border-blue-900/40"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mr-3">
                  <Image
                    src="https://wormhole.com/token.png"
                    alt="Wormhole"
                    width={30}
                    height={30}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-400">
                    Wormhole Bridge
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Cross-chain messaging protocol
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">
                Wormhole enables seamless asset transfers between blockchains,
                making cross-chain DeFi simple and secure.
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Supported chains:</span>
                <span className="text-blue-300 font-medium">10+</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-400">Total bridged:</span>
                <span className="text-blue-300 font-medium">$5B+</span>
              </div>
            </motion.div>

            {/* Popular Routes */}
            <motion.div
              className="bg-gray-800 rounded-xl p-5 border border-blue-900/40"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">
                Popular Bridge Routes
              </h3>

              <div className="space-y-3">
                {popularRoutes.map((route: BridgeRoute, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative w-12 h-5">
                        <Image
                          src={`/${route.from}.png`}
                          alt={route.from}
                          width={20}
                          height={20}
                          className="absolute left-0 rounded-full"
                        />
                        <Image
                          src={`/${route.to}.png`}
                          alt={route.to}
                          width={20}
                          height={20}
                          className="absolute left-6 rounded-full"
                        />
                      </div>
                      <span className="text-gray-200 text-sm ml-2">
                        {route.label}
                      </span>
                    </div>
                    <span className="text-blue-300 text-xs bg-blue-900/30 px-2 py-1 rounded">
                      Popular
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tips Section */}
            <motion.div
              className="bg-gray-800 rounded-xl p-5 border border-blue-900/40"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">
                Bridging Tips
              </h3>

              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Always verify the destination address before confirming a
                  bridge transaction
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Make sure you have enough native tokens for gas fees on both
                  chains
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}