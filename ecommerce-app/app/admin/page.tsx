"use client";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
  Paper,
  Divider,
  Container,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  BarChart,
  PieChart,
  LineChart,
  ChartsLegend,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  Line,
} from "@mui/x-charts";
import {
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  Users,
  DollarSign,
  Map,
} from "lucide-react";
import { useEffect, useState } from "react";

interface RevenueComparison {
  totalRevenue: number;
  revenueGrowth: number;
}
interface TopSellingProduct {
  product: string;
  sales: number;
  totalRevenue: number;
}

// Create a custom theme with blue-700 as primary color
const customTheme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // blue-700
      light: "#42a5f5",
      dark: "#1565c0",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    success: {
      main: "#10b981",
    },
    error: {
      main: "#ef4444",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          borderRadius: 16,
        },
      },
    },
  },
});

export default function AdminDashboard() {
  const theme = useTheme();
  const [monthlysales, setMonthlysales] = useState([]);
  const [categorysales, setCategorysales] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState<
    TopSellingProduct[]
  >([]);
  const [regionsSelling, setRegionsSelling] = useState([]);

  // Cartes de statistiques avec icônes Lucide
  const [statsCards, setStatsCards] = useState([
    {
      title: "Total Revenue",
      value: `$0`,
      change: `+0%`,
      trend: "up",
      icon: <DollarSign size={24} color="#ffffff" />,
      progress: 0,
      bgColor: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
    },
    {
      title: "New Orders",
      value: "0",
      change: `+0%`,
      trend: "up",
      icon: <ShoppingCart size={24} color="#ffffff" />,
      progress: 0,
      bgColor: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
    },
    {
      title: "Number Users",
      value: "0",
      change: "0%",
      trend: "up",
      icon: <Users size={24} color="#ffffff" />,
      progress: 0,
      bgColor: "linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)",
    },
  ]);

  // Styles réutilisables
  const styles = {
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 2,
    },
    statCard: {
      height: "100%",
      transition: "transform 0.3s, box-shadow 0.3s",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
    activityItem: {
      display: "flex",
      alignItems: "center",
      gap: 2,
      py: 1.5,
      px: 2,
      borderRadius: "10px",
      "&:hover": {
        backgroundColor: "rgba(25, 118, 210, 0.05)",
      },
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 56,
      height: 56,
      borderRadius: "12px",
      color: "#ffffff",
    },
    chartContainer: {
      borderRadius: 16,
      overflow: "hidden",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      height: "100%",
    },
  };

  // Function to convert month number to month name
  const getMonthName = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Ensure monthNumber is within valid range (1-12)
    // Subtract 1 because array is 0-indexed but months are 1-indexed
    const index = parseInt(monthNumber) - 1;

    if (isNaN(index) || index < 0 || index >= 12) {
      return "Unknown";
    }

    return months[index];
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders/dashbord");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();

        // Transform monthly sales data to use month names instead of numbers
        const safeMonthly = Array.isArray(data.monthlySales)
          ? data.monthlySales.map((item) => ({
              month: getMonthName(item.month), // Convert number to month name
              totalRevenue: item.totalRevenue || 0,
            }))
          : [];

        const safeCategories = Array.isArray(data.categoriesResult)
          ? data.categoriesResult.map((item) => ({
              id: item.id || "Unknown",
              value: item.value || 0,
              label: item.label || "Unknown",
            }))
          : [];

        const safeTopProducts = Array.isArray(data.topProductsResult)
          ? data.topProductsResult.map((item) => ({
              product: item.product || "Unknown Product",
              sales: item.sales || 0,
              totalRevenue: item.totalRevenue || 0,
            }))
          : [];

        console.log("Processed top products:", data); // Add this log
        setTopSellingProducts(safeTopProducts);

        const safeRegions = Array.isArray(data.ordersByCountry)
          ? data.ordersByCountry.map((item) => ({
              _id: item._id || "Palestine",
              totalRevenue: item.totalRevenue || 0,
            }))
          : [];

        setMonthlysales(safeMonthly);
        setCategorysales(safeCategories);
        setTopSellingProducts(safeTopProducts);
        setRegionsSelling(safeRegions);

        // Safe extraction of comparison values with defaults
        const revenueComp = data.revenueComparison || {};
        const ordersComp = data.ordersComparison || {};
        const usersComp = data.usersComparison || {};

        setStatsCards((prevCards) => [
          {
            ...prevCards[0],
            value: `$${revenueComp.totalRevenue || 0}`,
            change: `+${revenueComp.revenueGrowth || "0.00"}%`,
            progress: parseFloat(revenueComp.revenueGrowth) || 0,
            bgColor: "linear-gradient(135deg, #1976d2 0%, #2196f3 100%)",
          },
          {
            ...prevCards[1],
            value: `${ordersComp.currentMonthOrders || 0}`, // Displaying the number of orders
            change: `+${ordersComp.ordersGrowth || "0.00"}%`,
            progress: parseFloat(ordersComp.ordersGrowth) || 0,
            bgColor: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
          },
          {
            ...prevCards[2],
            value: `${usersComp.currentMonthUsers || 0}`, // Displaying the number of users
            change: `+${usersComp.usersGrowth || "0.00"}%`,
            progress: parseFloat(usersComp.usersGrowth) || 0,
            bgColor: "linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)",
          },
        ]);
      } catch (err) {
        console.log("Error fetching data:", err.message);
        // Set default empty arrays to prevent rendering errors
        setMonthlysales([]);
        setCategorysales([]);
        setTopSellingProducts([]);
        setRegionsSelling([]);
      }
    };

    fetchOrders();
  }, []);

  // Process monthly sales data for the chart
  const processedMonthlySales = () => {
    // If we have 0 or 1 points, handle this special case
    if (!monthlysales || monthlysales.length <= 1) {
      if (monthlysales.length === 0) {
        // If no data, return empty array
        return [];
      } else if (monthlysales.length === 1) {
        // If only one point, duplicate it with slight variation to create a line
        const singlePoint = monthlysales[0];
        return [
          { ...singlePoint },
          {
            month: `${singlePoint.month} (Projected)`,
            totalRevenue: singlePoint.totalRevenue * 1.1, // Add 10% for projection
          },
        ];
      }
    }
    // Otherwise return the original data
    return monthlysales;
  };

  // Custom formatter to safely handle values
  const safeValueFormatter = (value) => {
    if (value === null || value === undefined) return "$0";
    return `$${value}`;
  };

  const chartColors = ["#1976d2", "#42a5f5", "#90caf9", "#bbdefb", "#e3f2fd"];

  // Check if data is available before rendering charts
  const hasMonthlyData = Array.isArray(monthlysales) && monthlysales.length > 0;
  const hasCategoryData =
    Array.isArray(categorysales) && categorysales.length > 0;
  const hasRegionData =
    Array.isArray(regionsSelling) && regionsSelling.length > 0;

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ backgroundColor: "#fffff", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl" sx={{ p: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              mb: 4,

              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            Admin Dashboard
          </Typography>

          {/* Stats Cards - Three in a row with beautiful gradients */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    ...styles.statCard,
                    background: stat.bgColor,
                    color: "#ffffff",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{ opacity: 0.9, fontWeight: 500, mb: 0.5 }}
                        >
                          {stat.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{ fontWeight: 700, mb: 1 }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 1,
                            display: "flex",
                            alignItems: "center",
                            color: "#ffffff",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.875rem",
                            width: "fit-content",
                          }}
                        >
                          {stat.change}
                          {stat.trend === "up" ? (
                            <ArrowUp size={16} style={{ marginLeft: 4 }} />
                          ) : (
                            <ArrowDown size={16} style={{ marginLeft: 4 }} />
                          )}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          ...styles.iconContainer,
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(Math.max(stat.progress, 0), 100)} // Ensure progress is between 0-100
                      sx={{
                        mt: 2,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#ffffff",
                        },
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts Grid - Line Chart and Pie Chart */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Monthly Sales Line Chart */}
            <Grid item xs={12} lg={8} width={600}>
              <Paper sx={{ p: 3, borderRadius: "16px", height: "100%" }}>
                <Box sx={styles.cardHeader}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1976d2" }}
                  >
                    Monthly Sales Trend
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 350,
                    mt: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!hasMonthlyData ? (
                    <Typography color="text.secondary">
                      No monthly sales data available
                    </Typography>
                  ) : (
                    <LineChart
                      dataset={processedMonthlySales()}
                      series={[
                        {
                          dataKey: "totalRevenue",
                          label: "Revenue",
                          color: "#1976d2",
                          valueFormatter: safeValueFormatter,
                          curve: "monotoneX", // Better for creating smooth lines with fewer points
                          showMark: true,
                          area: false,
                          areaOpacity: 0.2,
                          connectNulls: true, // Connect across null values
                          lineWidth: 3, // Thicker line for better visibility
                        },
                      ]}
                      xAxis={[
                        {
                          dataKey: "month",
                          scaleType: "point",
                          tickLabelStyle: {
                            angle: 0,
                            textAnchor: "middle",
                          },
                        },
                      ]}
                      yAxis={[
                        {
                          label: "",
                          labelStyle: {
                            transform: "translateY(-20px)",
                          },
                          min: 0, // Start y-axis at 0
                        },
                      ]}
                      margin={{ left: 70, right: 30, top: 20, bottom: 30 }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        "& .MuiChartsAxis-label": {
                          fill: "#64748b",
                        },
                        "& .MuiChartsAxis-tick": {
                          fill: "#64748b",
                        },
                      }}
                      slotProps={{
                        legend: {
                          direction: "row",
                          position: {
                            vertical: "top",
                            horizontal: "right",
                          },
                          padding: 10,
                        },
                      }}
                    >
                      <ChartsXAxis />
                      <ChartsYAxis />
                      <ChartsTooltip
                        sx={{
                          backgroundColor: "#ffffff",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          borderRadius: "30px",
                        }}
                      />
                      <ChartsLegend />
                    </LineChart>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Product Distribution Pie Chart */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, borderRadius: "16px", height: "100%" }}>
                <Box sx={styles.cardHeader}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1976d2" }}
                  >
                    Product Distribution
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 350,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!hasCategoryData ? (
                    <Typography color="text.secondary">
                      No category data available
                    </Typography>
                  ) : (
                    <PieChart
                      series={[
                        {
                          data: categorysales,
                          innerRadius: 70,
                          outerRadius: 120,
                          paddingAngle: 3,
                          cornerRadius: 5,
                          highlightScope: { fade: "global", highlight: "item" },
                          faded: {
                            innerRadius: 70,
                            additionalRadius: -20,
                            color: "rgba(0,0,0,0.2)",
                          },
                        },
                      ]}
                      colors={chartColors}
                      slotProps={{
                        legend: {
                          direction: "row", // ← make legend items lay out horizontally
                          position: {
                            vertical: "bottom", // or "top"/"middle"
                            horizontal: "center", // or "left"/"right"
                          },
                          padding: 20,
                        },
                      }}
                      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                      sx={{
                        "& .MuiChartsLegend-label": {
                          fill: "#64748b",
                        },
                      }}
                    >
                      <ChartsTooltip
                        sx={{
                          backgroundColor: "#ffffff",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          borderRadius: "8px",
                        }}
                      />
                      <ChartsLegend />
                    </PieChart>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Algerian Regions Bar Chart */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: "16px" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "30px",
                      backgroundColor: "rgba(25, 118, 210, 0.1)",
                      color: "#1976d2",
                      mr: 2,
                    }}
                  >
                    <Map size={24} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1976d2" }}
                  >
                    Top Algerian Regions
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 350,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!hasRegionData ? (
                    <Typography color="text.secondary">
                      No regional data available
                    </Typography>
                  ) : (
                    <BarChart
                      dataset={regionsSelling}
                      borderRadius={30}
                      series={[
                        {
                          dataKey: "totalRevenue",
                          label: "Sales",
                          valueFormatter: safeValueFormatter,
                          color: "#1976d2",
                        },
                      ]}
                      xAxis={[
                        {
                          dataKey: "_id",
                          scaleType: "band",
                          label: "Region",
                          categoryGapRatio: 0.6,
                          barGapRatio: 0.4,
                        },
                      ]}
                      yAxis={[
                        {
                          label: "Revenue ($)",
                        },
                      ]}
                      layout="vertical"
                      margin={{ left: 100, right: 30, top: 30, bottom: 50 }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        "& .MuiChartsAxis-label": {
                          fill: "#64748b",
                        },
                        "& .MuiChartsAxis-tick": {
                          fill: "#64748b",
                        },
                      }}
                    >
                      <ChartsXAxis />
                      <ChartsYAxis />
                      <ChartsTooltip
                        sx={{
                          backgroundColor: "#ffffff",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          borderRadius: "30px",
                        }}
                      />
                    </BarChart>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Selling Products Section */}
          <Paper sx={{ p: 3, borderRadius: "16px" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                  color: "#1976d2",
                  mr: 2,
                }}
              >
                <ShoppingCart size={24} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1976d2" }}
              >
                Top Selling Products
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ ml: "auto", fontSize: "0.875rem", fontWeight: 500 }}
              >
                This Month
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />

            {topSellingProducts.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No product data available
                </Typography>
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {topSellingProducts.map((product, index) => (
                  <ListItem
                    key={product.product || `product-${index}`}
                    sx={{
                      ...styles.activityItem,
                      backgroundColor:
                        index % 2 === 0
                          ? "rgba(25, 118, 210, 0.03)"
                          : "transparent",
                      borderRadius: "8px",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        backgroundColor: "rgba(25, 118, 210, 0.1)",
                        color: "#1976d2",
                        mr: 2,
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      #{index + 1}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {product.product || "Unknown Product"}
                        </Typography>
                      }
                      secondary={`${product.sales || 0} units sold`}
                    />
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: "#1976d2" }}
                    >
                      ${product.totalRevenue || 0}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
