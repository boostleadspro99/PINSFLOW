"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ConnectPinterestButton() {
  const router = useRouter();

  async function handleConnect() {
    router.push("/api/pinterest/oauth/start");
  }

  return (
    <Button onClick={handleConnect} className="bg-red-600 hover:bg-red-700 text-white">
      Connect Pinterest Account
    </Button>
  );
}
