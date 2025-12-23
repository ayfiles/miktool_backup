"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings2, Save } from "lucide-react";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    company_name: "",
    address_line1: "",
    address_line2: "",
    email: "",
    phone: "",
    website: "",
    footer_text: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getSettings();
      if (data) setFormData(data);
    } catch (e) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await updateSettings(formData);
      toast.success("Settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    }
  }

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
         <Settings2 className="h-8 w-8 text-primary" />
         <div>
           <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
           <p className="text-muted-foreground">Manage your company details for PDF generation.</p>
         </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>These details will appear on all generated PDF documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Company Name</Label>
            <Input 
              value={formData.company_name} 
              onChange={e => setFormData({...formData, company_name: e.target.value})} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone Number</Label>
              <Input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Address Line 1</Label>
            <Input 
              placeholder="Street, Number"
              value={formData.address_line1} 
              onChange={e => setFormData({...formData, address_line1: e.target.value})} 
            />
          </div>
          <div className="grid gap-2">
            <Label>Address Line 2</Label>
            <Input 
              placeholder="City, ZIP, Country"
              value={formData.address_line2} 
              onChange={e => setFormData({...formData, address_line2: e.target.value})} 
            />
          </div>

          <div className="grid gap-2">
            <Label>Website</Label>
            <Input 
              value={formData.website} 
              onChange={e => setFormData({...formData, website: e.target.value})} 
            />
          </div>

          <div className="grid gap-2 pt-4 border-t">
            <Label>PDF Footer Text</Label>
            <Input 
              value={formData.footer_text} 
              onChange={e => setFormData({...formData, footer_text: e.target.value})} 
              placeholder="e.g. Thank you for your business!"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}