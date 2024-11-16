"use client";

import { useState } from "react";
import Layout from "@/components/Layout";

export default function Home() {
  const [counter, setCounter] = useState(0);

  return (
    <Layout>
      <div className="nes-container with-title p-4 bg-purple-100">
        <p className="title bg-purple-200 text-purple-800">NPC.AI</p>
        <div className="nes-container is-rounded p-4 bg-white">
          {/* Main Content */}
          <h2 className="nes-text text-center mb-4 text-pink-600">
            Welcome to NPC.AI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="nes-container with-title is-centered bg-purple-50">
              <p className="title bg-purple-200 text-purple-800">
                Create Your Agent
              </p>
              <p className="mb-4 text-purple-800">
                Design and deploy your own AI agent with a unique wallet.
              </p>
              <button
                className="nes-btn"
                style={{
                  backgroundColor: "#8B5CF6",
                  borderColor: "#8B5CF6",
                  color: "white",
                }}
              >
                Get Started
              </button>
            </div>

            <div className="nes-container with-title is-centered bg-pink-50">
              <p className="title bg-pink-200 text-pink-800">Agent Counter</p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  className="nes-btn is-error"
                  onClick={() => setCounter((prev) => Math.max(0, prev - 1))}
                >
                  -
                </button>
                <span className="nes-text text-2xl text-pink-600">
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
        </div>
      </div>
    </Layout>
  );
}
