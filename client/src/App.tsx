import { Router as WouterRouter, Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Book, Mic } from "lucide-react";
import QuranReader from "@/pages/QuranReader";
import QuranFollow from "@/pages/QuranFollow";
import HadithBrowser from "@/pages/HadithBrowser";
import KidsLearning from "@/pages/KidsLearning";
import Transcribe from "@/pages/Transcribe";
import TajweedGuide from "@/pages/TajweedGuide";
import NotFound from "@/pages/not-found";
import IMediaCHome from "./pages/imediac/Home";
import { Services } from "./pages/imediac/Services";
import { Portfolio } from "./pages/imediac/Portfolio";
import { Pricing } from "./pages/imediac/Pricing";
import { About } from "./pages/imediac/About";
import { Contact } from "./pages/imediac/Contact";

function AppRoutes() {
  return (
      <Switch>
      <Route path="/" component={QuranReader} />
      <Route path="/hadith" component={HadithBrowser} />
      <Route path="/kids" component={KidsLearning} />
      <Route path="/transcribe" component={Transcribe} />
      <Route path="/tajweed-guide" component={TajweedGuide} />
      <Route path="/follow" component={QuranFollow} />
        <Route path="/imediac" component={IMediaCHome} />
      <Route path="/imediac/services" component={Services} />
      <Route path="/imediac/portfolio" component={Portfolio} />
      <Route path="/imediac/pricing" component={Pricing} />
      <Route path="/imediac/about" component={About} />
      <Route path="/imediac/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL}>
          <AppRoutes />
          
          <Link href="/transcribe">
            <Button
              size="icon"
              variant="default"
              className="fixed bottom-36 left-6 h-14 w-14 rounded-full shadow-lg z-30"
              data-testid="button-navigate-transcribe"
              aria-label="Transcribe Recitation"
            >
              <Mic className="w-6 h-6" />
            </Button>
          </Link>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
