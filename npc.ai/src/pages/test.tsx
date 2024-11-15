"use client";

import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [counter, setCounter] = useState(0);

  return (
    <>
      <Head>
        <link
          href="https://unpkg.com/nes.css@latest/css/nes.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Press+Start+2P"
          rel="stylesheet"
        />
      </Head>
      <div className="nes-container is-dark with-title p-4">
        <p className="title">NPC.AI</p>
        <div className="nes-container is-rounded p-4">
          {/* Navbar */}
          <nav className="mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h1 className="nes-text is-primary mb-4 md:mb-0">NPC.AI</h1>
              <div className="hidden md:flex items-center space-x-4">
                <button className="nes-btn is-primary">Create Agent</button>
                <button className="nes-btn is-success">Wallet</button>
                <button className="nes-btn is-warning">Profile</button>
              </div>
              <button
                className="nes-btn md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                ☰
              </button>
            </div>
            {isMenuOpen && (
              <div className="mt-4 space-y-2 md:hidden">
                <button className="nes-btn is-primary w-full">
                  Create Agent
                </button>
                <button className="nes-btn is-success w-full">Wallet</button>
                <button className="nes-btn is-warning w-full">Profile</button>
              </div>
            )}
          </nav>

          {/* Main Content */}
          <main>
            <h2 className="nes-text is-success text-center mb-4">
              Welcome to NPC.AI
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="nes-container with-title is-centered">
                <p className="title">Create Your Agent</p>
                <p className="mb-4">
                  Design and deploy your own AI agent with a unique wallet.
                </p>
                <button className="nes-btn is-primary">Get Started</button>
              </div>

              <div className="nes-container with-title is-centered">
                <p className="title">Agent Counter</p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    className="nes-btn is-error"
                    onClick={() => setCounter((prev) => Math.max(0, prev - 1))}
                  >
                    -
                  </button>
                  <span className="nes-text is-primary text-2xl">
                    {counter}
                  </span>
                  <button
                    className="nes-btn is-success"
                    onClick={() => setCounter((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        body {
          background-color: #212529;
          padding: 2rem;
        }
        .nes-btn {
          margin: 4px;
        }
        .nes-container {
          margin-bottom: 2rem;
        }
      `}</style>
    </>
  );
}
