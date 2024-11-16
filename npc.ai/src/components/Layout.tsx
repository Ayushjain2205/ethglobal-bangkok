import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Navbar />
      <main>{children}</main>
      <style jsx global>{`
        body {
          font-family: "Press Start 2P", cursive;
          background-color: #f3e8ff;
          padding: 2rem;
        }
        .nes-btn {
          margin: 4px;
        }
        .nes-container {
          margin-bottom: 2rem;
        }
        .nes-btn.is-primary {
          color: white;
        }
      `}</style>
    </div>
  );
}
