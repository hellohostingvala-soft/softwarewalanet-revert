import React, { createContext, useContext, ReactNode } from 'react';
import useAnimations from '@/hooks/useAnimations';
import { 
  WelcomeAnimation, 
  WelcomeBackAnimation, 
  PaymentSuccessAnimation, 
  BookingSuccessAnimation 
} from '@/components/animations';

interface AnimationContextType {
  showWelcome: (userName?: string, userRole?: string) => void;
  showWelcomeBack: (userName?: string, userRole?: string, maskedId?: string) => void;
  showPaymentSuccess: (amount?: string, transactionId?: string) => void;
  showBookingSuccess: (bookingType?: 'demo' | 'subscription' | 'booking', bookingId?: string) => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const {
    animation,
    showWelcome,
    showWelcomeBack,
    showPaymentSuccess,
    showBookingSuccess,
    hideAnimation,
  } = useAnimations();

  return (
    <AnimationContext.Provider value={{ 
      showWelcome, 
      showWelcomeBack, 
      showPaymentSuccess, 
      showBookingSuccess 
    }}>
      {children}
      
      {/* Animation Overlays */}
      <WelcomeAnimation
        isVisible={animation.type === 'welcome'}
        onComplete={hideAnimation}
        userName={animation.data?.userName}
        userRole={animation.data?.userRole}
      />
      
      <WelcomeBackAnimation
        isVisible={animation.type === 'welcomeBack'}
        onComplete={hideAnimation}
        userName={animation.data?.userName}
        userRole={animation.data?.userRole}
        maskedId={animation.data?.maskedId}
      />
      
      <PaymentSuccessAnimation
        isVisible={animation.type === 'paymentSuccess'}
        onComplete={hideAnimation}
        amount={animation.data?.amount}
        transactionId={animation.data?.transactionId}
      />
      
      <BookingSuccessAnimation
        isVisible={animation.type === 'bookingSuccess'}
        onComplete={hideAnimation}
        bookingType={animation.data?.bookingType}
        bookingId={animation.data?.bookingId}
      />
    </AnimationContext.Provider>
  );
};

export const useAnimationContext = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimationContext must be used within an AnimationProvider');
  }
  return context;
};

export default AnimationContext;
