"use client";

import Contacts from "@/components/Contacts";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

interface SendersResponse {
  senders: SenderItem[];
}

// Each item in the senders array
interface SenderItem {
  sender: SenderDetails;
}

// The actual sender object
interface SenderDetails {
  id: string;
  email: string;
  name: string;
  phone: string;
  // ... other properties
}
const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const [senders, setSenders] = useState<SendersResponse>({ senders: [] });
  useEffect(() => {
    const getAllSenders = async () => {
      const response = await fetch(`${API_URL}/api/get-all-senders`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (data) {
        setSenders(data);
      }
    };
    getAllSenders();
  }, []);
  return (
    <div className="flex flex-row justify-around overflow-y-clip">
      <Contacts />
      <div className="flex flex-col w-full">{children}</div>
    </div>
  );
};

export default ChatLayout;
