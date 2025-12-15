import { BrowserRouter as Router } from "react-router-dom";
import PeerExplorer from "./pages/PeerExplorer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <PeerExplorer />
      </Router>
    </QueryClientProvider>
  );
}
