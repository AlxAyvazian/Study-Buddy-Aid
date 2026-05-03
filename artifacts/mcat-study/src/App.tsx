import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

import Dashboard from "@/pages/dashboard";
import StudyMode from "@/pages/study";
import CardsBrowser from "@/pages/cards";
import NewCard from "@/pages/new-card";
import ProgressPage from "@/pages/progress";
import HelpPage from "@/pages/help";
import MediaGeneratorPage from "@/pages/media-generator";
import AnalyzerPage from "@/pages/analyzer";
import PreMedPage from "@/pages/premed";
import DisabilityPage from "@/pages/disability";
import CareerPage from "@/pages/career";
import LettersPage from "@/pages/letters";
import ResearchPage from "@/pages/research";
import CalculatorGuidePage from "@/pages/calculator-guide";
import MemorizationGuidePage from "@/pages/memorization-guide";
import PomodoroPage from "@/pages/pomodoro";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/study" component={StudyMode} />
      <Route path="/cards" component={CardsBrowser} />
      <Route path="/cards/new" component={NewCard} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/media" component={MediaGeneratorPage} />
      <Route path="/analyze" component={AnalyzerPage} />
      <Route path="/premed" component={PreMedPage} />
      <Route path="/disability" component={DisabilityPage} />
      <Route path="/career" component={CareerPage} />
      <Route path="/letters" component={LettersPage} />
      <Route path="/research" component={ResearchPage} />
      <Route path="/calculator-guide" component={CalculatorGuidePage} />
      <Route path="/memorization" component={MemorizationGuidePage} />
      <Route path="/pomodoro" component={PomodoroPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
