"use client";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";

import { useRouter } from "next/navigation";

const SearchBySkill = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!search.trim()) {
      return;
    }

    setLoading(true);

    // Split comma-separated skills
    const skills = search
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Redirect to same page with search params
    const searchParams = new URLSearchParams();
    searchParams.set("skills", skills.join(","));
    searchParams.set("page", "1"); // Reset to page 1 on new search
    searchParams.set("limit", "20");

    router.push(`/find-gigs?${searchParams.toString()}`);
    setLoading(false);
  };
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <Accordion type="single" collapsible className="w-full max-w-2xl">
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:cursor-pointer text-center justify-center hover:bg-purple-100 px-4">
            Search Based on Skill
          </AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="space-y-4  flex flex-col items-center">
              <Input
                type="text"
                placeholder="Search by skill (e.g., plumbing, tiles)"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                className="focus:outline-purple-700"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                variant="outline"
                onClick={handleSearch}
                disabled={loading}
                className="w-full hover:cursor-pointer"
              >
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SearchBySkill;
