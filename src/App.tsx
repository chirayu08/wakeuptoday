import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import Index from "./pages/Index";
import SetAlarm from "./pages/SetAlarm";
import AlarmScreen from "./pages/AlarmScreen";
import History from "./pages/History";
import SupabaseTest from "./pages/SupabaseTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <ThemeToggle />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/set-alarm" element={<SetAlarm />} />
            <Route path="/alarm-active" element={<AlarmScreen />} />
            <Route path="/history" element={<History />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
