"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { API_URL } from "@/lib/config";

type SelectBarData =
  | { talent?: Array<{ skills?: string[] | null }> }
  | undefined;

const SelectBar = ({ data }: { data?: SelectBarData }) => {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isActive = true;
    const fetchUniqueSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/api/all-skills-shuffled`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to load skills");
        const payload = await response.json();
        if (!isActive) return;
        const top = (payload?.skills ?? []).slice(0, 24);
        setSkills(top);
      } catch {
        // Fallback to derive from provided data if available
        const derived = Array.from(
          new Set(
            (data?.talent ?? []).flatMap((t) => t.skills || []).filter(Boolean)
          )
        ).slice(0, 24) as string[];
        if (derived.length > 0) {
          setSkills(derived);
        } else {
          setError("Unable to load skills right now.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchUniqueSkills();
    return () => {
      isActive = false;
    };
  }, [data]);

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return skills;
    return skills.filter((s) => s.toLowerCase().includes(q));
  }, [search, skills]);

  const toggleSkill = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const clear = () => setSelected([]);

  const generateQuery = (values: string[]) => {
    if (values.length === 0) return "";
    return `?skills=${values.join(",")}`;
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderCircle className="animate-spin text-purple-600 size-10 m-10 rounded-full" />
      </div>
    );
  }

  return (
    <div className="m-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Explore skills
          </h2>
          <p className="text-sm text-gray-500">
            Pick a few skills and we&apos;ll show matching professionals
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills"
            className="pl-9"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {error}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredSkills.map((skill) => {
              const active = selected.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSkill(skill);
                    }
                  }}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-inset transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    active
                      ? "bg-indigo-600 text-white ring-indigo-600"
                      : "bg-gray-100 text-gray-700 ring-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
            {filteredSkills.length === 0 && (
              <span className="text-sm text-gray-500">
                No skills match your search.
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="text-sm text-gray-600">
          Selected: <span className="font-medium">{selected.length}</span>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={clear}
            disabled={selected.length === 0}
          >
            Clear
          </Button>
          <Button
            onClick={() =>
              router.push(`/find-talent${generateQuery(selected)}`)
            }
            disabled={selected.length === 0}
          >
            Search talents {selected.length > 0 && `(${selected.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectBar;
