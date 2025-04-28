
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface DiagnosticResultProps {
  diagnosticResult: {
    success: boolean;
    message: string;
    results?: {
      rpc?: {
        success: boolean;
        error: string | null;
      };
      table?: {
        success: boolean;
        error: string | null;
      };
    };
  } | null;
}

const DiagnosticResult: React.FC<DiagnosticResultProps> = ({ diagnosticResult }) => {
  if (!diagnosticResult) return null;

  return (
    <Alert className="mb-4 bg-slate-50">
      <AlertTitle>Diagnostic Results</AlertTitle>
      <AlertDescription>
        <div className="text-sm mt-2 space-y-1">
          <div>
            <strong>Success:</strong> {diagnosticResult.success ? 'Yes' : 'No'}
          </div>
          {diagnosticResult.results && (
            <>
              <div>
                <strong>RPC Function:</strong> {diagnosticResult.results.rpc?.success ? 'Working' : 'Failed'}
                {diagnosticResult.results.rpc?.error && (
                  <div className="text-xs text-red-500">{diagnosticResult.results.rpc.error}</div>
                )}
              </div>
              <div>
                <strong>Direct Table Access:</strong> {diagnosticResult.results.table?.success ? 'Working' : 'Failed'}
                {diagnosticResult.results.table?.error && (
                  <div className="text-xs text-red-500">{diagnosticResult.results.table.error}</div>
                )}
              </div>
            </>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DiagnosticResult;
