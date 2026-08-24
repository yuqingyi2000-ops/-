"use client";

import { useAuth } from "../../../lib/auth-context";
import {
  Alert,
  AlertDescription,
  AlertDialog,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  Input,
  Textarea,
  Toast,
} from "@khamudom/lumen-ui-react";
import styles from "./profile.module.css";
import { Calendar, Camera, Clock, Mail, PencilIcon, Shield, Trash2, User } from "lucide-react";
import { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isUpdateEmailOpen, setIsUpdateEmailOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal-specific error states
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    bio: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });

  const showSuccessMessage = (text: string) => {
    setSuccessMessage(text);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const clearModalErrors = () => {
    setProfileError(null);
    setPasswordError(null);
    setEmailError(null);
    setDeleteError(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProfileError(null);
    
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.fullName,
          bio: profileForm.bio
        }
      });

      if (error) throw error;
      
      showSuccessMessage('Profile updated successfully!');
      setIsUpdateProfileOpen(false);
      setProfileForm({ fullName: '', bio: '' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;
      
      showSuccessMessage('Password changed successfully!');
      setIsChangePasswordOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailForm.newEmail
      });

      if (error) throw error;
      
      showSuccessMessage('Email update initiated. Please check your new email for confirmation.');
      setIsUpdateEmailOpen(false);
      setEmailForm({ newEmail: '', password: '' });
    } catch (error) {
      console.error('Error updating email:', error);
      setEmailError('Failed to update email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setDeleteError(null);
    
    try {
      // Delete user account
      // const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      // if (error) {
      //   // If admin delete fails, try to delete user data and sign out
      //   await signOut();
      //   showSuccessMessage('Account deletion initiated. Please contact support if you need to recover your data.');
      // } else {
      //   showSuccessMessage('Account deleted successfully.');
      // }
      
      // Temporarily disabled for safety
      setDeleteError('Account deletion is temporarily disabled for safety reasons.');
      
      setIsDeleteAccountOpen(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Failed to delete account. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>Profile</h1>
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Profile</h1>
        <p className={styles.subtitle}>Manage your account settings and preferences</p>
        
        {successMessage && (
          <Toast
            variant="success"
            title="Success"
            description={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {deleteError && (
          <Alert variant="destructive" className={styles.message}>
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}
        
        {/* User Profile Summary */}
        <Card className={styles.profileSummaryCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              <Avatar size="lg" className={styles.avatar} aria-label="Profile avatar">
                <AvatarFallback>
                  {user.email ? user.email.charAt(0).toUpperCase() : <User />}
                </AvatarFallback>
              </Avatar>
              <button type="button" className={styles.cameraButton}>
                <Camera size={16}/>
              </button>
            </div>
            <div className={styles.userInfo}>
                {/** TODO: Hook up to user name */}
              {/* <div className={styles.nameSection}>
                <h2>Khamudom User</h2>
                <button className={styles.editButton}>
                  <PenIcon size={16}/>
                </button>
              </div> */}
              <div className={styles.emailSection}>
                <span>{user.email}</span>
              </div>
              <Badge variant="success" className={styles.statusBadge}>
                Active Account
              </Badge>
            </div>
          </div>
        </Card>

        {/* Account Information & Actions - Two Columns */}
        <div className={styles.twoColumnSection}>
          {/* Account Information Card */}
          <Card className={styles.infoCard}>
            <CardHeader className={styles.cardHeader}>
              <Shield size={24}/>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardDescription className={styles.cardSubtitle}>
              Your account details and security information
            </CardDescription>
            <CardContent className={styles.infoItems}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email Address</span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              <div className={styles.infoItem}>
                <Calendar size={20}/>
                <span className={styles.infoLabel}>Account Created</span>
                <span className={styles.infoValue}>{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div className={styles.infoItem}>
                <Clock size={20}/>
                <span className={styles.infoLabel}>Last Sign In</span>
                <span className={styles.infoValue}>{new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card className={styles.actionsCard}>
            <CardHeader className={styles.cardHeader}>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardDescription className={styles.cardSubtitle}>
              Manage your account settings and security
            </CardDescription>
            <CardContent className={styles.actionButtons}>
              <Button 
                variant="outline"
                icon={<PencilIcon size={20}/>}
                onClick={() => {
                  clearModalErrors();
                  setIsUpdateProfileOpen(true);
                }}
              >
                Update Profile Information
              </Button>
              <Button 
                variant="outline"
                icon={<Shield size={20}/>}
                onClick={() => {
                  clearModalErrors();
                  setIsChangePasswordOpen(true);
                }}
              >
                Change Password
              </Button>
              <Button 
                variant="outline"
                icon={<Mail size={20}/>}
                onClick={() => {
                  clearModalErrors();
                  setIsUpdateEmailOpen(true);
                }}
              >
                Update Email Address
              </Button>
              <Button 
                variant="destructive"
                icon={<Trash2 size={20}/>}
                onClick={() => {
                  clearModalErrors();
                  setIsDeleteAccountOpen(true);
                }}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Update Profile Dialog */}
        <Dialog
          open={isUpdateProfileOpen}
          onOpenChange={(open) => {
            setIsUpdateProfileOpen(open);
            if (!open) setProfileError(null);
          }}
          heading="Update Profile Information"
          className={styles.profileModal}
        >
          <form onSubmit={handleUpdateProfile} className={styles.form}>
            {profileError && (
              <Alert variant="destructive">
                <AlertDescription>{profileError}</AlertDescription>
              </Alert>
            )}
            <Input
              id="fullName"
              label="Full Name"
              type="text"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
              placeholder="Enter your full name"
              required
            />
            <Textarea
              id="bio"
              label="Bio"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
              placeholder="Tell us about yourself"
              rows={3}
            />
            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setIsUpdateProfileOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog
          open={isChangePasswordOpen}
          onOpenChange={(open) => {
            setIsChangePasswordOpen(open);
            if (!open) setPasswordError(null);
          }}
          heading="Change Password"
          className={styles.profileModal}
        >
          <form onSubmit={handleChangePassword} className={styles.form}>
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              placeholder="Enter new password"
              required
            />
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              placeholder="Confirm new password"
              required
            />
            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Update Email Dialog */}
        <Dialog
          open={isUpdateEmailOpen}
          onOpenChange={(open) => {
            setIsUpdateEmailOpen(open);
            if (!open) setEmailError(null);
          }}
          heading="Update Email Address"
          className={styles.profileModal}
        >
          <form onSubmit={handleUpdateEmail} className={styles.form}>
            {emailError && (
              <Alert variant="destructive">
                <AlertDescription>{emailError}</AlertDescription>
              </Alert>
            )}
            <Input
              id="newEmail"
              label="New Email Address"
              type="email"
              value={emailForm.newEmail}
              onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
              placeholder="Enter new email address"
              required
            />
            <Input
              id="password"
              label="Current Password"
              type="password"
              value={emailForm.password}
              onChange={(e) => setEmailForm({...emailForm, password: e.target.value})}
              placeholder="Enter your current password"
              required
            />
            <div className={styles.formActions}>
              <Button type="button" variant="outline" onClick={() => setIsUpdateEmailOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                {isLoading ? 'Updating...' : 'Update Email'}
              </Button>
            </div>
          </form>
        </Dialog>

        {/* Delete Account AlertDialog */}
        <AlertDialog
          open={isDeleteAccountOpen}
          onOpenChange={(open) => {
            setIsDeleteAccountOpen(open);
            if (!open) setDeleteError(null);
          }}
          title="Delete Account"
          description="Warning: This action cannot be undone. All your data, including recipes and preferences, will be permanently deleted. Are you sure you want to delete your account?"
          destructive
          actionLabel={isLoading ? 'Deleting...' : 'Delete Account'}
          onAction={handleDeleteAccount}
        />
      </div>
    </div>
  );
}
