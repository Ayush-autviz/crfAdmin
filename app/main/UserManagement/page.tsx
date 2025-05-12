"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, updateUserAdminStatus } from "@/lib/ApiService";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, Shield, ShieldOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// User interface
interface User {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
}

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState<boolean>(false);
  const [isDemoteDialogOpen, setIsDemoteDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Mutation to update user admin status
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) =>
      updateUserAdminStatus(userId, isAdmin),
    onSuccess: () => {
      toast.success("User Updated", {
        description: `User admin status has been updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsPromoteDialogOpen(false);
      setIsDemoteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      console.error("Update user status failed:", error);
      
      // Default error message
      let errorMessage = "Failed to update user status. Please try again.";
      
      // Use error.response.data.error for the toast description if available
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error("Error", {
        description: errorMessage,
      });
    },
  });

  // Handle promoting user to admin
  const handlePromoteUser = (user: User) => {
    setSelectedUser(user);
    setIsPromoteDialogOpen(true);
  };

  // Handle demoting admin to regular user
  const handleDemoteUser = (user: User) => {
    setSelectedUser(user);
    setIsDemoteDialogOpen(true);
  };

  // Confirm promotion
  const confirmPromote = () => {
    if (selectedUser) {
      updateUserStatusMutation.mutate({ userId: selectedUser.id, isAdmin: true });
    }
  };

  // Confirm demotion
  const confirmDemote = () => {
    if (selectedUser) {
      updateUserStatusMutation.mutate({ userId: selectedUser.id, isAdmin: false });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white font-bold mb-2">User Management</h1>
          <p className="text-sm text-[#A4A4A4]">Manage user accounts and admin privileges</p>
        </div>
      </div>

      <Card className="bg-[#162033] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-white font-bold">User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-1/4 bg-[#334155]" />
                <Skeleton className="h-6 w-1/4 bg-[#334155]" />
                <Skeleton className="h-6 w-1/4 bg-[#334155]" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 py-4 border-b border-[#323D50]">
                  <Skeleton className="h-5 w-1/3 bg-[#334155]" />
                  <Skeleton className="h-5 w-16 bg-[#334155]" />
                  <div className="flex-1 flex justify-end space-x-2">
                    <Skeleton className="h-8 w-8 rounded-md bg-[#334155]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Failed to load users</h3>
              <p className="text-[#A4A4A4] mb-4">There was a problem loading the user accounts.</p>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#A4A4A4] mb-4">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-[#334155]">
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Role</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-[#334155]">
                    <TableCell className="font-medium text-white">{user.name}</TableCell>
                    <TableCell className="text-white">{user.email}</TableCell>
                    <TableCell className="text-white">
                      {user.is_admin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                          User
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.is_admin ? (
                        <Button
                          variant="ghost"
                          onClick={() => handleDemoteUser(user)}
                          className="text-yellow-500 hover:text-yellow-600"
                          disabled={updateUserStatusMutation.isPending}
                        >
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Remove Admin
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => handlePromoteUser(user)}
                          className="text-blue-500 hover:text-blue-600"
                          disabled={updateUserStatusMutation.isPending}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Promote to Admin Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white font-bold">Promote to Admin</DialogTitle>
            <DialogDescription className="text-[#A4A4A4] text-sm">
              Are you sure you want to promote {selectedUser?.name} to admin? Admins have full access to manage the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-black "
              onClick={() => {
                setIsPromoteDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={confirmPromote}
              disabled={updateUserStatusMutation.isPending}
            >
              {updateUserStatusMutation.isPending ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Promoting...
                </span>
              ) : (
                'Promote to Admin'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demote from Admin Dialog */}
      <Dialog open={isDemoteDialogOpen} onOpenChange={setIsDemoteDialogOpen}>
        <DialogContent className="bg-[#1A1F2C] text-white border-[#323D50]">
          <DialogHeader>
            <DialogTitle className="text-xl text-white font-bold">Remove Admin Privileges</DialogTitle>
            <DialogDescription className="text-[#A4A4A4] text-sm">
              Are you sure you want to remove admin privileges from {selectedUser?.name}? They will no longer have access to admin features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-black "
              onClick={() => {
                setIsDemoteDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-yellow-600 text-white hover:bg-yellow-700"
              onClick={confirmDemote}
              disabled={updateUserStatusMutation.isPending}
            >
              {updateUserStatusMutation.isPending ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Removing...
                </span>
              ) : (
                'Remove Admin'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
