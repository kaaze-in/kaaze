'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Order } from '@/types';

type AuthView = 'login' | 'register' | 'forgot-password' | 'verify-email';
type DashboardTab = 'overview' | 'orders' | 'cart' | 'details' | 'address';

export const AccountClient: React.FC = () => {
  const {
    user,
    profile,
    isLoading: isAuthLoading,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    resendVerification,
    updateProfile,
  } = useAuth();

  const { items: cartItems, itemCount, total: cartTotal } = useCart();

  // Auth screen state (when logged out)
  const [authView, setAuthView] = useState<AuthView>('login');

  // Dashboard tab state (when logged in)
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Google OAuth states
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form states - Register
  const [regFirstName, setRegFirstName] = useState<string>('');
  const [regLastName, setRegLastName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Form states - Forgot Password
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSubmitted, setForgotSubmitted] = useState<boolean>(false);
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Form states - Verification Resend
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  // Dashboard Password Reset message
  const [dashboardResetMsg, setDashboardResetMsg] = useState<string | null>(null);
  const [dashboardResetLoading, setDashboardResetLoading] = useState<boolean>(false);

  // Address editing states
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);
  const [addressName, setAddressName] = useState<string>('');
  const [addressStreet, setAddressStreet] = useState<string>('');
  const [addressCity, setAddressCity] = useState<string>('');
  const [addressPostalCode, setAddressPostalCode] = useState<string>('');
  const [addressPhone, setAddressPhone] = useState<string>('');
  const [saveAddressLoading, setSaveAddressLoading] = useState<boolean>(false);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState<string | null>(null);

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileFirstName, setProfileFirstName] = useState<string>('');
  const [profileLastName, setProfileLastName] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');
  const [saveProfileLoading, setSaveProfileLoading] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Order history state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(false);

  // If pending email verification is active, show verify-email
  useEffect(() => {
    if (pendingVerificationEmail && !user) {
      setAuthView('verify-email');
    }
  }, [pendingVerificationEmail, user]);

  // Sync profile values to edit forms
  useEffect(() => {
    if (profile) {
      setAddressName(profile.shippingAddress?.name || `${profile.firstName} ${profile.lastName}`.trim());
      setAddressStreet(profile.shippingAddress?.street || '');
      setAddressCity(profile.shippingAddress?.city || 'MANGALURU');
      setAddressPostalCode(profile.shippingAddress?.postalCode || '');
      setAddressPhone(profile.phone || '');

      setProfileFirstName(profile.firstName || '');
      setProfileLastName(profile.lastName || '');
      setProfilePhone(profile.phone || '');
    }
  }, [profile]);

  // Fetch verified customer orders
  const fetchCustomerOrders = useCallback(async (email: string) => {
    setIsOrdersLoading(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    const customerEmail = user?.email || profile?.email;
    if (customerEmail) {
      fetchCustomerOrders(customerEmail);
    }
  }, [user?.email, profile?.email, fetchCustomerOrders]);

  // Check for OAuth cancellation or error returned in URL query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error_description') || params.get('error');
      if (urlError) {
        if (
          urlError.toLowerCase().includes('access_denied') ||
          urlError.toLowerCase().includes('cancelled') ||
          urlError.toLowerCase().includes('canceled')
        ) {
          setOauthError('Google sign-in was cancelled.');
        } else {
          setOauthError(urlError);
        }
        // Remove error query params cleanly without reloading
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  // Handle Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    setOauthError(null);
    setLoginError(null);
    setRegError(null);
    setGoogleLoading(true);

    const res = await signInWithGoogle();
    if (!res.success) {
      setGoogleLoading(false);
      setOauthError(res.error || 'Failed to connect to Google. Please try again.');
    }
    // On success, browser navigates to Google consent screen
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOauthError(null);
    setLoginError(null);
    setLoginLoading(true);

    const res = await signIn(loginEmail, loginPassword);
    setLoginLoading(false);

    if (res.needsEmailConfirmation) {
      setPendingVerificationEmail(loginEmail);
      setAuthView('verify-email');
      return;
    }

    if (!res.success) {
      setLoginError(res.error || 'Authentication failed. Please check your credentials.');
      return;
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOauthError(null);
    setRegError(null);
    setRegLoading(true);

    const res = await signUp(regEmail, regPassword, {
      firstName: regFirstName,
      lastName: regLastName,
    });
    setRegLoading(false);

    if (!res.success) {
      setRegError(res.error || 'Registration failed. Please try again.');
      return;
    }

    if (res.needsEmailConfirmation) {
      setPendingVerificationEmail(regEmail);
      setAuthView('verify-email');
      return;
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    const res = await resetPassword(forgotEmail);
    setForgotLoading(false);

    if (!res.success) {
      setForgotError(res.error || 'Password reset request failed.');
      return;
    }

    setForgotSubmitted(true);
  };

  // Handle Resend Verification
  const handleResendVerification = async () => {
    const targetEmail = pendingVerificationEmail || regEmail || loginEmail;
    if (!targetEmail) return;

    setResendLoading(true);
    setResendFeedback(null);
    const res = await resendVerification(targetEmail);
    setResendLoading(false);

    if (res.success) {
      setResendFeedback('Verification email re-sent. Please check your inbox.');
    } else {
      setResendFeedback(res.error || 'Unable to re-send email at this time.');
    }
  };

  // Handle Save Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveAddressLoading(true);
    setAddressSuccessMsg(null);

    const res = await updateProfile({
      phone: addressPhone,
      shippingAddress: {
        name: addressName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim(),
        street: addressStreet,
        city: addressCity,
        country: 'INDIA',
        postalCode: addressPostalCode,
      },
    });

    setSaveAddressLoading(false);
    if (res.success) {
      setIsEditingAddress(false);
      setAddressSuccessMsg('Shipping address updated successfully.');
      setTimeout(() => setAddressSuccessMsg(null), 4000);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveProfileLoading(true);
    setProfileSuccessMsg(null);

    const res = await updateProfile({
      firstName: profileFirstName,
      lastName: profileLastName,
      phone: profilePhone,
    });

    setSaveProfileLoading(false);
    if (res.success) {
      setIsEditingProfile(false);
      setProfileSuccessMsg('Profile details updated successfully.');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    }
  };

  // Handle Trigger Password Reset from Dashboard
  const handleTriggerDashboardReset = async () => {
    if (!user?.email) return;
    setDashboardResetLoading(true);
    setDashboardResetMsg(null);

    const res = await resetPassword(user.email);
    setDashboardResetLoading(false);

    if (res.success) {
      setDashboardResetMsg('Password reset link sent to your registered email.');
      setTimeout(() => setDashboardResetMsg(null), 6000);
    } else {
      setDashboardResetMsg(res.error || 'Unable to send password reset link.');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await signOut();
    setAuthView('login');
  };

  // Display helpers
  const displayName =
    profile?.firstName || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Customer';
  const displayEmail = user?.email || profile?.email || '';
  const memberSince = profile?.memberSince?.replace(' // ARCH-EDTN', '') || '2026';
  const hasSavedAddress = Boolean(
    profile?.shippingAddress?.street?.trim() || addressStreet?.trim()
  );

  // ---------------------------------------------------------------------------
  // 1. LOADING STATE
  // ---------------------------------------------------------------------------
  if (isAuthLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono font-label-md text-label-md uppercase tracking-widest text-outline">
          Loading account...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. AUTHENTICATED DASHBOARD
  // ---------------------------------------------------------------------------
  if (user) {
    return (
      <div className="flex flex-col w-full text-on-surface bg-background">
        {/* Top Header & Welcome Banner */}
        <div className="w-full bg-surface-container-lowest border-b border-surface-container px-margin md:px-margin-desktop py-space-md sm:py-space-lg">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-sm mb-1.5 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="font-mono text-label-sm uppercase tracking-wider text-outline">
                  {user.email_confirmed_at ? 'VERIFIED ACCOUNT' : 'ACTIVE SESSION'}
                </span>
                <span className="text-outline-variant">•</span>
                <span className="font-mono text-label-sm text-outline lowercase">
                  {displayEmail}
                </span>
              </div>
              <h1 className="font-sans font-bold text-headline-lg md:text-display-lg uppercase tracking-tight text-primary leading-none">
                WELCOME, {displayName}.
              </h1>
            </div>

            {/* Top Logout Action */}
            <div className="flex items-center gap-space-sm self-start md:self-center">
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 border border-surface-container hover:border-primary text-primary font-mono text-label-md uppercase tracking-wider transition-colors flex items-center gap-2 bg-surface-container-low hover:bg-surface-container"
              >
                <span>LOGOUT</span>
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="w-full bg-surface-container-low border-b border-surface-container px-margin md:px-margin-desktop sticky top-16 z-30">
          <div className="max-w-6xl mx-auto overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-1 sm:gap-2 py-2 min-w-max font-mono text-label-md uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 transition-colors border-b-2 font-medium ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary font-bold bg-surface-container-lowest'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest/50'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-2 transition-colors border-b-2 font-medium flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'border-primary text-primary font-bold bg-surface-container-lowest'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest/50'
                }`}
              >
                <span>Order History</span>
                <span className="text-xs px-1.5 py-0.2 bg-surface-container rounded-none font-bold">
                  {orders.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cart')}
                className={`px-3.5 py-2 transition-colors border-b-2 font-medium flex items-center gap-1.5 ${
                  activeTab === 'cart'
                    ? 'border-primary text-primary font-bold bg-surface-container-lowest'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest/50'
                }`}
              >
                <span>Saved Cart</span>
                <span className="text-xs px-1.5 py-0.2 bg-surface-container rounded-none font-bold">
                  {itemCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-3.5 py-2 transition-colors border-b-2 font-medium ${
                  activeTab === 'details'
                    ? 'border-primary text-primary font-bold bg-surface-container-lowest'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest/50'
                }`}
              >
                Account Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('address')}
                className={`px-3.5 py-2 transition-colors border-b-2 font-medium ${
                  activeTab === 'address'
                    ? 'border-primary text-primary font-bold bg-surface-container-lowest'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container-lowest/50'
                }`}
              >
                Shipping Address
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content Area */}
        <main className="w-full px-margin md:px-margin-desktop py-space-lg md:py-space-xl">
          <div className="max-w-6xl mx-auto space-y-space-lg">

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-space-lg animate-in fade-in duration-100">
                {/* 4 Summary Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                  {/* Orders Summary Card */}
                  <div className="bg-surface-container-low border border-surface-container p-space-md flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-label-sm uppercase tracking-wider text-outline block mb-1">
                        Total Orders
                      </span>
                      <span className="font-sans font-bold text-headline-lg text-primary block">
                        {orders.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="mt-4 pt-3 border-t border-surface-container font-mono text-label-sm uppercase text-primary hover:underline flex items-center justify-between text-left"
                    >
                      <span>View Orders</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>

                  {/* Cart Items Card */}
                  <div className="bg-surface-container-low border border-surface-container p-space-md flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-label-sm uppercase tracking-wider text-outline block mb-1">
                        Saved in Cart
                      </span>
                      <span className="font-sans font-bold text-headline-lg text-primary block">
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                      </span>
                      <span className="font-mono text-label-sm text-outline mt-1 block">
                        Value: ₹{cartTotal.toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('cart')}
                      className="mt-4 pt-3 border-t border-surface-container font-mono text-label-sm uppercase text-primary hover:underline flex items-center justify-between text-left"
                    >
                      <span>View Cart</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>

                  {/* Shipping Address Summary Card */}
                  <div className="bg-surface-container-low border border-surface-container p-space-md flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-label-sm uppercase tracking-wider text-outline block mb-1">
                        Delivery Address
                      </span>
                      {hasSavedAddress ? (
                        <p className="font-sans text-body-sm text-primary line-clamp-2 mt-1">
                          {profile?.shippingAddress?.street}, {profile?.shippingAddress?.city}
                        </p>
                      ) : (
                        <p className="font-sans text-body-sm text-outline italic mt-1">
                          No address saved yet
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('address')}
                      className="mt-4 pt-3 border-t border-surface-container font-mono text-label-sm uppercase text-primary hover:underline flex items-center justify-between text-left"
                    >
                      <span>{hasSavedAddress ? 'Edit Address' : 'Add Address'}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>

                  {/* Account Profile Card */}
                  <div className="bg-surface-container-low border border-surface-container p-space-md flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-label-sm uppercase tracking-wider text-outline block mb-1">
                        Account Details
                      </span>
                      <p className="font-sans font-bold text-primary truncate mt-1">
                        {displayName}
                      </p>
                      <p className="font-mono text-label-sm text-outline truncate">
                        Member since {memberSince}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="mt-4 pt-3 border-t border-surface-container font-mono text-label-sm uppercase text-primary hover:underline flex items-center justify-between text-left"
                    >
                      <span>Account Settings</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="bg-surface-container-low border border-surface-container p-space-md sm:p-space-lg">
                  <div className="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-md">
                    <div>
                      <h2 className="font-sans font-bold text-headline-md uppercase text-primary">
                        Recent Orders
                      </h2>
                      <p className="font-sans text-body-sm text-on-surface-variant">
                        Latest updates on your purchases
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="font-mono text-label-sm uppercase text-primary hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  {isOrdersLoading ? (
                    <div className="py-8 text-center font-mono text-label-md text-outline">
                      Loading orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-8 text-center space-y-3">
                      <p className="font-sans text-body-md text-on-surface-variant">
                        You have not placed any orders yet.
                      </p>
                      <Link
                        href="/shop"
                        className="inline-block px-5 py-2.5 bg-primary text-on-primary font-mono text-label-sm uppercase tracking-wider font-bold hover:bg-surface-container-high hover:text-primary transition-colors border border-primary"
                      >
                        Browse Shop
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-space-md">
                      {orders.slice(0, 2).map((order) => (
                        <div
                          key={order.id}
                          className="p-space-md bg-surface-container-lowest border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-space-md"
                        >
                          <div>
                            <div className="flex items-center gap-space-sm font-mono text-label-sm flex-wrap">
                              <span className="font-bold text-primary">#{order.orderNumber}</span>
                              <span className="text-outline-variant">•</span>
                              <span className="text-outline">{order.date}</span>
                              <span className="text-outline-variant">•</span>
                              <span className="px-2 py-0.5 border border-surface-container font-semibold uppercase text-xs">
                                {order.status}
                              </span>
                            </div>
                            <p className="font-sans text-body-sm text-on-surface-variant mt-1.5">
                              {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                              {order.items?.[0] ? ` — ${order.items[0].title}` : ''}
                            </p>
                          </div>
                          <div className="text-left md:text-right">
                            <span className="font-mono font-bold text-headline-sm text-primary block">
                              ₹{order.total.toLocaleString()}
                            </span>
                            <span className="font-mono text-xs text-outline uppercase">
                              Payment: Confirmed
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Cart Preview */}
                {cartItems.length > 0 && (
                  <div className="bg-surface-container-low border border-surface-container p-space-md sm:p-space-lg">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-md">
                      <div>
                        <h2 className="font-sans font-bold text-headline-md uppercase text-primary">
                          Saved in Your Bag
                        </h2>
                        <p className="font-sans text-body-sm text-on-surface-variant">
                          Items ready for checkout
                        </p>
                      </div>
                      <Link
                        href="/cart"
                        className="font-mono text-label-sm uppercase text-primary hover:underline"
                      >
                        Go to Cart →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md">
                      {cartItems.slice(0, 3).map((item) => (
                        <div
                          key={item.lineId}
                          className="flex items-center gap-space-sm bg-surface-container-lowest p-space-sm border border-surface-container"
                        >
                          <div className="w-14 h-16 shrink-0 bg-surface-container overflow-hidden border border-surface-container">
                            <img
                              src={item.image}
                              alt={item.imageAlt}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-sans text-body-sm font-semibold text-primary truncate uppercase">
                              {item.title}
                            </h3>
                            <p className="font-mono text-xs text-outline">
                              SZ: {item.selectedSize} // QTY: {item.quantity}
                            </p>
                            <p className="font-mono text-sm font-bold text-primary mt-1">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="space-y-space-md animate-in fade-in duration-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-space-sm">
                  <div>
                    <h2 className="font-sans font-bold text-headline-lg uppercase text-primary">
                      Order History
                    </h2>
                    <p className="font-sans text-body-sm text-on-surface-variant">
                      Track past and active purchases
                    </p>
                  </div>
                  <span className="font-mono text-label-sm text-outline">
                    {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Recorded
                  </span>
                </div>

                {isOrdersLoading ? (
                  <div className="py-16 text-center font-mono text-label-md text-outline">
                    Loading your orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-surface-container-low border border-surface-container p-space-xl text-center space-y-space-sm">
                    <span className="material-symbols-outlined text-4xl text-outline">
                      receipt_long
                    </span>
                    <h3 className="font-sans font-bold text-headline-md uppercase text-primary">
                      No Orders Found
                    </h3>
                    <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">
                      You have not placed any orders yet. When you complete a purchase, your order history and tracking updates will appear here.
                    </p>
                    <div className="pt-space-xs">
                      <Link
                        href="/shop"
                        className="inline-block px-6 py-3 bg-primary text-on-primary font-mono text-label-md uppercase tracking-wider font-bold hover:bg-surface-container-high hover:text-primary transition-colors border border-primary"
                      >
                        Explore Catalogue
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-space-lg">
                    {orders.map((order) => (
                      <article
                        key={order.id}
                        className="bg-surface-container-low border border-surface-container p-space-md sm:p-space-lg flex flex-col gap-space-md"
                      >
                        {/* Order Header Meta */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-b border-surface-container pb-space-sm">
                          <div className="flex flex-wrap items-center gap-space-sm font-mono text-label-sm">
                            <span className="font-bold text-primary text-headline-sm">
                              #{order.orderNumber}
                            </span>
                            <span className="text-outline-variant">•</span>
                            <span className="text-outline">Date: {order.date}</span>
                          </div>
                          <div className="flex items-center gap-space-sm font-mono text-label-sm">
                            <span className="px-2.5 py-1 bg-surface-container-lowest border border-surface-container text-primary font-semibold uppercase">
                              Payment: Confirmed
                            </span>
                            <span
                              className={`px-2.5 py-1 font-bold uppercase tracking-wider ${
                                order.status === 'DELIVERED'
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                                  : order.status === 'IN TRANSIT'
                                  ? 'bg-primary text-on-primary'
                                  : 'bg-surface-container-lowest border border-surface-container text-on-surface'
                              }`}
                            >
                              Delivery: {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-space-sm">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-space-md bg-surface-container-lowest p-space-sm border border-surface-container"
                            >
                              <div className="w-16 h-20 shrink-0 bg-surface-container overflow-hidden border border-surface-container">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.imageAlt || item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-outline text-xs font-mono">
                                    NO IMG
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-sans font-bold text-body-md text-primary uppercase truncate">
                                  {item.title}
                                </h4>
                                <p className="font-mono text-xs text-outline uppercase mt-0.5">
                                  Size: {item.size} {item.color ? `// Color: ${item.color}` : ''}
                                </p>
                                <p className="font-mono text-sm text-primary font-bold mt-1">
                                  ₹{item.price.toLocaleString()} × {item.quantity} = ₹
                                  {(item.price * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer Summary */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container font-mono text-label-sm">
                          <div className="text-outline">
                            Items: {order.itemsCount} total
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-outline uppercase mr-2">Total Amount:</span>
                            <span className="font-bold text-headline-sm text-primary">
                              ₹{order.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAVED CART */}
            {activeTab === 'cart' && (
              <div className="space-y-space-md animate-in fade-in duration-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-space-sm">
                  <div>
                    <h2 className="font-sans font-bold text-headline-lg uppercase text-primary">
                      Saved Cart Items
                    </h2>
                    <p className="font-sans text-body-sm text-on-surface-variant">
                      Items allocated in your shopping session
                    </p>
                  </div>
                  <Link
                    href="/cart"
                    className="font-mono text-label-sm uppercase text-primary hover:underline font-semibold"
                  >
                    View Full Cart [{itemCount}] →
                  </Link>
                </div>

                {cartItems.length === 0 ? (
                  <div className="bg-surface-container-low border border-surface-container p-space-xl text-center space-y-space-sm">
                    <span className="material-symbols-outlined text-4xl text-outline">
                      shopping_bag
                    </span>
                    <h3 className="font-sans font-bold text-headline-md uppercase text-primary">
                      Your Cart is Empty
                    </h3>
                    <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">
                      You currently have no saved items in your cart. Discover original finds and additions in the store.
                    </p>
                    <div className="pt-space-xs">
                      <Link
                        href="/shop"
                        className="inline-block px-6 py-3 bg-primary text-on-primary font-mono text-label-md uppercase tracking-wider font-bold hover:bg-surface-container-high hover:text-primary transition-colors border border-primary"
                      >
                        Explore Catalogue
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container-low border border-surface-container p-space-md sm:p-space-lg flex flex-col gap-space-md">
                    <div className="space-y-space-sm">
                      {cartItems.map((item) => (
                        <div
                          key={item.lineId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-sm sm:p-space-md border border-surface-container"
                        >
                          <div className="flex items-center gap-space-md">
                            <div className="w-16 h-20 shrink-0 bg-surface-container overflow-hidden border border-surface-container">
                              <img
                                src={item.image}
                                alt={item.imageAlt || item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/products/${item.handle}`}
                                className="font-sans font-bold text-body-md text-primary uppercase hover:underline block truncate"
                              >
                                {item.title}
                              </Link>
                              <p className="font-mono text-xs text-outline uppercase mt-0.5">
                                Size: {item.selectedSize}{' '}
                                {item.selectedColor ? `// Color: ${item.selectedColor}` : ''}
                              </p>
                              <p className="font-mono text-sm text-outline mt-1">
                                Price: ₹{item.price.toLocaleString()} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-surface-container">
                            <span className="font-mono text-xs text-outline uppercase block">
                              Item Total
                            </span>
                            <span className="font-mono font-bold text-headline-sm text-primary">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md pt-space-md border-t border-surface-container">
                      <div>
                        <span className="font-mono text-label-sm text-outline uppercase block">
                          Cart Total ({itemCount} {itemCount === 1 ? 'item' : 'items'}):
                        </span>
                        <span className="font-mono font-bold text-headline-md text-primary">
                          ₹{cartTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm w-full sm:w-auto font-mono text-label-sm uppercase">
                        <Link
                          href="/shop"
                          className="px-5 py-3 border border-surface-container hover:border-primary text-primary text-center font-bold transition-colors"
                        >
                          Continue Shopping
                        </Link>
                        <Link
                          href="/cart"
                          className="px-6 py-3 bg-primary text-on-primary hover:bg-surface-container-high hover:text-primary text-center font-bold transition-colors border border-primary"
                        >
                          Proceed to Checkout
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ACCOUNT DETAILS */}
            {activeTab === 'details' && (
              <div className="space-y-space-md animate-in fade-in duration-100">
                <div className="border-b border-surface-container pb-space-sm">
                  <h2 className="font-sans font-bold text-headline-lg uppercase text-primary">
                    Account Details
                  </h2>
                  <p className="font-sans text-body-sm text-on-surface-variant">
                    Manage your personal profile and account credentials
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3 bg-surface-container border border-primary text-primary font-mono text-label-sm">
                    {profileSuccessMsg}
                  </div>
                )}

                {dashboardResetMsg && (
                  <div className="p-3 bg-surface-container border border-primary text-primary font-mono text-label-sm">
                    {dashboardResetMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {/* Profile Information Card */}
                  <div className="bg-surface-container-low border border-surface-container p-space-md sm:p-space-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-md">
                        <h3 className="font-sans font-bold text-headline-md uppercase text-primary">
                          Personal Information
                        </h3>
                        {!isEditingProfile && (
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(true)}
                            className="font-mono text-label-sm uppercase text-primary hover:underline font-semibold"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {isEditingProfile ? (
                        <form onSubmit={handleSaveProfile} className="space-y-space-sm font-mono">
                          <div>
                            <label className="text-outline text-xs block mb-1 uppercase">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={profileFirstName}
                              onChange={(e) => setProfileFirstName(e.target.value)}
                              className="w-full bg-surface-container-lowest border border-surface-container px-3 py-2 text-sm text-primary uppercase outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-outline text-xs block mb-1 uppercase">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={profileLastName}
                              onChange={(e) => setProfileLastName(e.target.value)}
                              className="w-full bg-surface-container-lowest border border-surface-container px-3 py-2 text-sm text-primary uppercase outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-outline text-xs block mb-1 uppercase">
                              Contact Phone
                            </label>
                            <input
                              type="tel"
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              placeholder="+91 98450 00000"
                              className="w-full bg-surface-container-lowest border border-surface-container px-3 py-2 text-sm text-primary outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex items-center gap-3 pt-space-xs">
                            <button
                              type="submit"
                              disabled={saveProfileLoading}
                              className="px-4 py-2 bg-primary text-on-primary text-xs uppercase font-bold hover:bg-surface-container-high hover:text-primary transition-colors"
                            >
                              {saveProfileLoading ? 'Saving...' : 'Save Profile'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingProfile(false)}
                              className="px-4 py-2 border border-surface-container text-outline text-xs uppercase hover:text-primary"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-space-sm font-mono text-label-md">
                          <div>
                            <span className="text-outline text-xs block uppercase">Full Name</span>
                            <span className="text-primary font-bold text-body-md uppercase">
                              {profile?.firstName || profile?.lastName
                                ? `${profile.firstName} ${profile.lastName}`.trim()
                                : displayName}
                            </span>
                          </div>
                          <div>
                            <span className="text-outline text-xs block uppercase">Contact Phone</span>
                            <span className="text-primary text-body-md">
                              {profile?.phone || 'Not provided'}
                            </span>
                          </div>
                          <div>
                            <span className="text-outline text-xs block uppercase">Member Since</span>
                            <span className="text-primary text-body-md">
                              {memberSince}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Credentials & Security Card */}
                  <div className="bg-surface-container-low border border-surface-container p-space-md sm:p-space-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-space-sm border-b border-surface-container mb-space-md">
                        <h3 className="font-sans font-bold text-headline-md uppercase text-primary">
                          Email &amp; Security
                        </h3>
                        <span className="material-symbols-outlined text-outline text-lg">
                          lock
                        </span>
                      </div>

                      <div className="space-y-space-sm font-mono text-label-md">
                        <div>
                          <span className="text-outline text-xs block uppercase">Registered Email</span>
                          <span className="text-primary font-bold text-body-md lowercase">
                            {displayEmail}
                          </span>
                        </div>
                        <div>
                          <span className="text-outline text-xs block uppercase">Email Status</span>
                          <span
                            className={`inline-block text-xs uppercase px-2 py-0.5 mt-1 font-semibold ${
                              user.email_confirmed_at
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                                : 'bg-surface-container text-primary border border-surface-container'
                            }`}
                          >
                            {user.email_confirmed_at ? 'Verified' : 'Confirmation Pending'}
                          </span>
                        </div>
                        <div>
                          <span className="text-outline text-xs block uppercase">Password</span>
                          <span className="text-outline text-body-md">••••••••••••</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-space-md mt-space-md border-t border-surface-container flex flex-wrap items-center gap-space-sm font-mono text-label-sm">
                      <button
                        type="button"
                        disabled={dashboardResetLoading}
                        onClick={handleTriggerDashboardReset}
                        className="px-4 py-2 border border-surface-container hover:border-primary text-primary uppercase font-bold transition-colors"
                      >
                        {dashboardResetLoading ? 'Sending...' : 'Reset Password'}
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-4 py-2 text-outline hover:text-primary uppercase font-medium transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SHIPPING ADDRESS */}
            {activeTab === 'address' && (
              <div className="space-y-space-md animate-in fade-in duration-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-space-sm">
                  <div>
                    <h2 className="font-sans font-bold text-headline-lg uppercase text-primary">
                      Shipping Address
                    </h2>
                    <p className="font-sans text-body-sm text-on-surface-variant">
                      Primary delivery location for your orders
                    </p>
                  </div>
                  {!isEditingAddress && hasSavedAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(true)}
                      className="font-mono text-label-sm uppercase text-primary hover:underline font-semibold"
                    >
                      Edit Address
                    </button>
                  )}
                </div>

                {addressSuccessMsg && (
                  <div className="p-3 bg-surface-container border border-primary text-primary font-mono text-label-sm">
                    {addressSuccessMsg}
                  </div>
                )}

                <div className="max-w-2xl">
                  {isEditingAddress ? (
                    <div className="bg-surface-container-low border border-surface-container p-space-md sm:p-space-lg">
                      <h3 className="font-sans font-bold text-headline-md uppercase text-primary mb-space-md">
                        {hasSavedAddress ? 'Edit Shipping Address' : 'Add Shipping Address'}
                      </h3>
                      <form onSubmit={handleSaveAddress} className="space-y-space-sm font-mono">
                        <div>
                          <label className="text-outline text-xs block mb-1 uppercase">
                            Recipient Name
                          </label>
                          <input
                            type="text"
                            required
                            value={addressName}
                            onChange={(e) => setAddressName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full bg-surface-container-lowest border border-surface-container px-3 py-2 text-sm text-primary uppercase outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-outline text-xs block mb-1 uppercase">
                            Street Address
                          </label>
                          <input
                            type="text"
                            required
                            value={addressStreet}
                            onChange={(e) => setAddressStreet(e.target.value)}
                            placeholder="Apartment, building, street address"
                            className="w-full bg-surface-container-lowest border border-surface-container px-3 py-2 text-sm text-primary uppercase outline-none focus:border-primary"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                          <div>
                            <label className="text-outline text-xs block mb-1 uppercase">
                              City / Region
                            </label>
                            <input
                              type="text"
                              required
                              value={addressCity}
                              onChange={(e) => setAddressCity(e.target.value)}
                              placeholder="City"
                              className="w-full bg-surface-container-lowest border border-surface-container px-3 py-2 text-sm text-primary uppercase outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="text-outline text-xs block mb-1 uppercase">
                              Postal Code / PIN
                            </label>
                            <input
                              type="text"
                              required
                              value={addressPostalCode}
                              onChange={(e) => setAddressPostalCode(e.target.value)}
                              placeholder="575001"
                              className="w-full bg-surface-container-lowest border border-surface-container px-3 py-2 text-sm text-primary uppercase outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                          <div>
                            <label className="text-outline text-xs block mb-1 uppercase">
                              Country
                            </label>
                            <input
                              type="text"
                              disabled
                              value="INDIA"
                              className="w-full bg-surface-container border border-surface-container px-3 py-2 text-sm text-outline uppercase cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="text-outline text-xs block mb-1 uppercase">
                              Contact Phone
                            </label>
                            <input
                              type="tel"
                              value={addressPhone}
                              onChange={(e) => setAddressPhone(e.target.value)}
                              placeholder="+91 98450 00000"
                              className="w-full bg-surface-container-lowest border border-surface-container px-3 py-2 text-sm text-primary outline-none focus:border-primary"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-space-sm">
                          <button
                            type="submit"
                            disabled={saveAddressLoading}
                            className="px-6 py-2.5 bg-primary text-on-primary text-xs uppercase font-bold hover:bg-surface-container-high hover:text-primary transition-colors border border-primary"
                          >
                            {saveAddressLoading ? 'Saving...' : 'Save Address'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(false)}
                            className="px-5 py-2.5 border border-surface-container text-outline text-xs uppercase hover:text-primary transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : hasSavedAddress ? (
                    <div className="bg-surface-container-low border border-surface-container p-space-md sm:p-space-lg flex flex-col justify-between">
                      <div className="space-y-space-xs font-mono">
                        <div className="flex items-center justify-between pb-space-xs border-b border-surface-container mb-space-sm">
                          <span className="text-xs uppercase text-outline">Primary Delivery Destination</span>
                          <span className="text-xs px-2 py-0.5 bg-surface-container text-primary font-bold uppercase">
                            Default
                          </span>
                        </div>
                        <p className="font-bold text-body-lg text-primary uppercase">
                          {profile?.shippingAddress?.name || addressName || displayName}
                        </p>
                        <p className="text-on-surface-variant text-body-md uppercase">
                          {profile?.shippingAddress?.street || addressStreet}
                        </p>
                        <p className="text-on-surface-variant text-body-md uppercase">
                          {profile?.shippingAddress?.city || addressCity},{' '}
                          {profile?.shippingAddress?.country || 'INDIA'}{' '}
                          {profile?.shippingAddress?.postalCode || addressPostalCode}
                        </p>
                        {(profile?.phone || addressPhone) && (
                          <p className="text-outline text-sm pt-1">
                            Phone: {profile?.phone || addressPhone}
                          </p>
                        )}
                      </div>

                      <div className="pt-space-md mt-space-md border-t border-surface-container">
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(true)}
                          className="px-5 py-2.5 border border-surface-container hover:border-primary text-primary font-mono text-label-sm uppercase font-bold transition-colors"
                        >
                          Edit Address
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-container-low border border-surface-container p-space-xl text-center space-y-space-sm">
                      <span className="material-symbols-outlined text-4xl text-outline">
                        location_on
                      </span>
                      <h3 className="font-sans font-bold text-headline-md uppercase text-primary">
                        No Saved Address
                      </h3>
                      <p className="font-sans text-body-md text-on-surface-variant max-w-md mx-auto">
                        You have not saved a shipping address yet. Add your address for faster dispatch and order delivery.
                      </p>
                      <div className="pt-space-xs">
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(true)}
                          className="px-6 py-3 bg-primary text-on-primary font-mono text-label-md uppercase tracking-wider font-bold hover:bg-surface-container-high hover:text-primary transition-colors border border-primary"
                        >
                          Add Shipping Address
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. LOGGED OUT AUTHENTICATION SCREENS
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col w-full text-on-surface bg-background py-space-xl px-margin">
      <div className="w-full max-w-[460px] mx-auto bg-surface-container-low border border-surface-container p-space-lg sm:p-space-xl flex flex-col relative font-mono">

        {/* Tab switch between Sign In and Create Account */}
        {authView !== 'forgot-password' && authView !== 'verify-email' && (
          <div className="grid grid-cols-2 border border-surface-container mb-space-lg font-mono text-label-md uppercase">
            <button
              type="button"
              onClick={() => {
                setAuthView('login');
                setLoginError(null);
              }}
              className={`py-2.5 transition-colors font-bold text-center ${
                authView === 'login'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthView('register');
                setRegError(null);
              }}
              className={`py-2.5 transition-colors font-bold text-center ${
                authView === 'register'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* VIEW A: SIGN IN */}
        {authView === 'login' && (
          <div className="flex flex-col space-y-space-md">
            <div>
              <h1 className="font-sans font-bold text-headline-lg uppercase text-primary tracking-tight leading-none">
                WELCOME BACK.
              </h1>
              <p className="font-sans text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                Sign in to view your orders, saved cart items, and delivery address.
              </p>
            </div>

            {oauthError && (
              <div className="p-3 bg-surface-container-lowest border border-error text-error text-xs leading-relaxed flex items-center justify-between">
                <span>{oauthError}</span>
                <button
                  type="button"
                  onClick={() => setOauthError(null)}
                  className="text-error hover:opacity-75 font-bold ml-2 text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-surface-container-lowest border border-error text-error text-xs leading-relaxed">
                {loginError}
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 bg-surface-container-lowest hover:bg-surface-container border border-surface-container hover:border-primary text-primary font-mono text-label-md uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-space-sm font-mono">
              <div className="flex-1 h-px bg-surface-container"></div>
              <span className="text-xs uppercase text-outline tracking-wider">or sign in with email</span>
              <div className="flex-1 h-px bg-surface-container"></div>
            </div>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-on-surface" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-lowest border border-surface-container focus:border-primary text-primary text-sm px-3 py-2 outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs uppercase">
                  <label className="text-on-surface" htmlFor="login-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setAuthView('forgot-password');
                    }}
                    className="text-outline hover:text-primary transition-colors underline underline-offset-4"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative w-full">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-surface-container-lowest border border-surface-container focus:border-primary text-primary text-sm px-3 py-2 pr-16 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs uppercase text-outline hover:text-primary px-1"
                  >
                    {showLoginPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-primary hover:bg-surface-container-high hover:text-primary text-on-primary font-mono text-label-md uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 border border-primary"
              >
                <span>{loginLoading ? 'Signing in...' : 'Sign In'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          </div>
        )}

        {/* VIEW B: CREATE ACCOUNT */}
        {authView === 'register' && (
          <div className="flex flex-col space-y-space-md">
            <div>
              <h1 className="font-sans font-bold text-headline-lg uppercase text-primary tracking-tight leading-none">
                CREATE ACCOUNT.
              </h1>
              <p className="font-sans text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                Register to track your purchases, save your address, and manage orders.
              </p>
            </div>

            {oauthError && (
              <div className="p-3 bg-surface-container-lowest border border-error text-error text-xs leading-relaxed flex items-center justify-between">
                <span>{oauthError}</span>
                <button
                  type="button"
                  onClick={() => setOauthError(null)}
                  className="text-error hover:opacity-75 font-bold ml-2 text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {regError && (
              <div className="p-3 bg-surface-container-lowest border border-error text-error text-xs leading-relaxed">
                {regError}
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 px-4 bg-surface-container-lowest hover:bg-surface-container border border-surface-container hover:border-primary text-primary font-mono text-label-md uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-space-sm font-mono">
              <div className="flex-1 h-px bg-surface-container"></div>
              <span className="text-xs uppercase text-outline tracking-wider">or register with email</span>
              <div className="flex-1 h-px bg-surface-container"></div>
            </div>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-space-md">
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase text-on-surface" htmlFor="reg-first-name">
                    First Name
                  </label>
                  <input
                    id="reg-first-name"
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="Alexander"
                    className="w-full bg-surface-container-lowest border border-surface-container focus:border-primary text-primary text-sm px-3 py-2 outline-none uppercase transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase text-on-surface" htmlFor="reg-last-name">
                    Last Name
                  </label>
                  <input
                    id="reg-last-name"
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Vance"
                    className="w-full bg-surface-container-lowest border border-surface-container focus:border-primary text-primary text-sm px-3 py-2 outline-none uppercase transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-on-surface" htmlFor="reg-email">
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-lowest border border-surface-container focus:border-primary text-primary text-sm px-3 py-2 outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs uppercase">
                  <label className="text-on-surface" htmlFor="reg-password">
                    Password (min. 6 characters)
                  </label>
                </div>
                <div className="relative w-full">
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-surface-container-lowest border border-surface-container focus:border-primary text-primary text-sm px-3 py-2 pr-16 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs uppercase text-outline hover:text-primary px-1"
                  >
                    {showRegPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 bg-primary hover:bg-surface-container-high hover:text-primary text-on-primary font-mono text-label-md uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 border border-primary"
              >
                <span>{regLoading ? 'Creating Account...' : 'Create Account'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          </div>
        )}

        {/* VIEW C: FORGOT PASSWORD */}
        {authView === 'forgot-password' && (
          <div className="flex flex-col space-y-space-md">
            <div>
              <h1 className="font-sans font-bold text-headline-lg uppercase text-primary tracking-tight leading-none">
                RESET PASSWORD.
              </h1>
              <p className="font-sans text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                Enter your registered email address to receive password reset instructions.
              </p>
            </div>

            {forgotSubmitted ? (
              <div className="p-space-md bg-surface-container-lowest border border-primary space-y-3">
                <p className="font-sans text-body-sm text-primary font-bold">
                  Instructions Sent
                </p>
                <p className="font-sans text-body-sm text-on-surface-variant">
                  If an account exists for <strong className="text-primary">{forgotEmail}</strong>, you will receive an email with reset directions shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setAuthView('login');
                  }}
                  className="mt-2 w-full py-2.5 bg-primary text-on-primary font-mono text-label-sm uppercase font-bold"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-space-md">
                {forgotError && (
                  <div className="p-3 bg-surface-container-lowest border border-error text-error text-xs">
                    {forgotError}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase text-on-surface" htmlFor="forgot-email">
                    Registered Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-surface-container-lowest border border-surface-container focus:border-primary text-primary text-sm px-3 py-2 outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 bg-primary text-on-primary font-mono text-label-sm uppercase font-bold hover:bg-surface-container-high hover:text-primary transition-colors border border-primary disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="py-2.5 px-4 border border-surface-container text-outline hover:text-primary font-mono text-label-sm uppercase transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* VIEW D: VERIFY EMAIL */}
        {authView === 'verify-email' && (
          <div className="flex flex-col space-y-space-md">
            <div>
              <h1 className="font-sans font-bold text-headline-lg uppercase text-primary tracking-tight leading-none">
                VERIFY YOUR EMAIL.
              </h1>
              <p className="font-sans text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                A verification link has been sent to{' '}
                <strong className="text-primary">{pendingVerificationEmail || 'your email'}</strong>. Please click the link to confirm your account.
              </p>
            </div>

            {resendFeedback && (
              <div className="p-3 bg-surface-container-lowest border border-primary text-primary text-xs">
                {resendFeedback}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={resendLoading}
                onClick={handleResendVerification}
                className="w-full py-2.5 bg-primary text-on-primary font-mono text-label-sm uppercase font-bold hover:bg-surface-container-high hover:text-primary transition-colors border border-primary disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingVerificationEmail(null);
                  setAuthView('login');
                }}
                className="w-full py-2.5 border border-surface-container text-outline hover:text-primary font-mono text-label-sm uppercase transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
