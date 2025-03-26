import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function CategoryShowcase() {
  return (
    <section className="py-16 border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <Link href="/categories" className="text-primary hover:underline">
            View All Categories
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                <div className="aspect-square relative">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4 text-center">
                  <h3 className="font-medium">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

const categories = [
  {
    id: "1",
    name: "Clothing",
    slug: "clothing",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "2",
    name: "Handicrafts",
    slug: "handicrafts",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "3",
    name: "Food & Spices",
    slug: "food-spices",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "4",
    name: "Home Decor",
    slug: "home-decor",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "5",
    name: "Jewelry",
    slug: "jewelry",
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "6",
    name: "Art",
    slug: "art",
    image: "/placeholder.svg?height=200&width=200",
  },
]

