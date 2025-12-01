import { TextClassContext } from '@/components/ui/text';
import { XIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Portal } from '@rn-primitives/portal';
import * as React from 'react';
import { useEffect } from 'react';
import { Platform, Pressable, useWindowDimensions, View, type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;
const DRAWER_PORTAL_NAME = 'drawer-portal';

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dismissible?: boolean;
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(undefined);

function useDrawerContext() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error('Drawer components must be used within a Drawer');
  }
  return context;
}

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissible?: boolean;
  children: React.ReactNode;
}

function Drawer({ open: controlledOpen, onOpenChange, dismissible = true, children }: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const open = controlledOpen ?? uncontrolledOpen;
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setUncontrolledOpen(newOpen);
      }
    },
    [onOpenChange]
  );

  return (
    <DrawerContext.Provider value={{ open, onOpenChange: handleOpenChange, dismissible }}>
      {children}
    </DrawerContext.Provider>
  );
}

interface DrawerTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

function DrawerTrigger({ asChild, children }: DrawerTriggerProps) {
  const { onOpenChange } = useDrawerContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onPress: () => onOpenChange(true),
    });
  }

  return <Pressable onPress={() => onOpenChange(true)}>{children}</Pressable>;
}

interface DrawerContentProps extends ViewProps {
  className?: string;
  portalHost?: string;
  children: React.ReactNode;
}

function DrawerContent({ className, portalHost, children, ...props }: DrawerContentProps) {
  const { open, onOpenChange, dismissible } = useDrawerContext();
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(0);

  const minHeight = height * 0.4; // 40vh
  const maxHeight = height * 0.7; // 70vh

  const handleClose = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const panGesture = Gesture.Pan()
    .enabled(dismissible ?? true)
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        // Swipe down to dismiss
        runOnJS(handleClose)();
      } else {
        // Spring back to position
        translateY.value = withSpring(0, { damping: 50 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (open) {
      // Reset position when opening
      translateY.value = withSpring(0, { damping: 50 });
    } else {
      // Reset position when closed for next open
      translateY.value = 0;
    }
  }, [open, translateY]);

  if (!open) {
    return null;
  }

  return (
    <Portal name={DRAWER_PORTAL_NAME} hostName={portalHost}>
      <FullWindowOverlay>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          className={cn(
            'z-50 flex items-end justify-center bg-black/50',
            Platform.select({
              web: 'animate-in fade-in-0 fixed',
            })
          )}
          onPress={() => dismissible && onOpenChange(false)}>
          <GestureDetector gesture={panGesture}>
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={[{ width: '100%', bottom: 0, position: "absolute" }, animatedStyle]}>
              <Animated.View
                entering={SlideInDown.duration(300)}
                exiting={SlideOutDown.duration(250)}
                style={{ width: '100%' }}>
                <View
                  style={{ width: '100%', minHeight, maxHeight }}
                  className={cn(
                    'bg-background border-border z-50 rounded-t-2xl border-t border-l border-r shadow-2xl shadow-black/10',
                    Platform.select({
                      web: 'animate-in slide-in-from-bottom duration-300',
                    }),
                    className
                  )}>
                  <Pressable
                    onPress={(e) => e.stopPropagation()}
                    className="flex flex-col gap-4 w-full p-6">
                    {dismissible && <DrawerHandle />}
                    {children}
                  </Pressable>
                </View>
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        </Pressable>
      </FullWindowOverlay>
    </Portal>
  );
}

function DrawerHandle() {
  return (
    <View className="flex items-center pb-2">
      <View className="bg-muted h-1 w-12 rounded-full" />
    </View>
  );
}

interface DrawerHeaderProps extends ViewProps {
  className?: string;
}

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <TextClassContext.Provider value="text-left">
      <View className={cn('flex flex-col gap-2', className)} {...props} />
    </TextClassContext.Provider>
  );
}

interface DrawerFooterProps extends ViewProps {
  className?: string;
}

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <View className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4', className)} {...props} />
  );
}

interface DrawerTitleProps {
  className?: string;
  children: React.ReactNode;
}

function DrawerTitle({ className, children }: DrawerTitleProps) {
  return (
    <TextClassContext.Provider value={cn('text-foreground text-xl font-semibold font-body', className)}>
      {children}
    </TextClassContext.Provider>
  );
}

interface DrawerDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function DrawerDescription({ className, children }: DrawerDescriptionProps) {
  return (
    <TextClassContext.Provider value={cn('text-muted-foreground text-sm font-body', className)}>
      {children}
    </TextClassContext.Provider>
  );
}

interface DrawerCloseProps {
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
}

function DrawerClose({ className, children, asChild }: DrawerCloseProps) {
  const { onOpenChange } = useDrawerContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onPress: () => onOpenChange(false),
    });
  }

  return (
    <Pressable
      onPress={() => onOpenChange(false)}
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity',
        Platform.select({
          web: 'hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
        }),
        className
      )}>
      {children || <XIcon size={24} className="text-muted-foreground" />}
    </Pressable>
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
};

