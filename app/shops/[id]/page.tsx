"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, ExternalLink, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { logger } from "@/lib/logger"

interface Shop {
  id: string
  name: string
  description: string
  location: string
  category: string
  floor: string
  logoUrl: string
  coverUrl: string
  phone?: string
  email?: string
  website?: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
}

interface Offer {
  id: string
  title: string
  description: string
  discount: number
  startDate: Date
  endDate: Date
}

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShopDetails = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        logger.info("Fetching shop details", {
          module: "ShopDetail",
          data: { shopId: id },
        })

        // Fetch shop details
        const shopRef = doc(db, "shops", id as string)
        const shopSnap = await getDoc(shopRef)

        if (!shopSnap.exists()) {
          setError("Shop not found")
          return
        }

        const shopData = shopSnap.data()
        setShop({
          id: shopSnap.id,
          name: shopData.name,
          description: shopData.description,
          location: shopData.location,
          category: shopData.category,
          floor: shopData.floor || "",
          logoUrl: shopData.logoUrl || "/placeholder.svg?height=200&width=200",
          coverUrl: shopData.coverUrl || "/placeholder.svg?height=400&width=1200",
          phone: shopData.phone,
          email: shopData.email,
          website: shopData.website,
        })

        // Fetch products
        const productsQuery = query(
          collection(db, "products"),
          where("shopId", "==", id),
          where("isActive", "==", true),
          limit(8),
        )

        const productsSnapshot = await getDocs(productsQuery)
        const productsList: Product[] = []

        productsSnapshot.forEach((doc) => {
          const data = doc.data()
          productsList.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            imageUrl: data.imageUrl || "/placeholder.svg?height=300&width=300",
            category: data.category,
          })
        })

        setProducts(productsList)

        // Fetch offers
        const currentDate = new Date()
        const offersQuery = query(
          collection(db, "offers"),
          where("shopId", "==", id),
          where("isActive", "==", true),
          where("endDate", ">=", currentDate),
          limit(5),
        )

        const offersSnapshot = await getDocs(offersQuery)
        const offersList: Offer[] = []

        offersSnapshot.forEach((doc) => {
          const data = doc.data()
          offersList.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            discount: data.discount,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
          })
        })

        setOffers(offersList)
      } catch (err) {
        logger.error("Error fetching shop details", {
          module: "ShopDetail",
          data: { shopId: id, error: err },
        })
        setError("Failed to load shop details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopDetails()
  }, [id])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading shop details...</p>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-red-500">{error || "Shop not found"}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Shop Header */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
        <img src={shop.coverUrl || "/placeholder.svg"} alt={shop.name} className="object-cover w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-lg overflow-hidden bg-white mr-4">
              <img
                src={shop.logoUrl || "/placeholder.svg"}
                alt={`${shop.name} logo`}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{shop.name}</h1>
              <div className="flex items-center text-white/80 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {shop.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">About the Shop</h2>
          <p className="mb-6">{shop.description}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="outline" className="text-sm py-1 px-3">
              {shop.category}
            </Badge>
            {shop.floor && (
              <Badge variant="outline" className="text-sm py-1 px-3">
                Floor: {shop.floor}
              </Badge>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{shop.location}</span>
              </li>
              {shop.phone && (
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{shop.phone}</span>
                </li>
              )}
              {shop.email && (
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                  <a href={`mailto:${shop.email}`} className="hover:underline">
                    {shop.email}
                  </a>
                </li>
              )}
              {shop.website && (
                <li className="flex items-center">
                  <ExternalLink className="h-5 w-5 mr-2 text-muted-foreground" />
                  <a href={shop.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Visit Website
                  </a>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Products and Offers */}
      <Tabs defaultValue="products" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="offers">Special Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available at the moment</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                      <div className="aspect-square relative">
                        <img
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">${product.price.toFixed(2)}</span>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <Button asChild>
                  <Link href={`/shops/${id}/products`}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    View All Products
                  </Link>
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="offers">
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No special offers available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{offer.title}</h3>
                      <Badge>{offer.discount}% OFF</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{offer.description}</p>
                    <div className="text-sm text-muted-foreground">
                      Valid from {offer.startDate.toLocaleDateString()} to {offer.endDate.toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

