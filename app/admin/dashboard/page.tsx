"use client"

import { CardFooter } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Users, ShoppingBag, Store, Settings, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { logger } from "@/lib/logger"

interface AdminStats {
  totalUsers: number
  totalShops: number
  totalProducts: number
  totalOrders: number
}

interface Shop {
  id: string
  name: string
  ownerEmail: string
  location: string
  createdAt: Date
  isActive: boolean
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    totalOrders: 0,
  })
  const [recentShops, setRecentShops] = useState<Shop[]>([])

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return

      try {
        logger.info("Checking admin status", {
          module: "Admin",
          userId: user.uid,
        })

        const userRef = collection(db, "users")
        const q = query(userRef, where("uid", "==", user.uid))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data()
          setIsAdmin(userData.isAdmin === true)

          if (userData.isAdmin !== true) {
            router.push("/dashboard")
          }
        } else {
          router.push("/dashboard")
        }
      } catch (error) {
        logger.error("Error checking admin status", {
          module: "Admin",
          userId: user.uid,
          data: { error },
        })
        router.push("/dashboard")
      }
    }

    if (user) {
      checkAdminStatus()
    }
  }, [user, router])

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user || !isAdmin) return

      try {
        setIsLoading(true)
        logger.info("Fetching admin dashboard data", {
          module: "Admin",
          userId: user.uid,
        })

        // Fetch stats
        const usersRef = collection(db, "users")
        const usersSnapshot = await getDocs(usersRef)

        const shopsRef = collection(db, "shops")
        const shopsSnapshot = await getDocs(shopsRef)

        const productsRef = collection(db, "products")
        const productsSnapshot = await getDocs(productsRef)

        const ordersRef = collection(db, "orders")
        const ordersSnapshot = await getDocs(ordersRef)

        setStats({
          totalUsers: usersSnapshot.size,
          totalShops: shopsSnapshot.size,
          totalProducts: productsSnapshot.size,
          totalOrders: ordersSnapshot.size,
        })

        // Fetch recent shops
        const recentShopsQuery = query(collection(db, "shops"), orderBy("createdAt", "desc"), limit(5))

        const recentShopsSnapshot = await getDocs(recentShopsQuery)
        const shopsList: Shop[] = []

        recentShopsSnapshot.forEach((doc) => {
          const data = doc.data()
          shopsList.push({
            id: doc.id,
            name: data.name,
            ownerEmail: data.ownerEmail,
            location: data.location,
            createdAt: data.createdAt?.toDate() || new Date(),
            isActive: data.isActive,
          })
        })

        setRecentShops(shopsList)
      } catch (error) {
        logger.error("Error fetching admin data", {
          module: "Admin",
          userId: user.uid,
          data: { error },
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isAdmin) {
      fetchAdminData()
    }
  }, [user, isAdmin])

  if (loading || (isLoading && !isAdmin)) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <Users className="h-4 w-4 text-muted-foreground mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShops}</div>
            <Store className="h-4 w-4 text-muted-foreground mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <ShoppingBag className="h-4 w-4 text-muted-foreground mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <BarChart className="h-4 w-4 text-muted-foreground mt-1" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shops" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shops">Shops</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="shops">
          <Card>
            <CardHeader>
              <CardTitle>Recent Shops</CardTitle>
              <CardDescription>Recently created shops on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentShops.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.ownerEmail}</TableCell>
                      <TableCell>{shop.location}</TableCell>
                      <TableCell>{shop.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={shop.isActive ? "default" : "secondary"}>
                          {shop.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/shops/${shop.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/shops/edit/${shop.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/admin/shops">View All Shops</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and their permissions</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Button asChild>
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>Manage product categories and floor assignments</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/admin/categories">Manage Categories</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/floors">Manage Floors</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Configure system settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Button asChild>
                <Link href="/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

