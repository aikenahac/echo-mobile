import { cn } from '@/lib/utils';
import { ActivityIndicator, View } from 'react-native';
import { Text } from './ui/text';

type FullScreenLoaderProps = {
  className?: string;
  containerClassName?: string;
};

export function FullScreenLoader({ className, containerClassName }: FullScreenLoaderProps) {
  return (
    <View className={cn('flex-1 justify-center items-center', containerClassName)}>
      <Text>
        <ActivityIndicator size='large' className={cn('text-primary', className)} />
      </Text>
    </View>
  );
}
