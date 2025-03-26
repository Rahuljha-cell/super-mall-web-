import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-medium">SuperMall</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Connecting rural merchants to global customers, empowering local communities through e-commerce.
            </p>
            <div className="mt-4 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/shops" className="text-muted-foreground hover:text-foreground">
                  Shops
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-muted-foreground hover:text-foreground">
                  Offers
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-muted-foreground hover:text-foreground">
                  Compare Products
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium">For Merchants</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/auth/register?type=merchant" className="text-muted-foreground hover:text-foreground">
                  Become a Merchant
                </Link>
              </li>
              <li>
                <Link href="/merchant/dashboard" className="text-muted-foreground hover:text-foreground">
                  Merchant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/merchant/help" className="text-muted-foreground hover:text-foreground">
                  Merchant Help Center
                </Link>
              </li>
              <li>
                <Link href="/merchant/terms" className="text-muted-foreground hover:text-foreground">
                  Terms for Merchants
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium">Help & Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SuperMall. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

