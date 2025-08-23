import { Toaster } from "@/components/ui/toaster";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn } from "@clerk/clerk-react";
import { Navbar } from "./components/navbar";
import { Compiler } from "./pages/Compiler";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { CompilerProvider } from "./context/CompilerContext"; 


// const queryClient = new QueryClient();

const App = () => (
    <>
      <Toaster />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <CompilerProvider>
          <Routes>
            <Route path="/" element={<Compiler />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <SignedIn>
                <Dashboard />
              </SignedIn>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </CompilerProvider>
        </div>
      </BrowserRouter>
      </>
);

export default App;