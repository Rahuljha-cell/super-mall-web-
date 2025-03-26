import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingBag, Store, Globe, TrendingUp } from "lucide-react"
import FeaturedShops from "@/components/featured-shops"
import CategoryShowcase from "@/components/category-showcase"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Connect Rural Merchants to Global Markets</h1>
            <p className="mt-6 text-lg text-muted-foreground">
              SuperMall helps rural merchants showcase and sell their products to customers worldwide, bridging the gap
              between local craftsmanship and global commerce.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/shops">Explore Shops</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/register?type=merchant">Become a Merchant</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <img
              src="/placeholder.svg?height=400&width=600"
              alt="Rural merchants selling products"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose SuperMall?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border">
            <Store className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Create Your Shop</h3>
            <p className="text-muted-foreground">Easily set up your digital storefront and showcase your products</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg border">
            <ShoppingBag className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Manage Products</h3>
            <p className="text-muted-foreground">Add, update, and organize your products with ease</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg border">
            <Globe className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Global Reach</h3>
            <p className="text-muted-foreground">Connect with customers from around the world</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg border">
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Track Performance</h3>
            <p className="text-muted-foreground">Monitor your sales and growth with detailed analytics</p>
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <FeaturedShops />

      {/* Categories Showcase */}
      <CategoryShowcase />
    </div>
  )
}

