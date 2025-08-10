import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wrench, Plus, Clock, History, Search, Check, User, Package, RotateCcw, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertServiceSchema, type Service, type InsertService } from "@shared/schema";
import InventoryManagement from "./inventory-management";

export default function ServiceManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  // Queries
  const { data: inProgressServices = [], isLoading: loadingInProgress } = useQuery<Service[]>({
    queryKey: ["/api/services", { status: "in_progress" }],
    queryFn: () => fetch("/api/services?status=in_progress").then(res => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }).then(data => Array.isArray(data) ? data : []),
  });

  const { data: completedServices = [], isLoading: loadingCompleted } = useQuery<Service[]>({
    queryKey: ["/api/services", { status: "completed" }],
    queryFn: () => fetch("/api/services?status=completed").then(res => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }).then(data => Array.isArray(data) ? data : []),
  });

  const { data: returnedServices = [], isLoading: loadingReturned } = useQuery<Service[]>({
    queryKey: ["/api/services", { status: "returned" }],
    queryFn: () => fetch("/api/services?status=returned").then(res => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }).then(data => Array.isArray(data) ? data : []),
  });

  const { data: dailySalesServices = [] } = useQuery<Service[]>({
    queryKey: ["/api/services", { date: selectedDate }],
    queryFn: () => fetch(`/api/services?date=${selectedDate}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }).then(data => Array.isArray(data) ? data : []),
  });

  // Calculate daily sales
  const dailySales = useMemo(() => {
    return dailySalesServices.reduce((total, service) => {
      return total + parseFloat(service.estimatedCost || "0");
    }, 0);
  }, [dailySalesServices]);

  // Form setup
  const form = useForm<InsertService>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      deviceModel: "",
      faultDescription: "",
      serviceDate: new Date().toISOString().split('T')[0],
      estimatedCost: "",
    },
  });

  // Mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: InsertService) => apiRequest("POST", "/api/services", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      form.reset({
        customerName: "",
        phoneNumber: "",
        deviceModel: "",
        faultDescription: "",
        serviceDate: new Date().toISOString().split('T')[0],
        estimatedCost: "",
      });
      toast({
        title: "Success",
        description: "Service entry created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create service entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "completed" | "returned" }) => 
      apiRequest("PATCH", `/api/services/${id}`, { status }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Success",
        description: status === "completed" ? "Service completed successfully!" : "Service returned successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertService) => {
    createServiceMutation.mutate(data);
  };

  const handleCompleteService = (id: number) => {
    updateServiceMutation.mutate({ id, status: "completed" });
  };

  const handleReturnService = (id: number) => {
    updateServiceMutation.mutate({ id, status: "returned" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600", 
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
      "bg-pink-100 text-pink-600",
      "bg-indigo-100 text-indigo-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const filteredInProgress = inProgressServices.filter(service =>
    service.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.phoneNumber.includes(searchQuery) ||
    service.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompleted = completedServices.filter(service =>
    service.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.phoneNumber.includes(searchQuery) ||
    service.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReturned = returnedServices.filter(service =>
    service.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.phoneNumber.includes(searchQuery) ||
    service.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wrench className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Service Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin User</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-white text-sm" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="new-entry" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="new-entry" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Entry
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              In Progress
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {inProgressServices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventory
            </TabsTrigger>
          </TabsList>

          {/* New Entry Tab */}
          <TabsContent value="new-entry">
            <Card>
              <CardHeader>
                <CardTitle>Create New Service Entry</CardTitle>
                <p className="text-sm text-gray-500">Fill in the customer and service details below</p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter customer full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deviceModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device Model *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., iPhone 14, Samsung Galaxy S23" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="serviceDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Date *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="estimatedCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Cost *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="faultDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fault Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the issue or fault in detail..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => form.reset({
                          customerName: "",
                          phoneNumber: "",
                          deviceModel: "",
                          faultDescription: "",
                          serviceDate: new Date().toISOString().split('T')[0],
                          estimatedCost: "",
                        })}
                      >
                        Clear Form
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createServiceMutation.isPending}
                        className="bg-primary hover:bg-blue-700"
                      >
                        {createServiceMutation.isPending ? (
                          <>Creating...</>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Entry
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* In Progress Tab */}
          <TabsContent value="in-progress">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>In Progress Services</CardTitle>
                    <p className="text-sm text-gray-500">Active service requests awaiting completion</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingInProgress ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filteredInProgress.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No in-progress services found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Serial#</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Customer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Contact</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Device</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Fault</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Cost</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredInProgress.map((service) => (
                          <tr key={service.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {service.serialNumber}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium ${getAvatarColor(service.customerName)}`}>
                                  {getInitials(service.customerName)}
                                </div>
                                <span className="font-medium text-gray-900">{service.customerName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-900">{service.phoneNumber}</td>
                            <td className="py-4 px-4 text-gray-900">{service.deviceModel}</td>
                            <td className="py-4 px-4 text-gray-900 max-w-xs truncate">{service.faultDescription}</td>
                            <td className="py-4 px-4 text-gray-900">
                              <span className="font-semibold">${service.estimatedCost}</span>
                            </td>
                            <td className="py-4 px-4 text-gray-900">{service.serviceDate}</td>
                            <td className="py-4 px-4">
                              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                <Clock className="w-3 h-3 mr-1" />
                                In Progress
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReturnService(service.id)}
                                  disabled={updateServiceMutation.isPending}
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                  {updateServiceMutation.isPending ? (
                                    "Returning..."
                                  ) : (
                                    <>
                                      <RotateCcw className="w-3 h-3 mr-1" />
                                      Return
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleCompleteService(service.id)}
                                  disabled={updateServiceMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  {updateServiceMutation.isPending ? (
                                    "Completing..."
                                  ) : (
                                    <>
                                      <Check className="w-3 h-3 mr-1" />
                                      Complete
                                    </>
                                  )}
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

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-6">
              {/* Daily Sales Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Daily Sales Report
                      </CardTitle>
                      <p className="text-sm text-gray-500">Track revenue from completed services</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-40"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Total Sales</p>
                          <p className="text-2xl font-bold text-green-700">${dailySales.toFixed(2)}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Services Completed</p>
                          <p className="text-2xl font-bold text-blue-700">{dailySalesServices.length}</p>
                        </div>
                        <Check className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Average Value</p>
                          <p className="text-2xl font-bold text-purple-700">
                            ${dailySalesServices.length > 0 ? (dailySales / dailySalesServices.length).toFixed(2) : '0.00'}
                          </p>
                        </div>
                        <History className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service History Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Service History</CardTitle>
                      <p className="text-sm text-gray-500">Complete record of all finished and returned services</p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {(loadingCompleted || loadingReturned) ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : [...filteredCompleted, ...filteredReturned].length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No completed or returned services found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Serial#</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Customer</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Contact</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Device</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Fault</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Cost</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Service Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Completed</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[...filteredCompleted, ...filteredReturned]
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                  {service.serialNumber}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-medium ${getAvatarColor(service.customerName)}`}>
                                    {getInitials(service.customerName)}
                                  </div>
                                  <span className="font-medium text-gray-900">{service.customerName}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-gray-900">{service.phoneNumber}</td>
                              <td className="py-4 px-4 text-gray-900">{service.deviceModel}</td>
                              <td className="py-4 px-4 text-gray-900 max-w-xs truncate">{service.faultDescription}</td>
                              <td className="py-4 px-4 text-gray-900">
                                <span className="font-semibold">${service.estimatedCost}</span>
                              </td>
                              <td className="py-4 px-4 text-gray-900">{service.serviceDate}</td>
                              <td className="py-4 px-4 text-gray-900">
                                {service.completedAt ? new Date(service.completedAt).toLocaleDateString() : 
                                 service.returnedAt ? new Date(service.returnedAt).toLocaleDateString() : "-"}
                              </td>
                              <td className="py-4 px-4">
                                {service.status === "completed" ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                    <Check className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    Returned
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
