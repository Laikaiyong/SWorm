'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ConnectButton,
  ConnectModal,
  useCurrentAccount,
} from '@mysten/dapp-kit'
import Balance from '@suiware/kit/Balance'
import NetworkType from '@suiware/kit/NetworkType'
import { APP_NAME } from '../../config/main'
import Logo from '../../assets/logo.svg'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const account = useCurrentAccount()

  const formatAddress = (address: string | undefined): string => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-blue-900/30 bg-gray-900/80 backdrop-blur-lg">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo Section */}
          <Link href="/" className="flex flex-shrink-0 items-center">
            <div className="group relative flex items-center">
              <div className="relative">
                <Image
                  src='/logo.png'
                  alt={APP_NAME}
                  width={48}
                  height={48}
                  className="transition-all duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 -z-10 rounded-full bg-blue-500/30 opacity-70 blur-xl transition-all duration-300 group-hover:bg-blue-400/40 group-hover:opacity-100"></div>
              </div>
              <span className="ml-3 hidden bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent md:block">
                {APP_NAME}
              </span>
            </div>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-blue-400 transition-colors hover:bg-blue-800/30 hover:text-white focus:outline-none"
              aria-label="Main menu"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    mobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="/portfolio"
              className="text-md group relative flex items-center px-3 py-1 font-medium text-gray-300 transition-colors hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1.5 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              <span>Portfolio</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            <div className="ml-6 flex items-center space-x-4 border-l border-blue-900/50 pl-6">
              {account && (
                <>
                  <Balance />
                  <NetworkType />
                </>
              )}

              {/* ConnectButton using existing workflow */}
              <div className="sds-connect-button-container">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="space-y-1 border-t border-blue-900/30 bg-gray-900 px-2 pb-3 pt-2 sm:px-3">
          <Link
            href="/portfolio"
            className="block flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-blue-900/30 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1.5 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            Portfolio
          </Link>
          <div className="flex flex-col space-y-3 border-t border-blue-900/20 pb-3 pt-4">
            <div className="flex flex-col space-y-2">
              {account && (
                <>
                  <Balance />
                  <NetworkType />
                </>
              )}
            </div>

            {/* ConnectButton for mobile */}
            <div className="sds-connect-button-container">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
