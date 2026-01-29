import { useState, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Rocket, Mail, CheckCircle, Calendar, Globe, Home, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+234", country: "NG", flag: "🇳🇬" },
  { code: "+254", country: "KE", flag: "🇰🇪" },
  { code: "+60", country: "MY", flag: "🇲🇾" },
  { code: "+63", country: "PH", flag: "🇵🇭" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+974", country: "QA", flag: "🇶🇦" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
];

const services = [
  { id: "website", label: "Website" },
  { id: "seo", label: "SEO" },
  { id: "ads", label: "Meta / Google Ads" },
  { id: "social", label: "Social Media" },
  { id: "video", label: "Video" },
  { id: "notsure", label: "Not sure" },
];

const goals = [
  { id: "leads", label: "Get more leads" },
  { id: "sales", label: "Increase sales" },
  { id: "brand", label: "Build brand" },
  { id: "presence", label: "Grow online presence" },
];

const budgets = [
  { id: "under500", label: "Under ₹2,999" },
  { id: "500-1k", label: "₹2,999 – ₹5,000" },
  { id: "1k+", label: "₹5,000+" },
  { id: "notsure", label: "Not sure" },
];

const websiteGoals = [
  { id: "leads", label: "Leads" },
  { id: "sales", label: "Sales" },
  { id: "branding", label: "Branding" },
];

const serviceDetails: Record<string, { label: string; icon: string }> = {
  website: { label: "Website Development", icon: "🌐" },
  social: { label: "Social Media Management", icon: "📱" },
  video: { label: "Video Editing & Reels", icon: "🎬" },
  content: { label: "Content & Scripting", icon: "📝" },
  ads: { label: "Meta & Google Ads", icon: "🎯" },
  email: { label: "Email Marketing", icon: "📧" },
  whatsapp: { label: "WhatsApp Marketing", icon: "💬" },
  brand: { label: "Brand Identity", icon: "🎨" },
};

const timelines = [
  { id: "asap", label: "ASAP" },
  { id: "flexible", label: "Flexible" },
];

interface FormData {
  services: string[];
  goal: string;
  budget: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  business: string;
  timeline: string;
}

const StartProjectPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const serviceParam = searchParams.get("service");
  const isDirectService = serviceParam && serviceDetails[serviceParam];
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    services: [],
    goal: "",
    budget: "",
    name: "",
    email: "",
    countryCode: "+1",
    phone: "",
    business: "",
    timeline: "",
  });

  useEffect(() => {
    if (serviceParam && serviceDetails[serviceParam]) {
      setFormData((prev) => ({ ...prev, services: [serviceParam] }));
    }
  }, [serviceParam]);

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleNext = () => {
    if (step === 1 && formData.services.length === 0) {
      toast({
        title: "Please select at least one service",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || formData.name.length < 2) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({ title: "Please enter a valid email or phone", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      let message: string;
      const currentService = serviceParam ? serviceDetails[serviceParam] : null;
      
      if (isDirectService && currentService) {
        message = `
Service: ${currentService.label}
Goal: ${websiteGoals.find(g => g.id === formData.goal)?.label || "Not specified"}
Timeline: ${timelines.find(t => t.id === formData.timeline)?.label || "Not specified"}
        `.trim();
      } else {
        const fullPhone = formData.phone ? `${formData.countryCode} ${formData.phone}` : "Not specified";
        message = `
Services: ${formData.services.map(s => services.find(svc => svc.id === s)?.label).join(", ")}
Goal: ${goals.find(g => g.id === formData.goal)?.label || "Not specified"}
Budget: ${budgets.find(b => b.id === formData.budget)?.label || "Not specified"}
Phone: ${fullPhone}
Business: ${formData.business || "Not specified"}
        `.trim();
      }

      const { error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.name,
          email: formData.email,
          message,
        }
      });

      if (error) throw error;

      if (isDirectService) {
        setSubmitted(true);
      } else {
        setStep(3);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const currentServiceInfo = serviceParam ? serviceDetails[serviceParam] : null;

  // Simplified single-page form for direct service links
  if (isDirectService && currentServiceInfo) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        {/* Simple Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container max-w-2xl mx-auto px-6 py-4">
            <button 
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to home
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pt-20 pb-12">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-4">{currentServiceInfo.icon}</div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                      Start {currentServiceInfo.label} Project
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Tell us what you need. We'll contact you shortly.
                    </p>
                  </div>

                  {/* Hidden service field */}
                  <input type="hidden" name="service" value={serviceParam} />

                  {/* Goal */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Your goal</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {websiteGoals.map((goal) => (
                        <label
                          key={goal.id}
                          className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center ${
                            formData.goal === goal.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="goal"
                            value={goal.id}
                            checked={formData.goal === goal.id}
                            onChange={() => setFormData((prev) => ({ ...prev, goal: goal.id }))}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{goal.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Timeline</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {timelines.map((timeline) => (
                        <label
                          key={timeline.id}
                          className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center ${
                            formData.timeline === timeline.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="timeline"
                            value={timeline.id}
                            checked={formData.timeline === timeline.id}
                            onChange={() => setFormData((prev) => ({ ...prev, timeline: timeline.id }))}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{timeline.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold mb-2 block">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="h-11"
                    />
                  </div>

                  {/* Email / Phone */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
                      Email / Phone
                    </Label>
                    <Input
                      id="email"
                      placeholder="your@email.com or phone number"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="h-11"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    variant="hero"
                    size="lg"
                    className="w-full group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "🚀 Submit"}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="thanks"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold mb-3">
                      Thanks! Your request has been sent.
                    </h1>
                    <p className="text-muted-foreground">
                      We'll contact you within 24 hours.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/")}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => navigate("/#services")}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      View Our Work
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    );
  }

  // Original 3-step wizard for general flow
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to home
            </button>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 flex items-center justify-center px-6 pt-28 pb-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Project Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                    <Rocket className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                    Start Your Project
                  </h1>
                  <p className="text-muted-foreground">
                    Tell us what you need. We'll handle the rest.
                  </p>
                </div>

                {/* Services */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">What service do you need?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          formData.services.includes(service.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Checkbox
                          checked={formData.services.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <span className="text-sm font-medium">{service.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Your main goal</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {goals.map((goal) => (
                      <label
                        key={goal.id}
                        className={`flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all text-center ${
                          formData.goal === goal.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="goal"
                          value={goal.id}
                          checked={formData.goal === goal.id}
                          onChange={() => setFormData((prev) => ({ ...prev, goal: goal.id }))}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{goal.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Budget range (optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {budgets.map((budget) => (
                      <label
                        key={budget.id}
                        className={`flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all text-center ${
                          formData.budget === budget.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="budget"
                          value={budget.id}
                          checked={formData.budget === budget.id}
                          onChange={() => setFormData((prev) => ({ ...prev, budget: budget.id }))}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{budget.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button onClick={handleNext} variant="hero" size="xl" className="w-full group">
                  Next
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                    Your contact details
                  </h1>
                  <p className="text-muted-foreground">
                    So we can reach you about your project.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                      Phone / WhatsApp (optional)
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.countryCode}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, countryCode: value }))}
                      >
                        <SelectTrigger className="w-[120px] h-12">
                          <SelectValue>
                            {countryCodes.find(c => c.code === formData.countryCode)?.flag} {formData.countryCode}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {countryCodes.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.code}</span>
                                <span className="text-muted-foreground text-xs">({country.country})</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        className="h-12 flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="business" className="text-sm font-medium mb-2 block">
                      Business name (optional)
                    </Label>
                    <Input
                      id="business"
                      placeholder="Your company name"
                      value={formData.business}
                      onChange={(e) => setFormData((prev) => ({ ...prev, business: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleBack} variant="outline" size="lg" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="hero"
                    size="lg"
                    className="flex-1 group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Project"}
                    <Rocket className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center space-y-8"
              >
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-primary" />
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                    Project submitted!
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Thanks for reaching out. Our team will review your project and contact you within 24 hours.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/#services")}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    View our work
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => navigate("/")}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to home
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default memo(StartProjectPage);
