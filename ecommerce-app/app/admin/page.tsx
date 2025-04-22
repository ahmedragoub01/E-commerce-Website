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
  ListItemText
} from '@mui/material';
import {
  BarChart,
  PieChart,
  ChartsLegend,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis
} from '@mui/x-charts';
import { 
  ArrowUp, 
  ArrowDown, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Map
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface RevenueComparison {
  totalRevenue: number;
  revenueGrowth: number;
}
interface TopSellingProduct {
  product: string;
  sales: number;
  totalRevenue: number;
}


export default function AdminDashboard() {
  const theme = useTheme();
  const [monthlysales, setMonthlysales] = useState([]);
  const [categorysales, setCategorysales] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProduct[]>([]);
  const [regionsSelling, setRegionsSelling] = useState([]);

  // Cartes de statistiques avec icônes Lucide
  const [statsCards,setStatsCards] = useState([ 
    { 
      title: 'Total Revenue', 
      value: ``, 
      change: `+0%`, 
      trend: 'up',
      icon: <DollarSign size={24} />,
      progress: 0
    },
    { 
      title: 'New Orders', 
      value: '', 
      change: `+0%`, 
      trend: 'up',
      icon: <ShoppingCart size={24} />,
      progress: 0
    },
    { 
      title: 'Number Users', 
      value: '', 
      change: '0%', 
      trend: 'up',
      icon: <Users size={24} />,
      progress: 0
    },
  ]);

  // Styles réutilisables
  const styles = {
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 2
    },
    statCard: {
      height: '100%',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[6]
      }
    },
    activityItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      py: 1.5,
      px: 2,
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
        borderRadius: 1
      }
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 48,
      borderRadius: '50%',
      bgcolor: theme.palette.background.paper
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders/dashbord");
            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }
            const data = await response.json();
            setMonthlysales(data.monthlySales);
            setCategorysales(data.categoriesResult);
            setTopSellingProducts(data.topProductsResult);
            setRegionsSelling(data.ordersByCountry);
            console.log(data);
            setStatsCards((prevCards) => [
              { 
                ...prevCards[0], // Keep existing properties
                value: `$${data.revenueComparison.currentMonthRevenue}`, // Update value
                change: `+${data.revenueComparison.revenueGrowth}%`,  // Update change
                progress: data.revenueComparison.revenueGrowth     // Update progress
              },
              {
                ...prevCards[1], // Keep existing properties
                value: data.ordersComparison.currentMonthOrders, // Update value
                change: `+${data.ordersComparison.ordersGrowth}%`,  // Update change
                progress: data.ordersComparison.ordersGrowth     // Update progress
              },
              {
                ...prevCards[2], // Keep existing properties
                value: data.usersComparison.currentMonthUsers, // Update value
                change: `+${data.usersComparison.usersGrowth}%`,  // Update change
                progress: data.usersComparison.usersGrowth     // Update progress
              }
            ]);
        } catch (err:any) {
            console.log(err.message);
        }
    };

    fetchOrders();
}, []);

  return (
    <Container maxWidth="xl" sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        mb: 4,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        Admin Dashboard
      </Typography>

      {/* Stats Cards - Centered */}
      <Grid container justifyContent="center" spacing={15} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid key={index}>
            <Card sx={styles.statCard}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography
                      sx={{ mt: 1, display: 'flex', alignItems: 'center' }}
                      color={stat.trend === 'up' ? 'success.main' : 'error.main'}
                    >
                      {stat.change} 
                      {stat.trend === 'up' ? 
                        <ArrowUp size={16} style={{ marginLeft: 4 }} /> : 
                        <ArrowDown size={16} style={{ marginLeft: 4 }} />}
                    </Typography>
                  </Box>
                  <Box sx={styles.iconContainer}>
                    {stat.icon}
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stat.progress} 
                  sx={{ 
                    mt: 2,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: stat.trend === 'up' ? 
                        theme.palette.success.main : 
                        theme.palette.error.main
                    }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid - Only Bar Chart and Pie Chart */}
      <Grid container justifyContent="center" spacing={3} sx={{ mb: 4 }}>
        {/* Monthly Sales Bar Chart */}
        <Grid>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Box sx={styles.cardHeader}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Monthly Sales
              </Typography>
            </Box>
            <Box  sx={{ height: 200,width:'20cm', mt:8 }}>
              <BarChart
                dataset={monthlysales}
                series={[
                  { 
                    dataKey: 'totalRevenue', 
                    label: 'Sales', 
                    color: theme.palette.primary.main 
                  }
                ]}
                xAxis={[
                  { 
                    dataKey: 'month', 
                    scaleType: 'band',
                    label: 'Month'
                  }
                ]}
                yAxis={[
                  {
                    label: 'Amount ($)'
                  }
                ]}
                margin={{ left: 70, right: 30, top: 0, bottom: 0 }}
                sx={{
                  width: '100%',
                  height: '100%'
                }}
              >
                <ChartsXAxis />
                <ChartsYAxis />
                <ChartsTooltip />
                <ChartsLegend />
              </BarChart>
            </Box>
          </Paper>
        </Grid>

        {/* Product Distribution Pie Chart */}
        <Grid>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Box sx={styles.cardHeader}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Product Distribution
              </Typography>
            </Box>
            <Box sx={{ height: 350, display: 'flex', flexDirection: 'column' }}>
              <PieChart
                series={[
                  {
                    data: categorysales,
                    innerRadius: 50,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                  }
                ]}
                colors={[
                  theme.palette.primary.main,
                  theme.palette.secondary.main,
                  theme.palette.error.main,
                  theme.palette.warning.main,
                  theme.palette.info.main,
                ]}
                slotProps={{
                  legend: {
                    direction: 'horizontal',
                    position: { vertical: 'middle', horizontal: 'center' },
                  },
                }}
                margin={{ top: 30, bottom: 100 }}
              >
                <ChartsTooltip />
                <ChartsLegend />
              </PieChart>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Top Algerian Regions Bar Chart */}
      <Grid >
          <Card >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Map size={24} style={{ marginRight: 8 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top Algerian Regions
                </Typography>
              </Box>
              
              <Box sx={{ height: 250 }}>
                <BarChart
                  dataset={regionsSelling}
                  series={[
                    { 
                      dataKey: 'totalRevenue', 
                      label: 'Sales', 
                      valueFormatter: (value) => `$ ${value}`,
                      color: theme.palette.primary.main 
                    }
                  ]}
                  xAxis={[
                    { 
                      dataKey: '_id', 
                      scaleType: 'band',
                      label: 'Region'
                    }
                  ]}
                  yAxis={[
                    {
                      label: 'Units Sold'
                    }
                  ]}
                  layout="vertical"
                  margin={{ left: 80, right: 30, top: 30, bottom: 50 }}
                  sx={{
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <ChartsXAxis />
                  <ChartsYAxis />
                  <ChartsTooltip />
                </BarChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      {/* Recent Activity Section */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Box sx={styles.cardHeader}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Top Selling Products
          </Typography>
          <Typography color="text.secondary">
            This Month
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <List>
          {topSellingProducts.map((product) => (
            <ListItem key={product.product} sx={styles.activityItem}>
              <ListItemText
                primary={product.product}
                secondary={`${product.sales} units sold`}
              />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                ${product.totalRevenue}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}