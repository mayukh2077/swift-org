import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CreateOrganization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [orgName, setOrgName] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate unique org ID
      const orgId = `org-${crypto.randomUUID()}`;

      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          org_id: orgId,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create user profile linked to organization
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          organization_id: orgData.id,
          email: user.email,
        });

      if (profileError) throw profileError;

      toast({
        title: "Organization Created!",
        description: `Successfully created ${orgName}`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Failed to create organization",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Organization</CardTitle>
          <CardDescription>
            Set up your organization to get started with StatusMan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                placeholder="Enter your organization name"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !orgName.trim()}>
              {isLoading ? 'Creating Organization...' : 'Create Organization'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrganization;