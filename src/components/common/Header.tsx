"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/config/constants";
import { useCartStore } from "@/lib/store/cart";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";

export function Header() {
  const { items, total, removeItem, clearCart } = useCartStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            {SITE_CONFIG.name}
          </Link>
          <nav className="hidden md:flex md:space-x-4">
            <Link
              href="/beats"
              className="text-sm transition-colors hover:text-primary"
            >
              Beats
            </Link>
            <Link
              href="/licensing"
              className="text-sm transition-colors hover:text-primary"
            >
              Licensing
            </Link>
            <Link
              href="/about"
              className="text-sm transition-colors hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  {user.user_metadata?.name && (
                    <span className="text-sm hidden md:inline-block">
                      Welcome, {user.user_metadata.name}
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          {user.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt={user.user_metadata?.name || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <AvatarFallback>
                              {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.user_metadata?.name || user.email?.split("@")[0] || "User"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
          <Button
            variant="ghost"
            className="relative"
            onClick={() => setCartOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {items.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Cart</DialogTitle>
          </DialogHeader>
          {items.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.beatId}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">Beat ID: {item.beatId}</div>
                    <div className="text-sm text-muted-foreground">
                      License: {item.licenseType}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div>${item.price.toFixed(2)}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.beatId)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-0">
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearCart()}
                className="mb-2 sm:mb-0"
              >
                Clear Cart
              </Button>
            )}
            {items.length > 0 && (
              <Button onClick={() => setCartOpen(false)}>
                Checkout (${total.toFixed(2)})
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
} 