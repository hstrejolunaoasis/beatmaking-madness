"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/config/constants";
import { useCartStore } from "@/lib/store/cart";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function Header() {
  const { items, total, removeItem, clearCart } = useCartStore();
  const [cartOpen, setCartOpen] = useState(false);

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
        <div className="flex items-center space-x-4">
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