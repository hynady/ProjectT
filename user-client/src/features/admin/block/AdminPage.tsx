// src/features/admin/blocks/AdminPage.tsx
import { useAuth } from '@/features/auth/contexts';
import { toast } from '@/commons/hooks/use-toast';
import { Button } from '@/commons/components/button';
import { useState } from 'react';
import { adminService } from '../services/admin.service';

const AdminPage = () => {
  const { token } = useAuth();
  const [pingResult, setPingResult] = useState<string>('');

  const pingServer = async () => {
    try {
      const response = await adminService.pingServer();
      setPingResult(response);
      toast({
        title: "Ping successful!",
        variant: "success",
      });
    } catch (error) {
      console.error('Ping error:', error);
      toast({
        title: "Ping failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="space-y-2">
        <Button onClick={pingServer}>Ping Server</Button>
        {pingResult && (
          <div className="p-2 bg-gray-100 rounded">
            Response: {pingResult}
            Token: {token}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;