import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, Database, Shield } from 'lucide-react';
import { testSupabaseConnection, testSupabaseAuth } from '@/lib/supabase-test';

interface TestResult {
  success: boolean;
  error?: string;
  message?: string;
  details?: string;
  hasSession?: boolean;
  user?: any;
  data?: any;
}

const SupabaseStatus = () => {
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null);
  const [authResult, setAuthResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setConnectionResult(null);
    setAuthResult(null);

    try {
      // Test connection
      const connResult = await testSupabaseConnection();
      setConnectionResult(connResult);

      // Test auth
      const authRes = await testSupabaseAuth();
      setAuthResult(authRes);
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const StatusIcon = ({ success }: { success: boolean }) => (
    success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  );

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Supabase Status
          </h2>
          <Button 
            onClick={runTests} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Test Connection
          </Button>
        </div>

        {/* Connection Test */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-medium">Database Connection</h3>
                <p className="text-sm text-muted-foreground">
                  Testing connection to Supabase database
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectionResult && <StatusIcon success={connectionResult.success} />}
              <Badge variant={connectionResult?.success ? "default" : "destructive"}>
                {isLoading ? "Testing..." : connectionResult?.success ? "Connected" : "Failed"}
              </Badge>
            </div>
          </div>

          {connectionResult && !connectionResult.success && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                Error: {connectionResult.error}
              </p>
              {connectionResult.details && (
                <p className="text-xs text-destructive/80 mt-1">
                  {connectionResult.details}
                </p>
              )}
            </div>
          )}

          {connectionResult?.success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                ✅ {connectionResult.message}
              </p>
            </div>
          )}
        </div>

        {/* Auth Test */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-medium">Authentication System</h3>
                <p className="text-sm text-muted-foreground">
                  Testing Supabase auth functionality
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {authResult && <StatusIcon success={authResult.success} />}
              <Badge variant={authResult?.success ? "default" : "destructive"}>
                {isLoading ? "Testing..." : authResult?.success ? "Working" : "Failed"}
              </Badge>
            </div>
          </div>

          {authResult && !authResult.success && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                Error: {authResult.error}
              </p>
              {authResult.details && (
                <p className="text-xs text-destructive/80 mt-1">
                  {authResult.details}
                </p>
              )}
            </div>
          )}

          {authResult?.success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                ✅ {authResult.message}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Session: {authResult.hasSession ? "Active user session found" : "No active session (normal for new users)"}
              </p>
            </div>
          )}
        </div>

        {/* Configuration Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Configuration Details</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Project URL:</strong> https://cobnwjumxytlnppncynf.supabase.co</p>
            <p><strong>Project ID:</strong> cobnwjumxytlnppncynf</p>
            <p><strong>Client:</strong> Configured with localStorage persistence</p>
            <p><strong>Auth:</strong> Auto-refresh enabled</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SupabaseStatus;