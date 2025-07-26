import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    gtag: any;
    mixpanel: any;
  }
}

// Google Analytics
export const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID;

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Mixpanel Analytics
export const trackEvent = (eventName: string, properties?: any) => {
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.track(eventName, properties);
  }
};

export const identifyUser = (userId: string, traits?: any) => {
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.identify(userId);
    if (traits) {
      window.mixpanel.people.set(traits);
    }
  }
};

// Custom Analytics Hook
export const useAnalytics = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Identify user for analytics
      identifyUser(user.id, {
        username: user.username,
        email: user.email,
        subscription_type: user.subscription.type,
        created_at: new Date().toISOString()
      });
    }
  }, [user]);

  const trackMangaProcessed = (settings: any) => {
    const eventData = {
      target_language: settings.targetLanguage,
      ai_coloring_enabled: settings.enableColoring,
      coloring_style: settings.coloringStyle,
      user_subscription: user?.subscription.type
    };

    // Google Analytics
    event({
      action: 'manga_processed',
      category: 'Processing',
      label: settings.targetLanguage
    });

    // Mixpanel
    trackEvent('Manga Processed', eventData);
  };

  const trackSubscriptionUpgrade = (plan: string) => {
    const eventData = {
      plan: plan,
      user_id: user?.id
    };

    // Google Analytics
    event({
      action: 'subscription_upgrade',
      category: 'Conversion',
      label: plan
    });

    // Mixpanel
    trackEvent('Subscription Upgraded', eventData);
  };

  const trackUserRegistration = () => {
    // Google Analytics
    event({
      action: 'sign_up',
      category: 'User',
      label: 'registration'
    });

    // Mixpanel
    trackEvent('User Registered');
  };

  const trackPageView = (pageName: string) => {
    // Google Analytics
    pageview(window.location.pathname);

    // Mixpanel
    trackEvent('Page Viewed', {
      page: pageName,
      url: window.location.pathname
    });
  };

  return {
    trackMangaProcessed,
    trackSubscriptionUpgrade,
    trackUserRegistration,
    trackPageView
  };
};

// Error Tracking (Sentry)
export const captureException = (error: Error, context?: any) => {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    if (context) {
      (window as any).Sentry.withScope((scope: any) => {
        scope.setContext('additional_info', context);
        (window as any).Sentry.captureException(error);
      });
    } else {
      (window as any).Sentry.captureException(error);
    }
  }
  console.error('Error captured:', error, context);
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(message, level);
  }
  console.log(`[${level.toUpperCase()}] ${message}`);
};