import SupabaseStatus from '@/components/SupabaseStatus';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupabaseTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-full h-10 w-10 p-0">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold">Supabase Verification</h1>
        </div>
      </div>

      <div className="p-4">
        <SupabaseStatus />
      </div>

      <Navigation />
    </div>
  );
};

export default SupabaseTest;