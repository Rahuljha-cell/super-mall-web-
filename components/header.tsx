"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, ShoppingCart, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./mode-toggle"
import { useAuth } from "@/lib/auth-context"

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">SuperMall</span>
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/shops" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Shops</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {categories.map((category) => (
                      <li key={category.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={category.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{category.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {category.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/offers" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Offers</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/compare" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Compare</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-4">
          {isSearchOpen ? (
            <div className="flex items-center">
              <Input type="search" placeholder="Search..." className="w-[200px] md:w-[300px]" />
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                <span className="sr-only">Close search</span>
                &times;
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          {user ? (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <User className="h-5 w-5 mr-2" />
                    <span className="hidden md:inline">Account</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/dashboard"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            Dashboard
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/profile"
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            Profile
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <button
                          onClick={() => signOut()}
                          className="w-full text-left block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <Link href="/auth/login">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname === "/" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Home
                </Link>
                <Link
                  href="/shops"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname === "/shops" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Shops
                </Link>
                <Link
                  href="/categories"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname === "/categories" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Categories
                </Link>
                <Link
                  href="/offers"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname === "/offers" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Offers
                </Link>
                <Link
                  href="/compare"
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary",
                    pathname === "/compare" ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Compare
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

const categories = [
  {
    title: "Clothing & Apparel",
    description: "Traditional and modern clothing from rural artisans",
    href: "/categories/clothing",
  },
  {
    title: "Handicrafts",
    description: "Handmade crafts showcasing local artistry and tradition",
    href: "/categories/handicrafts",
  },
  {
    title: "Food & Beverages",
    description: "Local delicacies and traditional food products",
    href: "/categories/food",
  },
  {
    title: "Home Decor",
    description: "Unique home decoration items from rural communities",
    href: "/categories/home-decor",
  },
]

