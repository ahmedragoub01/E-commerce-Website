import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');

        // Calculate date 6 months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Build match query
        const matchQuery: any = {
            createdAt: { $gte: sixMonthsAgo },
            ...(userId && { user: new mongoose.Types.ObjectId(userId) }),
            ...(status && { status: status })
        };

        // First get the aggregated monthly data without populating
        const ordersByMonth = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: "$total" },
                    totalDiscount: { $sum: "$discount" },
                    orderIds: { $push: "$_id" } // Collect just the order IDs
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1,
                    totalRevenue: 1,
                    totalDiscount: 1,
                    netRevenue: { $subtract: ["$totalRevenue", "$totalDiscount"] },
                    orderIds: 1
                }
            }
        ]);

        // Get all order IDs from the aggregation
        const allOrderIds = ordersByMonth.flatMap(month => month.orderIds);

        // Fetch and populate all orders in one query
        const populatedOrders = await Order.find({
            _id: { $in: allOrderIds }
        })
            .populate('user', 'name email')
            .populate({
                path: 'items.product',
                populate: {
                    path: 'category',  // Assuming 'category' is the reference field in Product
                    select: 'name'      // Only get the name field from Category
                }
            });

        // Map the populated orders back to the monthly structure
        interface MonthlyOrderData {
            year: number;
            month: number;
            count: number;
            totalRevenue: number;
            totalDiscount: number;
            netRevenue: number;
            orderIds: mongoose.Types.ObjectId[];
        }

        interface PopulatedOrder {
            _id: mongoose.Types.ObjectId;
            user: {
                name: string;
                email: string;
            };
            items: {
                product: any; // Replace `any` with the appropriate type if available
            }[];
        }

        const result: Array<MonthlyOrderData & { orders: PopulatedOrder[] }> = ordersByMonth.map(month => ({
            ...month,
            orders: populatedOrders.filter(order =>
                month.orderIds.some((id: { equals: (arg0: any) => any; }) => id.equals(order._id))
            )
        }));

        // Group orders by category and calculate the best 4 categories
        const categoryMap: Map<string, { orders: PopulatedOrder[]; totalRevenue: number }> = new Map();

        populatedOrders.forEach(order => {
            order.items.forEach((item: { product: { category: { name: string; }; }; }) => {
                const category = item.product.category.name || 'Unknown'; // Replace 'Unknown' with a default category if needed
                if (!categoryMap.has(category)) {
                    categoryMap.set(category, { orders: [], totalRevenue: 0 });
                }
                const categoryData = categoryMap.get(category)!;
                categoryData.orders.push(order);
                categoryData.totalRevenue += order.total;
            });
        });

        // Sort categories by total revenue and pick the top 4
        const sortedCategories = Array.from(categoryMap.entries())
            .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue);

        const topCategories = sortedCategories.slice(0, 4);
        const otherCategories = sortedCategories.slice(4);

        // Combine the "Others" category
        const othersCategory = {
            category: 'Others',
            orders: otherCategories.flatMap(([_, data]) => data.orders),
            totalRevenue: otherCategories.reduce((sum, [_, data]) => sum + data.totalRevenue, 0)
        };

        // Prepare the final category result
        const categoriesResult = topCategories.map(([category, data]) => ({
            category,
            orders: data.orders,
            totalRevenue: data.totalRevenue
        }));

        if (othersCategory.orders.length > 0) {
            categoriesResult.push(othersCategory);
        }
        // Calculate the percentage of each category
        const totalCategoriesRevenue = categoriesResult.reduce((sum, category) => sum + category.totalRevenue, 0);

        const categoriesWithPercentage = categoriesResult.map(category => ({
            label: category.category,
            value: totalCategoriesRevenue > 0 ? ((category.totalRevenue / totalCategoriesRevenue) * 100).toFixed(2) : '0.00' // Percentage with 2 decimal places
        }));

        // Calculate the start and end of the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Ensure endOfMonth covers the entire last day of the month
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const topProductsResult = await Order.aggregate([
            {
                // 2. Deconstruct the items array
                $unwind: "$items"
            },
            {
                // 3. Group by product ID, sum quantity and calculate revenue
                $group: {
                    _id: "$items.product", // Group by Product ObjectId
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            {
                // 4. Sort by total quantity sold (descending)
                $sort: { totalQuantity: -1 }
            },
            {
                // 5. Limit to the top 5 products
                $limit: 5
            },
            {
                // 6. Join with the products collection to get product details
                $lookup: {
                    from: Product.collection.name, // Use model's collection name
                    localField: "_id",           // Product ObjectId from $group
                    foreignField: "_id",         // Product ObjectId in 'products' collection
                    as: "productDetails"
                }
            },
            {
                // 7. Deconstruct the productDetails array
                $unwind: {
                    path: "$productDetails",
                    preserveNullAndEmptyArrays: true // Keep item even if product was deleted
                }
            },
            {
                // 8. Project the final desired output format
                $project: {
                    _id: 0, // Exclude the default _id (product ObjectId)
                    // Use $ifNull in case product was deleted (if preserveNull... is true)
                    product: { $ifNull: ["$productDetails.name", "Unknown Product"] },
                    sales: "$totalQuantity", // Rename field to 'sales'
                    totalRevenue: "$totalRevenue" // Include calculated revenue
                }
            }
        ]);

        let ordersByCountry = await Order.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: "$shippingAddress.country",
                    count: { $sum: 1 },
                    totalRevenue: { $sum: "$total" },
                    totalDiscount: { $sum: "$discount" },
                }
            },
            { $sort: { totalRevenue: -1 } }, // Sort by total revenue for top regions
            { $limit: 5 }
        ]);

        // Calculate total revenue for the last six months
        const totalRevenueLastSixMonths = result.reduce((sum, monthData) => sum + monthData.totalRevenue, 0);

        // Calculate total revenue for the current month
        const currentMonthRevenue = result.reduce((sum, month) => {
            if (month.year === now.getFullYear() && month.month === now.getMonth() + 1) {
                return sum + month.totalRevenue;
            }
            return sum;
        }, 0);

        // Calculate total revenue for the previous month
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthRevenue = result.reduce((sum, month) => {
            if (month.year === previousMonth.getFullYear() && month.month === previousMonth.getMonth() + 1) {
                return sum + month.totalRevenue;
            }
            return sum;
        }, 0);

        // Calculate growth percentage
        const revenueGrowth = previousMonthRevenue
            ? (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(2)
            : '0.00'; // Default to 0.00 if no previous month data

        // Add the revenue and growth to the response
        const revenueComparison = {
            totalRevenue: totalRevenueLastSixMonths,
            currentMonthRevenue,
            revenueGrowth: `${revenueGrowth}%`
        };

        // Calculate the number of orders for the current month
        const currentMonthOrders = await Order.countDocuments();;

        // Calculate the number of orders for the previous month
        const previousMonthOrders = result.reduce((sum, month) => {
            if (month.year === previousMonth.getFullYear() && month.month === previousMonth.getMonth() + 1) {
                return sum + month.count;
            }
            return sum;
        }, 0);

        // Calculate growth percentage for orders
        const ordersGrowth = previousMonthOrders
            ? (((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100).toFixed(2)
            : '0.00'; // Default to 0.00

        // Add the orders comparison to the response
        const ordersComparison = {
            currentMonthOrders,
            ordersGrowth: `${ordersGrowth}%`
        };

        const numberUsersNow = await User.countDocuments();
        // Calculate the number of users created in the current month
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const currentMonthUsers = await User.countDocuments({
        });

        // Calculate the number of users created in the previous month
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const previousMonthUsers = await User.countDocuments({
            createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth }
        });

        const usersGrowth = previousMonthUsers
            ? (((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100).toFixed(2)
            : '10.0'; // Default to 0.00

        const usersComparison = {
            currentMonthUsers,
            usersGrowth: `${usersGrowth}%`
        };

        // Add the categories result to the response
        return NextResponse.json({
            monthlySales: result,
            categoriesResult: categoriesWithPercentage,
            topProductsResult,
            ordersByCountry,
            revenueComparison,
            ordersComparison,
            usersComparison
        });

    } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data', details: error.message },
            { status: 500 }
        );
    }
}