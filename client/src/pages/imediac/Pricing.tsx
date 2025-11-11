import { Layout } from "@/components/imediac/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, ArrowRight } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "£10",
      period: "/month",
      description: "Perfect for small businesses getting started online",
      popular: false,
      features: [
        "1-page professional website",
        "2 custom poster designs per month",
        "Basic technical support",
        "Mobile-responsive design",
        "Basic SEO setup",
        "Email support"
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "outline" as const
    },
    {
      name: "Standard",
      price: "£20",
      period: "/month",
      description: "Ideal for growing businesses with regular content needs",
      popular: true,
      features: [
        "3-page professional website",
        "4 custom poster designs per month",
        "Monthly website updates",
        "Advanced SEO optimization",
        "WhatsApp support",
        "Analytics dashboard",
        "Social media integration",
        "Contact form setup"
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "default" as const
    },
    {
      name: "Pro",
      price: "£30",
      period: "/month",
      description: "Complete solution for established businesses",
      popular: false,
      features: [
        "Full website with unlimited pages",
        "Unlimited poster designs",
        "Ongoing website edits",
        "Premium SEO & marketing",
        "Priority WhatsApp support",
        "Monthly performance reports",
        "E-commerce integration",
        "Custom domain & hosting",
        "Backup & security monitoring"
      ],
      buttonText: "Subscribe Now",
      buttonVariant: "outline" as const
    }
  ];

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees."
    },
    {
      question: "Are custom plans available?",
      answer: "Absolutely! We offer custom plans tailored to your specific needs. Contact us to discuss your requirements."
    },
    {
      question: "What's included in maintenance?",
      answer: "Maintenance includes regular updates, security monitoring, backups, content changes, and technical support."
    },
    {
      question: "Do you provide hosting?",
      answer: "Yes, hosting is included in all our plans. We use reliable, fast servers with 99.9% uptime guarantee."
    }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 to-white">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, <span className="text-blue-600">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your business. All plans include our commitment to quality, 
              timely delivery, and ongoing support.
            </p>
            <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold">
              ✨ Cancel anytime — Custom plans available
            </Badge>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card 
                  key={plan.name} 
                  className={`relative border-0 shadow-xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1 font-semibold">
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    <CardDescription className="text-gray-600">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full font-semibold py-3 ${
                        plan.buttonVariant === 'default' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                      }`}
                      variant={plan.buttonVariant}
                      size="lg"
                    >
                      {plan.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Got questions? We've got answers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
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
              Join hundreds of satisfied customers who trust us with their digital presence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4"
              >
                Start Your Project
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}