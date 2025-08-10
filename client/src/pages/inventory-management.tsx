import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Plus, Search, Minus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertInventorySchema, type Inventory, type InsertInventory } from "@shared/schema";

export default function InventoryManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [quantityFilter, setQuantityFilter] = useState<string>("all");
  const { toast } = useToast();

  // Queries
  const { data: inventoryItems = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
    queryFn: () => fetch("/api/inventory").then(res => {
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json();
    }).then(data => Array.isArray(data) ? data : []),
  });

  // Form setup
  const form = useForm<InsertInventory>({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      model: "",
      product: "",
      condition: "new",
      quantity: 1,
    },
  });

  // Mutations
  const createInventoryMutation = useMutation({
    mutationFn: (data: InsertInventory) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      form.reset({
        model: "",
        product: "",
        condition: "new",
        quantity: 1,
      });
      toast({
        title: "Success",
        description: "Inventory item added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCountMutation = useMutation({
    mutationFn: ({ id, operation, amount }: { id: number; operation: "add" | "subtract"; amount: number }) =>
      apiRequest("PATCH", `/api/inventory/${id}/count`, { operation, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Inventory count updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inventory count. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInventory) => {
    createInventoryMutation.mutate(data);
  };

  const handleCountChange = (id: number, operation: "add" | "subtract", amount: number = 1) => {
    updateCountMutation.mutate({ id, operation, amount });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new": return "bg-green-100 text-green-700";
      case "used": return "bg-yellow-100 text-yellow-700";
      case "refurbished": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getQuantityColor = (quantity: number) => {
    if (quantity >= 10) return "bg-green-100 text-green-700";
    if (quantity >= 5) return "bg-yellow-100 text-yellow-700";
    if (quantity >= 1) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = 
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter;
    const matchesQuantity = quantityFilter === "all" || 
      (quantityFilter === "low" && item.quantity < 5) ||
      (quantityFilter === "medium" && item.quantity >= 5 && item.quantity < 10) ||
      (quantityFilter === "high" && item.quantity >= 10);

    return matchesSearch && matchesCondition && matchesQuantity;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Inventory Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="add-new" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="add-new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New
            </TabsTrigger>
            <TabsTrigger value="my-inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              My Inventory
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {inventoryItems.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Add New Tab */}
          <TabsContent value="add-new">
            <Card>
              <CardHeader>
                <CardTitle>Add New Inventory Item</CardTitle>
                <p className="text-sm text-gray-500">Add products to your inventory</p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., iPhone 14, Galaxy S23" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="product"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Screen, Battery, Case" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="used">Used</SelectItem>
                                <SelectItem value="refurbished">Refurbished</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                placeholder="1" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => form.reset({
                          model: "",
                          product: "",
                          condition: "new",
                          quantity: 1,
                        })}
                      >
                        Clear Form
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createInventoryMutation.isPending}
                        className="bg-primary hover:bg-blue-700"
                      >
                        {createInventoryMutation.isPending ? (
                          <>Adding...</>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Inventory Tab */}
          <TabsContent value="my-inventory">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Inventory</CardTitle>
                    <p className="text-sm text-gray-500">Manage your product inventory</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <Select value={conditionFilter} onValueChange={setConditionFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Conditions</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                          <SelectItem value="refurbished">Refurbished</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Quantities</SelectItem>
                          <SelectItem value="low">Low (&lt; 5)</SelectItem>
                          <SelectItem value="medium">Medium (5-9)</SelectItem>
                          <SelectItem value="high">High (10+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filteredInventory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No inventory items found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Model</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Condition</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Quantity</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Count</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredInventory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-900">{item.model}</td>
                            <td className="py-4 px-4 text-gray-900">{item.product}</td>
                            <td className="py-4 px-4">
                              <Badge className={getConditionColor(item.condition)}>
                                {item.condition}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={getQuantityColor(item.quantity)}>
                                {item.quantity}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-semibold text-lg">{item.count}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCountChange(item.id, "subtract")}
                                  disabled={updateCountMutation.isPending || item.count === 0}
                                  className="w-8 h-8 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleCountChange(item.id, "add")}
                                  disabled={updateCountMutation.isPending}
                                  className="w-8 h-8 p-0 bg-green-600 hover:bg-green-700"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}