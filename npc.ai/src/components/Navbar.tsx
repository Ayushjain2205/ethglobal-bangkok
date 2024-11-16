"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAvatarKey((prev) => prev + 1);
    }, 5000); // Change image every 2 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <nav
      className="nes-container is-rounded"
      style={{
        backgroundColor: "#fff",
        marginBottom: "20px",
        padding: "0.5rem",
      }}
    >
      <div className="flex justify-between items-center">
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="flex items-center">
            <img
              key={avatarKey}
              src={`https://api.cloudnouns.com/v1/pfp?timestamp=${avatarKey}`}
              alt="NPC Avatar"
              className="rounded-full h-[60px] w-[60px]"
            />
            <span className="nes-text is-primary text-[#000] ml-2 text-xl">
              NPC.ai
            </span>
          </div>
        </Link>
        <div className="hidden sm:flex items-center space-x-4">
          <Link href="/create" className="nes-btn is-primary">
            Create Agent
          </Link>
          <Link href="/breed" className="nes-btn is-warning">
            Breed
          </Link>
          <Link href="/terminal" className="nes-btn is-success">
            Terminal
          </Link>
          <Link href="/command-center" className="nes-btn">
            Command Center
          </Link>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="nes-btn sm:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>
      {isMenuOpen && (
        <div className="mt-4 sm:hidden">
          <Link href="/create" className="nes-btn is-primary block w-full mb-2">
            Create Agent
          </Link>
          <Link
            href="/marketplace"
            className="nes-btn is-success block w-full mb-2"
          >
            Marketplace
          </Link>
          <Link href="/about" className="nes-btn is-warning block w-full">
            About
          </Link>
          <Link href="/all" className="nes-btn block w-full">
            All NPCs
          </Link>
        </div>
      )}
    </nav>
  );
}
