import { Layout } from "@/components/imediac/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Globe, Settings, CheckCircle, ArrowRight } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: <Palette className="w-12 h-12 text-blue-600" />,
      title: "Poster Design",
      description: "Creative posters for events, businesses, and Islamic organisations.",
      features: [
        "Event announcements and flyers",
        "Business promotional materials",
        "Islamic educational posters",
        "Social media graphics",
        "Print-ready high-resolution files",
        "Multiple format delivery (PDF, PNG, JPG)"
      ],
      image: "🎨"
    },
    {
      icon: <Globe className="w-12 h-12 text-blue-600" />,
      title: "Website Design",
      description: "Fast, mobile-friendly, and modern websites for any purpose.",
      features: [
        "Responsive mobile-first design",
        "Fast loading and SEO optimized",
        "Custom domain and hosting setup",
        "Content management system",
        "E-commerce integration available",
        "Professional email setup"
      ],
      image: "🌐"
    },
    {
      icon: <Settings className="w-12 h-12 text-blue-600" />,
      title: "Maintenance & Support",
      description: "Ongoing updates, hosting, and content support.",
      features: [
        "Regular security updates",
        "Content updates and changes",
        "Performance monitoring",
        "Backup and recovery",
        "Technical support via WhatsApp",
        "Monthly performance reports"
      ],
      image: "🛠️"
    }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Our <span className="text-blue-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We offer comprehensive digital solutions to help your business grow online. 
              From creative design to technical maintenance, we've got you covered.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="space-y-20">
              {services.map((service, index) => (
                <div key={service.title} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
                  {/* Content */}
                  <div className="flex-1">
                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-6">
                        <div className="flex items-center gap-4 mb-4">
                          {service.icon}
                          <div>
                            <CardTitle className="text-2xl text-gray-900">{service.title}</CardTitle>
                            <CardDescription className="text-lg text-gray-600 mt-2">
                              {service.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3">
                          Learn More
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Image Placeholder */}
                  <div className="flex-1 max-w-md">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center shadow-2xl">
                      <span className="text-8xl">{service.image}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Choose the perfect plan for your needs and let us help you build your online presence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Book Your Plan
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}