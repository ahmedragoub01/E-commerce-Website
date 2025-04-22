"use client";

import { Table, TableBody, TableCaption, TableHeader, TableHead, TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import Link from "next/link";




export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/orders");
                if (!response.ok) {
                    throw new Error("Failed to fetch orders");
                }
                const data = await response.json();
                setOrders(data);
            } catch (err:any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);


    const handleDelete = async (orderId: string) => {
        if (!confirm("Are you sure you want to delete this order?")) return;

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete order");
            }

            setOrders(orders.filter(order => order._id !== orderId));
            alert("Order deleted successfully");
        } catch (err : any) {
            alert(err.message);
        }
    };

    if (loading) {
        return <div className="p-4">Loading orders...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Orders Management</h1>
            </div>

            <Table>
                <TableCaption>A list of orders in your store</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ordered On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order._id}>
                            <TableCell className="font-medium">{order.user.name}</TableCell>
                            <TableCell>${order.total.toFixed(2)}</TableCell>
                            <TableCell>{order.status}</TableCell>
                            <TableCell>
                                {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Link href={`/admin/orders/${order._id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4 mr-1" />
                                        </Button>
                                    </Link>
                                    <Link href={`/admin/orders/${order._id}`}>
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-1" />
                                        </Button>
                                    </Link>
                                    
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4}>Total Orders</TableCell>
                        <TableCell className="text-right">{orders.length}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}