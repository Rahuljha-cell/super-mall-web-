"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { logger } from "@/lib/logger"

export default function CreateShopPage() {
  const [shopName, setShopName] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [floor, setFloor] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0])
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to create a shop")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      logger.info("Creating new shop", {
        module: "Shop",
        userId: user.uid,
        data: { shopName },
      })

      // Upload logo if provided
      let logoUrl = ""
      if (logoFile) {
        const logoRef = ref(storage, `shops/${user.uid}/logo-${Date.now()}`)
        await uploadBytes(logoRef, logoFile)
        logoUrl = await getDownloadURL(logoRef)
      }

      // Upload cover if provided
      let coverUrl = ""
      if (coverFile) {
        const coverRef = ref(storage, `shops/${user.uid}/cover-${Date.now()}`)
        await uploadBytes(coverRef, coverFile)
        coverUrl = await getDownloadURL(coverRef)
      }

      // Create shop document
      const shopData = {
        name: shopName,
        description,
        location,
        category,
        floor,
        logoUrl,
        coverUrl,
        ownerId: user.uid,
        ownerEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        productCount: 0,
        offerCount: 0,
      }

      const docRef = await addDoc(collection(db, "shops"), shopData)

      logger.info("Shop created successfully", {
        module: "Shop",
        userId: user.uid,
        data: { shopId: docRef.id, shopName },
      })

      router.push(`/merchant/shop?id=${docRef.id}`)
    } catch (err: any) {
      logger.error("Error creating shop", {
        module: "Shop",
        userId: user?.uid,
        data: { error: err.message },
      })
      setError(err.message || "Failed to create shop. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Your Shop</h1>

      <Card>
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
          <CardDescription>Fill in the details below to create your shop on SuperMall</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input id="shopName" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State, Country"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Handicrafts, Textiles, Food"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Floor/Section (Optional)</Label>
              <Input
                id="floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. Ground Floor, Section A"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Shop Logo</Label>
                <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                <p className="text-xs text-muted-foreground">Recommended size: 200x200px</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">Cover Image</Label>
                <Input id="cover" type="file" accept="image/*" onChange={handleCoverChange} />
                <p className="text-xs text-muted-foreground">Recommended size: 1200x400px</p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Shop..." : "Create Shop"}
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

