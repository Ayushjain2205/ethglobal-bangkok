import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-2">
      <Navbar />
      <main>{children}</main>
      <style jsx global>{`
        // body {
        //   font-family: "Press Start 2P", cursive;
        // }
      `}</style>
    </div>
  );
}
