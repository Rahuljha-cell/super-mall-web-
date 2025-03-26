"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash, Calendar } from "lucide-react"
import Link from "next/link"
import { logger } from "@/lib/logger"

interface Offer {
  id: string
  title: string
  discount: number
  startDate: Date
  endDate: Date
  isActive: boolean
  shopName: string
  shopId: string
}

export default function OffersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get("shopId")

  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchOffers = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        logger.info("Fetching offers", {
          module: "Offers",
          userId: user.uid,
          data: { shopId },
        })

        let offersQuery

        if (shopId) {
          // Fetch offers for a specific shop
          offersQuery = query(
            collection(db, "offers"),
            where("shopId", "==", shopId),
            orderBy("createdAt", "desc"),
            limit(20),
          )
        } else {
          // Fetch all offers for the merchant
          offersQuery = query(
            collection(db, "offers"),
            where("ownerId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(20),
          )
        }

        const querySnapshot = await getDocs(offersQuery)

        if (querySnapshot.empty) {
          setOffers([])
        } else {
          const offersList: Offer[] = []

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            offersList.push({
              id: doc.id,
              title: data.title,
              discount: data.discount,
              startDate: data.startDate?.toDate() || new Date(),
              endDate: data.endDate?.toDate() || new Date(),
              isActive: data.isActive,
              shopName: data.shopName,
              shopId: data.shopId,
            })
          })

          setOffers(offersList)
        }
      } catch (error) {
        logger.error("Error fetching offers", {
          module: "Offers",
          userId: user.uid,
          data: { error, shopId },
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchOffers()
    }
  }, [user, shopId])

  if (loading || (isLoading && offers.length === 0)) {
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
          <h1 className="text-3xl font-bold">Offers & Promotions</h1>
          <p className="text-muted-foreground">Manage special offers and discounts for your products</p>
        </div>

        <Button asChild>
          <Link href={shopId ? `/merchant/offers/create?shopId=${shopId}` : "/merchant/offers/create"}>
            <Plus className="h-4 w-4 mr-2" />
            Create Offer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Offers</CardTitle>
          <CardDescription>View and manage your special offers and promotions</CardDescription>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't created any offers yet</p>
              <Button asChild>
                <Link href={shopId ? `/merchant/offers/create?shopId=${shopId}` : "/merchant/offers/create"}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Offer
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell>{offer.shopName}</TableCell>
                      <TableCell className="text-right">{offer.discount}%</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {offer.startDate.toLocaleDateString()} - {offer.endDate.toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={offer.isActive ? "default" : "secondary"}>
                          {offer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/merchant/offers/edit/${offer.id}`}>
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
      </Card>
    </div>
  )
}

