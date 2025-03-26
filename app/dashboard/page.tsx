"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Store, BarChart, Package, Users, Settings } from "lucide-react"
import Link from "next/link"
import { logger } from "@/lib/logger"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userType, setUserType] = useState<"customer" | "merchant" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) return

      try {
        logger.info("Fetching user profile", {
          module: "Dashboard",
          userId: user.uid,
        })

        const userRef = collection(db, "users")
        const q = query(userRef, where("uid", "==", user.uid))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data()
          setUserType(userData.userType || "customer")
        } else {
          // Default to customer if no profile found
          setUserType("customer")
        }
      } catch (error) {
        logger.error("Error fetching user profile", {
          module: "Dashboard",
          userId: user.uid,
          data: { error },
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchUserType()
    }
  }, [user])

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Tabs defaultValue={userType || "customer"} className="space-y-6">
        <TabsList>
          <TabsTrigger value="customer">Customer Dashboard</TabsTrigger>
          <TabsTrigger value="merchant">Merchant Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">You haven't placed any orders yet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saved Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No items saved to your wishlist</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Shops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">You haven't visited any shops yet</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common actions you might want to take</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" asChild className="h-20 flex flex-col justify-center">
                  <Link href="/shops">
                    <ShoppingBag className="h-5 w-5 mb-1" />
                    <span>Browse Shops</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-20 flex flex-col justify-center">
                  <Link href="/profile">
                    <Users className="h-5 w-5 mb-1" />
                    <span>My Profile</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-20 flex flex-col justify-center">
                  <Link href="/orders">
                    <Package className="h-5 w-5 mb-1" />
                    <span>My Orders</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-20 flex flex-col justify-center">
                  <Link href="/settings">
                    <Settings className="h-5 w-5 mb-1" />
                    <span>Settings</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your browsing history</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Start browsing shops to get personalized recommendations
                </p>
                <Button asChild className="mt-4">
                  <Link href="/shops">Explore Shops</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="merchant" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">You haven't added any products yet</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No active offers at the moment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No orders received yet</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Actions</CardTitle>
                <CardDescription>Manage your shop and products</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" asChild className="h-20 flex flex-col justify-center">
                  <Link href="/merchant/shop">
                    <Store className="h-5 w-5 mb-1" />
                    <span>Manage Shop</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-20 flex flex-col justify-center">
                  <Link href="/merchant/products">
                    <Package className="h-5 w-5 mb-1" />
                    <span>Products</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-20 flex flex-col justify-center">
                  <Link href="/merchant/offers">
                    <ShoppingBag className="h-5 w-5 mb-1" />
                    <span>Offers</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-20 flex flex-col justify-center">
                  <Link href="/merchant/analytics">
                    <BarChart className="h-5 w-5 mb-1" />
                    <span>Analytics</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shop Setup</CardTitle>
                <CardDescription>Complete your shop profile to start selling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You need to set up your shop details before you can start selling products.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/merchant/shop/create">Create Shop</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

