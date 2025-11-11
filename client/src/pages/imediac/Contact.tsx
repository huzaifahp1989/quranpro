import { useState } from "react";
import { Layout } from "@/components/imediac/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Mail, 
  Clock, 
  MapPin, 
  Phone, 
  Send,
  CheckCircle
} from "lucide-react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-blue-600" />,
      title: "Email Us",
      description: "Get in touch via email",
      contact: "imediac786@gmail.com",
      action: "mailto:imediac786@gmail.com"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-green-600" />,
      title: "WhatsApp",
      description: "Quick chat on WhatsApp",
      contact: "+44 7000 000 000",
      action: "https://wa.me/447000000000"
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      title: "Response Time",
      description: "We typically respond within",
      contact: "2-4 hours",
      action: null
    },
    {
      icon: <MapPin className="w-6 h-6 text-red-600" />,
      title: "Service Area",
      description: "We serve clients",
      contact: "Worldwide",
      action: null
    }
  ];

  const services = [
    "Poster Design",
    "Website Development",
    "Logo Design",
    "Maintenance & Support",
    "SEO Services",
    "E-commerce Solutions"
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <Badge className="bg-blue-100 text-blue-600 mb-6">Get In Touch</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Let's Start Your <span className="text-blue-600">Project</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Ready to transform your digital presence? We're here to help you every step of the way. 
              Get in touch and let's discuss your project requirements.
            </p>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      {info.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {info.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {info.description}
                    </p>
                    {info.action ? (
                      <a 
                        href={info.action}
                        target={info.action.startsWith('http') ? '_blank' : undefined}
                        rel={info.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                      >
                        {info.contact}
                      </a>
                    ) : (
                      <span className="text-blue-600 font-semibold">
                        {info.contact}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Send Us a Message
                  </CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600">
                        Thank you for contacting us. We'll get back to you soon.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="mt-1"
                          placeholder="What's this about?"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleChange}
                          className="mt-1 min-h-[120px]"
                          placeholder="Tell us about your project requirements..."
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                        size="lg"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="space-y-8">
                {/* Services List */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      Our Services
                    </CardTitle>
                    <p className="text-gray-600">
                      We specialize in these areas to help your business grow.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {services.map((service, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{service}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Contact */}
                <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-blue-100" />
                    <h3 className="text-xl font-bold mb-3">
                      Need Immediate Help?
                    </h3>
                    <p className="text-blue-100 mb-6">
                      Chat with us directly on WhatsApp for quick responses and instant support.
                    </p>
                    <Button 
                      asChild
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                    >
                      <a 
                        href="https://wa.me/447000000000" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat on WhatsApp
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Location/Map Placeholder */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-blue-600 font-semibold">Serving Clients Worldwide</p>
                        <p className="text-sm text-gray-600">Remote-first digital studio</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* WhatsApp Floating Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            asChild
            size="lg"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl animate-pulse"
          >
            <a 
              href="https://wa.me/447000000000" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
          </Button>
        </div>
      </div>
    </Layout>
  );
}