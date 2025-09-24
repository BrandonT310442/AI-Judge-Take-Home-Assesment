import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Judges } from '@/pages/Judges';
import { Queues } from '@/pages/Queues';
import { QueueDetail } from '@/pages/QueueDetail';
import { Results } from '@/pages/Results';
import { Submissions } from '@/pages/Submissions';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="judges" element={<Judges />} />
            <Route path="queues" element={<Queues />} />
            <Route path="queue/:queueId" element={<QueueDetail />} />
            <Route path="results" element={<Results />} />
            <Route path="submissions" element={<Submissions />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;