import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FeaturedShops() {
  return (
    <section className="py-16 border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Shops</h2>
          <Link href="/shops" className="text-primary hover:underline">
            View All Shops
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredShops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden">
              <div className="relative h-48">
                <img src={shop.image || "/placeholder.svg"} alt={shop.name} className="object-cover w-full h-full" />
                {shop.featured && <Badge className="absolute top-2 right-2">Featured</Badge>}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{shop.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{shop.location}</p>
                <p className="line-clamp-2">{shop.description}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-between">
                <span className="text-sm text-muted-foreground">{shop.productCount} Products</span>
                <Link href={`/shops/${shop.id}`} className="text-primary hover:underline">
                  Visit Shop
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const featuredShops = [
  {
    id: "1",
    name: "Himalayan Handicrafts",
    description:
      "Traditional handcrafted items from the foothills of the Himalayas, showcasing generations of craftsmanship and cultural heritage.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Uttarakhand, India",
    productCount: 45,
    featured: true,
  },
  {
    id: "2",
    name: "Tribal Textiles",
    description:
      "Authentic handwoven textiles created by tribal artisans using traditional techniques passed down through generations.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Chhattisgarh, India",
    productCount: 32,
    featured: true,
  },
  {
    id: "3",
    name: "Rural Spice Collective",
    description:
      "Organic spices sourced directly from small-scale farmers, bringing authentic flavors from rural farms to global kitchens.",
    image: "/placeholder.svg?height=200&width=400",
    location: "Kerala, India",
    productCount: 28,
    featured: false,
  },
]

