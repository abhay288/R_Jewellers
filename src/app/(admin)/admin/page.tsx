import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: "Orders",
      value: "+2350",
      change: "+15.2%",
      isPositive: true,
      icon: Package,
    },
    {
      title: "Active Customers",
      value: "+12,234",
      change: "+4.1%",
      isPositive: true,
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      change: "-1.1%",
      isPositive: false,
      icon: TrendingUp,
    },
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", product: "Diamond Ring", amount: "$1,200", status: "Completed" },
    { id: "ORD-002", customer: "Jane Smith", product: "Gold Necklace", amount: "$850", status: "Processing" },
    { id: "ORD-003", customer: "Alice Johnson", product: "Pearl Earrings", amount: "$450", status: "Pending" },
    { id: "ORD-004", customer: "Bob Williams", product: "Silver Bracelet", amount: "$200", status: "Completed" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <div className="p-2 bg-secondary/50 rounded-lg">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div className={`flex items-center mt-1 text-xs font-medium ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  <span>{stat.change} from last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Placeholder Chart Area */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-playfair font-bold text-lg">Revenue Overview</h3>
            <select className="bg-secondary/30 border-none text-xs rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="flex-1 border border-dashed border-border/50 rounded-xl flex items-center justify-center bg-secondary/10">
            <div className="text-center">
              <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground font-medium">Chart Visualization Area</p>
              <p className="text-xs text-muted-foreground/70">Requires Recharts or similar library</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-playfair font-bold text-lg">Recent Orders</h3>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-secondary/30 rounded-xl transition-colors">
                <div>
                  <p className="font-medium text-sm">{order.customer}</p>
                  <p className="text-xs text-muted-foreground">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{order.amount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'Completed' ? 'bg-green-500/10 text-green-600' :
                    order.status === 'Processing' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-amber-500/10 text-amber-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
            View All Orders
          </button>
        </div>

      </div>
    </div>
  );
}
