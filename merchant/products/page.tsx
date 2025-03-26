"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash, Eye } from "lucide-react"
import Link from "next/link"
import { logger } from "@/lib/logger"

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  isActive: boolean
  createdAt: any
}

export default function ProductsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get("shopId")

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        logger.info("Fetching products", {
          module: "Products",
          userId: user.uid,
          data: { shopId },
        })

        let productsQuery

        if (shopId) {
          // Fetch products for a specific shop
          productsQuery = query(
            collection(db, "products"),
            where("shopId", "==", shopId),
            orderBy("createdAt", "desc"),
            limit(10),
          )
        } else {
          // Fetch all products for the merchant
          productsQuery = query(
            collection(db, "products"),
            where("ownerId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(10),
          )
        }

        const querySnapshot = await getDocs(productsQuery)

        if (querySnapshot.empty) {
          setProducts([])
          setHasMore(false)
        } else {
          const productsList: Product[] = []

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            productsList.push({
              id: doc.id,
              name: data.name,
              price: data.price,
              category: data.category,
              stock: data.stock,
              isActive: data.isActive,
              createdAt: data.createdAt?.toDate() || new Date(),
            })
          })

          setProducts(productsList)
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
          setHasMore(querySnapshot.docs.length === 10)
        }
      } catch (error) {
        logger.error("Error fetching products", {
          module: "Products",
          userId: user.uid,
          data: { error, shopId },
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProducts()
    }
  }, [user, shopId])

  const loadMoreProducts = async () => {
    if (!user || !lastVisible) return

    try {
      setIsLoading(true)

      let productsQuery

      if (shopId) {
        productsQuery = query(
          collection(db, "products"),
          where("shopId", "==", shopId),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(10),
        )
      } else {
        productsQuery = query(
          collection(db, "products"),
          where("ownerId", "==", user.uid),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(10),
        )
      }

      const querySnapshot = await getDocs(productsQuery)

      if (querySnapshot.empty) {
        setHasMore(false)
      } else {
        const newProducts: Product[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          newProducts.push({
            id: doc.id,
            name: data.name,
            price: data.price,
            category: data.category,
            stock: data.stock,
            isActive: data.isActive,
            createdAt: data.createdAt?.toDate() || new Date(),
          })
        })

        setProducts([...products, ...newProducts])
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
        setHasMore(querySnapshot.docs.length === 10)
      }
    } catch (error) {
      logger.error("Error loading more products", {
        module: "Products",
        userId: user.uid,
        data: { error, shopId },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    // This would typically involve a new Firestore query with a where clause
    logger.info("Product search", {
      module: "Products",
      userId: user?.uid,
      data: { searchTerm, shopId },
    })
  }

  if (loading || (isLoading && products.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[200px] mr-2"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Button asChild>
            <Link href={shopId ? `/merchant/products/create?shopId=${shopId}` : "/merchant/products/create"}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>View and manage all your products</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't added any products yet</p>
              <Button asChild>
                <Link href={shopId ? `/merchant/products/create?shopId=${shopId}` : "/merchant/products/create"}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/products/${product.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/merchant/products/edit/${product.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {products.length > 0 && (
          <CardFooter className="flex justify-center">
            {hasMore && (
              <Button variant="outline" onClick={loadMoreProducts} disabled={isLoading}>
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

