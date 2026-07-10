export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      
      <div>
        <h1 className="text-3xl font-playfair font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your store preferences and configurations.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm">
        
        <div className="space-y-8">
          
          {/* General Settings */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b border-border/50 pb-2">General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Store Name</label>
                <input type="text" defaultValue="Radhika Jewellers" className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Support Email</label>
                <input type="email" defaultValue="support@radhikajewellers.com" className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Store Description</label>
                <textarea rows={3} defaultValue="Premium artificial jewellery for every occasion." className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
          </div>

          {/* Payment & Currency */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b border-border/50 pb-2">Payment & Currency</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Default Currency</label>
                <select className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary">
                  <option>USD ($)</option>
                  <option>INR (₹)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tax Rate (%)</label>
                <input type="number" defaultValue="8.5" className="w-full bg-background border border-border/50 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-bold mb-4 border-b border-border/50 pb-2">Notifications</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" />
                <div>
                  <span className="text-sm font-medium block">Order Confirmations</span>
                  <span className="text-xs text-muted-foreground">Email customers when an order is placed.</span>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" />
                <div>
                  <span className="text-sm font-medium block">Low Stock Alerts</span>
                  <span className="text-xs text-muted-foreground">Receive an email when product stock falls below 5.</span>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" />
                <div>
                  <span className="text-sm font-medium block">Marketing Emails</span>
                  <span className="text-xs text-muted-foreground">Send promotional emails to subscribed customers.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg">
              Save Settings
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
