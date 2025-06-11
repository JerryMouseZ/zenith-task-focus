
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react'; // User icon was not used
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/useIsMobile';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-green-100 text-green-700">
            {getInitials(user.email || 'U')}
          </AvatarFallback>
        </Avatar>
        {!isMobile && user.email && (
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Sign Out"
      >
        <LogOut className="h-4 w-4" />
        {!isMobile && (
          <span className="ml-2">Sign Out</span>
        )}
      </Button>
    </div>
  );
};
