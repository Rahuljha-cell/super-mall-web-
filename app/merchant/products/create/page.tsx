"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { logger } from "@/lib/logger"
import { query, where, getDocs } from "firebase/firestore"
import { Link } from "next/link"

interface Shop {
  id: string
  name: string
}

export default function CreateProductPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingShops, setIsLoadingShops] = useState(true)

  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get("shopId")

  useEffect(() => {
    const fetchShops = async () => {
      if (!user) return

      try {
        setIsLoadingShops(true)

        logger.info("Fetching merchant shops", {
          module: "Products",
          userId: user.uid,
        })

        const shopsRef = collection(db, "shops")
        const q = query(shopsRef, where("ownerId", "==", user.uid))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          // No shops found
          setShops([])
        } else {
          const shopsList: Shop[] = []

          querySnapshot.forEach((doc) => {
            shopsList.push({
              id: doc.id,
              name: doc.data().name,
            })
          })

          setShops(shopsList)

          // If shopId is provided in URL, select it
          if (shopId && shopsList.some((shop) => shop.id === shopId)) {
            setSelectedShop(shopId)
          } else if (shopsList.length > 0) {
            // Otherwise select the first shop
            setSelectedShop(shopsList[0].id)
          }
        }
      } catch (error) {
        logger.error("Error fetching shops", {
          module: "Products",
          userId: user.uid,
          data: { error },
        })
      } finally {
        setIsLoadingShops(false)
      }
    }

    if (user) {
      fetchShops()
    }
  }, [user, shopId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to create a product")
      return
    }

    if (!selectedShop) {
      setError("You must select a shop for this product")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      logger.info("Creating new product", {
        module: "Products",
        userId: user.uid,
        data: { productName: name, shopId: selectedShop },
      })

      // Get shop details
      const shopRef = doc(db, "shops", selectedShop)
      const shopSnap = await getDoc(shopRef)

      if (!shopSnap.exists()) {
        throw new Error("Selected shop does not exist")
      }

      const shopData = shopSnap.data()

      // Upload image if provided
      let imageUrl = ""
      if (imageFile) {
        const imageRef = ref(storage, `products/${selectedShop}/${Date.now()}-${imageFile.name}`)
        await uploadBytes(imageRef, imageFile)
        imageUrl = await getDownloadURL(imageRef)
      }

      // Create product document
      const productData = {
        name,
        description,
        price: Number.parseFloat(price),
        category,
        stock: Number.parseInt(stock),
        isActive,
        imageUrl,
        shopId: selectedShop,
        shopName: shopData.name,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "products"), productData)

      logger.info("Product created successfully", {
        module: "Products",
        userId: user.uid,
        data: { productId: docRef.id, productName: name, shopId: selectedShop },
      })

      router.push(`/merchant/products?shopId=${selectedShop}`)
    } catch (err: any) {
      logger.error("Error creating product", {
        module: "Products",
        userId: user?.uid,
        data: { error: err.message },
      })
      setError(err.message || "Failed to create product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingShops) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading shops...</p>
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a Shop First</CardTitle>
            <CardDescription>You need to create a shop before you can add products</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <p className="mb-4">You don't have any shops yet. Create a shop to start adding products.</p>
            <Button asChild>
              <Link href="/merchant/shop/create">Create Shop</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Fill in the details below to add a new product to your shop</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shop">Shop</Label>
              <Select value={selectedShop} onValueChange={setSelectedShop} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Product Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              <p className="text-xs text-muted-foreground">Recommended size: 800x800px</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive">Product is active and visible to customers</Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Product..." : "Create Product"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <p className="text-sm text-muted-foreground">You can edit these details later</p>
        </CardFooter>
      </Card>
    </div>
  )
}

