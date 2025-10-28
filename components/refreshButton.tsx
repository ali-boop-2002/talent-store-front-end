"use client";
import { Button } from "./ui/button";
import { RefreshCcw } from "lucide-react";

const RefreshButton = () => {
  return (
    <Button
      onClick={() => window.location.reload()}
      className="bg-gradient-to-r border-2 border-purple-500 from-purple-500 rounded-full to-blue-600 hover:from-purple-600 hover:to-blue-500 hover:cursor-pointer hover:scale-105 transition-all duration-300"
    >
      <RefreshCcw className="w-4 h-4" />
    </Button>
  );
};

export default RefreshButton;
