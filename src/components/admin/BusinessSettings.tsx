import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building, Phone, Mail, Globe, CreditCard,
    Percent, IndianRupee, Save, Upload, Landmark,
    FileText, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BusinessSettings as IBusinessSettings } from '@/types/billing';

// Default settings
const DEFAULT_SETTINGS: IBusinessSettings = {
    id: '1',
    company_name: 'URDIGIX',
    company_address: 'India',
    company_phone: '+91 78930 40375',
    company_email: 'hello@urdigix.com',
    company_website: 'www.urdigix.com',
    logo_url: null,
    currency: '₹',
    currency_code: 'INR',
    gst_number: '',
    gst_percentage: 18,
    enable_gst: true,
    enable_discount: true,
    default_payment_terms: '50% advance, balance on delivery',
    default_validity_days: 15,
    bank_name: '',
    bank_account_number: '',
    bank_ifsc: '',
    upi_id: '',
    updated_at: new Date().toISOString(),
};

export const BusinessSettings = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState<IBusinessSettings>(DEFAULT_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field: keyof IBusinessSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: 'Settings saved!',
            description: 'Your business settings have been updated.',
        });

        setIsSaving(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Business Settings</h2>
                <p className="text-gray-500">Configure your company details and billing preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-orange-500" />
                            Company Information
                        </CardTitle>
                        <CardDescription>
                            Your company details that appear on quotations and invoices
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Company Name</Label>
                            <Input
                                value={settings.company_name}
                                onChange={(e) => handleChange('company_name', e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Company Address</Label>
                            <Textarea
                                value={settings.company_address}
                                onChange={(e) => handleChange('company_address', e.target.value)}
                                className="mt-1"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Phone</Label>
                                <div className="relative mt-1">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        value={settings.company_phone}
                                        onChange={(e) => handleChange('company_phone', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Email</Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        value={settings.company_email}
                                        onChange={(e) => handleChange('company_email', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Website</Label>
                            <div className="relative mt-1">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={settings.company_website}
                                    onChange={(e) => handleChange('company_website', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Company Logo</Label>
                            <div className="mt-1 flex items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                    U
                                </div>
                                <Button variant="outline" size="sm">
                                    <Upload className="w-4 h-4 mr-2" /> Upload Logo
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tax & Currency */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Percent className="w-5 h-5 text-orange-500" />
                            Tax & Currency Settings
                        </CardTitle>
                        <CardDescription>
                            Configure your tax rates and currency preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Currency</Label>
                                <Select
                                    value={settings.currency_code}
                                    onValueChange={(v) => {
                                        handleChange('currency_code', v);
                                        handleChange('currency', v === 'INR' ? '₹' : '$');
                                    }}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                                        <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>GST Number</Label>
                                <Input
                                    value={settings.gst_number || ''}
                                    onChange={(e) => handleChange('gst_number', e.target.value)}
                                    placeholder="e.g., 29ABCDE1234F1ZH"
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Enable GST on Invoices</p>
                                <p className="text-sm text-gray-500">Automatically add GST to quotations and invoices</p>
                            </div>
                            <Switch
                                checked={settings.enable_gst}
                                onCheckedChange={(v) => handleChange('enable_gst', v)}
                            />
                        </div>

                        {settings.enable_gst && (
                            <div>
                                <Label>Default GST Percentage</Label>
                                <Select
                                    value={String(settings.gst_percentage)}
                                    onValueChange={(v) => handleChange('gst_percentage', parseFloat(v))}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5%</SelectItem>
                                        <SelectItem value="12">12%</SelectItem>
                                        <SelectItem value="18">18%</SelectItem>
                                        <SelectItem value="28">28%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium">Enable Discounts</p>
                                <p className="text-sm text-gray-500">Allow adding discounts to quotations and invoices</p>
                            </div>
                            <Switch
                                checked={settings.enable_discount}
                                onCheckedChange={(v) => handleChange('enable_discount', v)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-orange-500" />
                            Payment Settings
                        </CardTitle>
                        <CardDescription>
                            Bank account and payment terms configuration
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Default Payment Terms</Label>
                            <Textarea
                                value={settings.default_payment_terms}
                                onChange={(e) => handleChange('default_payment_terms', e.target.value)}
                                placeholder="e.g., 50% advance, balance on delivery"
                                className="mt-1"
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label>Default Quotation Validity (Days)</Label>
                            <Select
                                value={String(settings.default_validity_days)}
                                onValueChange={(v) => handleChange('default_validity_days', parseInt(v))}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 days</SelectItem>
                                    <SelectItem value="15">15 days</SelectItem>
                                    <SelectItem value="30">30 days</SelectItem>
                                    <SelectItem value="45">45 days</SelectItem>
                                    <SelectItem value="60">60 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <h4 className="font-medium flex items-center gap-2">
                                <Landmark className="w-4 h-4" /> Bank Account Details
                            </h4>

                            <div>
                                <Label>Bank Name</Label>
                                <Input
                                    value={settings.bank_name || ''}
                                    onChange={(e) => handleChange('bank_name', e.target.value)}
                                    placeholder="e.g., State Bank of India"
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Account Number</Label>
                                    <Input
                                        value={settings.bank_account_number || ''}
                                        onChange={(e) => handleChange('bank_account_number', e.target.value)}
                                        placeholder="Account number"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>IFSC Code</Label>
                                    <Input
                                        value={settings.bank_ifsc || ''}
                                        onChange={(e) => handleChange('bank_ifsc', e.target.value)}
                                        placeholder="e.g., SBIN0001234"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>UPI ID</Label>
                                <Input
                                    value={settings.upi_id || ''}
                                    onChange={(e) => handleChange('upi_id', e.target.value)}
                                    placeholder="e.g., urdigix@upi"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Invoice/Quotation Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-500" />
                            Document Settings
                        </CardTitle>
                        <CardDescription>
                            Customize your quotation and invoice documents
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <h4 className="font-medium text-orange-800 mb-2">Document Preview</h4>
                            <p className="text-sm text-orange-700">
                                Your documents will be branded with the URDIGIX identity, including your logo,
                                company colors (orange/amber), and professional typography.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm">Include bank details on invoice</span>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm">Include UPI QR code</span>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm">Auto-send email on status change</span>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm">Send payment reminders</span>
                                <Switch />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8"
                >
                    {isSaving ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span> Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" /> Save Settings
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
};
