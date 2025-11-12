"use client";
import React, { useEffect, useState } from "react";

import { FileSpreadsheet, Hammer, Key, Loader2, Send } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { API_URL } from "@/lib/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const pathname = usePathname(); // Add this line
  const isFindGigs = pathname === "/find-gigs"; // Add this line
  const [keys, setKeys] = useState(0);
  const handleLogout = () => {
    logout();
    router.push("/sign-in");
  };
  useEffect(() => {
    const token = async () => {
      if (user?.id) {
        const response = await fetch(`${API_URL}/api/user/${user?.id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        console.log("data", data);
        setKeys(data?.user?.keyBalance);
      }
    };
    token();
  }, [user]);

  return (
    <div className=" bg-gradient-to-br from-purple-400 to-blue-500 h-15 flex flex-row justify-between px-4 items-center text-center">
      <div>
        <Link href="/">
          <h1 className="flex flex-row relative text-2xl font-stretch-90% font-bold items-center hover:cursor-pointer hover:text-white transition-all duration-300">
            <Hammer size={30} />
            Talent Bridge
          </h1>
        </Link>
      </div>

      <div className="flex space-x-2 ">
        {user?.role === "TALENT" && (
          <Link href="/get-keys">
            <div className="flex flex-row items-center justify-center hover:cursor-pointer text-2xl">
              🔑
              <span className="text-white text-sm">{keys} </span>
            </div>
          </Link>
        )}
        {loading ? (
          // Show loading spinner while checking auth
          <div className="w-32 h-10 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
        ) : user ? (
          <Link href={`/chat`}>
            <Button className="cursor-pointer rounded-full bg-gradient-to-br from-purple-400 to-blue-500 hover:border-none">
              <Send className="text-white" />
            </Button>
          </Link>
        ) : null}
        {loading ? (
          // Show loading spinner while checking auth
          <div className="w-32 h-10 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
        ) : user ? (
          <Link href={`/contracts`}>
            <Button className="rounded-full bg-gradient-to-r from-pink-300 to-purple-600 hover:cursor-pointer">
              <FileSpreadsheet />{" "}
            </Button>
          </Link>
        ) : null}
        {user?.role === "TALENT" &&
          !isFindGigs &&
          (loading ? (
            // Show loading spinner while checking auth
            <div className="w-32 h-10 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          ) : (
            <div>
              <Button>
                <Link href="/find-gigs">Find Job</Link>
              </Button>
            </div>
          ))}
        {loading ? (
          // Show loading spinner while checking auth
          <div className="w-32 h-10 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          </div>
        ) : user ? (
          <>
            {user.role === "CLIENT" && (
              <Link href="postjob" as="/postjob">
                <Button className="cursor-pointer rounded-full bg-gradient-to-br from-purple-400 to-blue-500 hover:border-none">
                  +
                </Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button asChild variant="ghost">
                  <span className="cursor-pointer">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={`/profile/userProfile`}>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/transactions`}>Transactions</Link>
                </DropdownMenuItem>
                {user.role === "TALENT" && (
                  <DropdownMenuItem>
                    <Link href={`/applied-jobs`}>Applied Jobs</Link>
                  </DropdownMenuItem>
                )}

                {user.role === "CLIENT" && (
                  <DropdownMenuItem>
                    <Link href={`/manage-jobs`}>Manage Jobs</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link href="/sign-in">
            <Button variant="ghost">Sign Up / Sign In</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
