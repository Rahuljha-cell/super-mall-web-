"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, limit } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Check, X, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { logger } from "@/lib/logger"

interface Product {
  id: string
  name: string
  price: number
  category: string
  description: string
  imageUrl: string
  shopId: string
  shopName: string
  features?: Record<string, any>
}

export default function ComparePage() {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        logger.info("Fetching product categories", { module: "Compare" })

        const productsRef = collection(db, "products")
        const q = query(productsRef, where("isActive", "==", true), limit(100))
        const querySnapshot = await getDocs(q)

        const uniqueCategories = new Set<string>()

        querySnapshot.forEach((doc) => {
          const category = doc.data().category
          if (category) {
            uniqueCategories.add(category)
          }
        })

        const categoriesList = Array.from(uniqueCategories)
        setCategories(categoriesList)

        if (categoriesList.length > 0) {
          setSelectedCategory(categoriesList[0])
        }
      } catch (error) {
        logger.error("Error fetching categories", {
          module: "Compare",
          data: { error },
        })
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (!selectedCategory) return

      try {
        setIsLoading(true)
        logger.info("Fetching products by category", {
          module: "Compare",
          data: { category: selectedCategory },
        })

        const productsRef = collection(db, "products")
        const q = query(
          productsRef,
          where("category", "==", selectedCategory),
          where("isActive", "==", true),
          limit(20),
        )
        const querySnapshot = await getDocs(q)

        const productsList: Product[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          productsList.push({
            id: doc.id,
            name: data.name,
            price: data.price,
            category: data.category,
            description: data.description,
            imageUrl: data.imageUrl || "/placeholder.svg?height=200&width=200",
            shopId: data.shopId,
            shopName: data.shopName,
            features: data.features || {},
          })
        })

        setProducts(productsList)
        setSelectedProducts([])
      } catch (error) {
        logger.error("Error fetching products by category", {
          module: "Compare",
          data: { category: selectedCategory, error },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductsByCategory()
  }, [selectedCategory])

  const toggleProductSelection = (product: Product) => {
    if (selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id))
    } else {
      if (selectedProducts.length < 3) {
        setSelectedProducts([...selectedProducts, product])
      }
    }
  }

  // Get all unique feature keys from selected products
  const getFeatureKeys = () => {
    const keys = new Set<string>()
    selectedProducts.forEach((product) => {
      if (product.features) {
        Object.keys(product.features).forEach((key) => keys.add(key))
      }
    })
    return Array.from(keys)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Compare Products</h1>
      <p className="text-muted-foreground mb-6">Select products to compare features, prices, and more</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Products to Compare</CardTitle>
          <CardDescription>Choose a category and select up to 3 products to compare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Product Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all ${
                    selectedProducts.some((p) => p.id === product.id) ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => toggleProductSelection(product)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                    {selectedProducts.some((p) => p.id === product.id) && (
                      <div className="absolute top-2 right-2">
                        <Badge>Selected</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{product.shopName}</p>
                    <p className="font-semibold mt-2">${product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">{selectedProducts.length}/3 products selected</p>
        </CardFooter>
      </Card>

      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Comparison</CardTitle>
            <CardDescription>Compare the selected products side by side</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Feature</TableHead>
                    {selectedProducts.map((product) => (
                      <TableHead key={product.id}>
                        <div className="text-center">
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.name}
                            className="w-20 h-20 object-cover mx-auto mb-2"
                          />
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.shopName}</div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Price</TableCell>
                    {selectedProducts.map((product) => (
                      <TableCell key={product.id} className="text-center">
                        ${product.price.toFixed(2)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Category</TableCell>
                    {selectedProducts.map((product) => (
                      <TableCell key={product.id} className="text-center">
                        {product.category}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Description</TableCell>
                    {selectedProducts.map((product) => (
                      <TableCell key={product.id} className="text-center">
                        <p className="line-clamp-3">{product.description}</p>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Dynamic feature rows */}
                  {getFeatureKeys().map((featureKey) => (
                    <TableRow key={featureKey}>
                      <TableCell className="font-medium">{featureKey}</TableCell>
                      {selectedProducts.map((product) => (
                        <TableCell key={product.id} className="text-center">
                          {product.features && product.features[featureKey] ? (
                            typeof product.features[featureKey] === "boolean" ? (
                              product.features[featureKey] ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-red-500 mx-auto" />
                              )
                            ) : (
                              product.features[featureKey]
                            )
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedProducts([])}>
              Clear Selection
            </Button>
            <div className="flex gap-2">
              {selectedProducts.map((product) => (
                <Button key={product.id} asChild size="sm">
                  <Link href={`/products/${product.id}`}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View {product.name}
                  </Link>
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

