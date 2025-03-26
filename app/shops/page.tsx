"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin } from "lucide-react"
import Link from "next/link"
import { logger } from "@/lib/logger"

interface Shop {
  id: string
  name: string
  description: string
  location: string
  category: string
  logoUrl: string
  coverUrl: string
  productCount: number
  isActive: boolean
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true)
        logger.info("Fetching shops", { module: "Shops" })

        const shopsQuery = query(collection(db, "shops"), where("isActive", "==", true), orderBy("name"), limit(12))

        const querySnapshot = await getDocs(shopsQuery)

        if (querySnapshot.empty) {
          setShops([])
          setHasMore(false)
        } else {
          const shopsList: Shop[] = []

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            shopsList.push({
              id: doc.id,
              name: data.name,
              description: data.description,
              location: data.location,
              category: data.category,
              logoUrl: data.logoUrl || "/placeholder.svg?height=200&width=200",
              coverUrl: data.coverUrl || "/placeholder.svg?height=200&width=400",
              productCount: data.productCount || 0,
              isActive: data.isActive,
            })
          })

          setShops(shopsList)
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
          setHasMore(querySnapshot.docs.length === 12)
        }
      } catch (error) {
        logger.error("Error fetching shops", {
          module: "Shops",
          data: { error },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [])

  const loadMoreShops = async () => {
    if (!lastVisible) return

    try {
      setIsLoading(true)

      const shopsQuery = query(
        collection(db, "shops"),
        where("isActive", "==", true),
        orderBy("name"),
        startAfter(lastVisible),
        limit(12),
      )

      const querySnapshot = await getDocs(shopsQuery)

      if (querySnapshot.empty) {
        setHasMore(false)
      } else {
        const newShops: Shop[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          newShops.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            location: data.location,
            category: data.category,
            logoUrl: data.logoUrl || "/placeholder.svg?height=200&width=200",
            coverUrl: data.coverUrl || "/placeholder.svg?height=200&width=400",
            productCount: data.productCount || 0,
            isActive: data.isActive,
          })
        })

        setShops([...shops, ...newShops])
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
        setHasMore(querySnapshot.docs.length === 12)
      }
    } catch (error) {
      logger.error("Error loading more shops", {
        module: "Shops",
        data: { error },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    logger.info("Shop search", {
      module: "Shops",
      data: { searchTerm },
    })
  }

  const filterByCategory = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category)
    // Implement category filtering
    logger.info("Category filter", {
      module: "Shops",
      data: { category },
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Explore Shops</h1>
      <p className="text-muted-foreground mb-6">Discover unique products from rural merchants around the world</p>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-1">
          <Input
            type="search"
            placeholder="Search shops by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mr-2"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => filterByCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && shops.length === 0 ? (
        <div className="text-center py-12">
          <p>Loading shops...</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No shops found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`}>
                <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                  <div className="h-40 relative">
                    <img
                      src={shop.coverUrl || "/placeholder.svg"}
                      alt={shop.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <h3 className="text-xl font-semibold text-white">{shop.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {shop.location}
                    </div>
                    <p className="line-clamp-2 mb-3">{shop.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{shop.category}</Badge>
                      <span className="text-sm text-muted-foreground">{shop.productCount} Products</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={loadMoreShops} disabled={isLoading}>
                {isLoading ? "Loading..." : "Load More Shops"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const categories = ["All", "Handicrafts", "Textiles", "Food & Spices", "Home Decor", "Jewelry", "Art", "Clothing"]

