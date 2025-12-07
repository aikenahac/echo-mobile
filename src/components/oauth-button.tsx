import { cn } from '@/lib/utils'
import { useSSO } from '@clerk/clerk-expo'
import { OAuthStrategy } from '@clerk/types'
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import React, { useCallback, useEffect } from 'react'
import { Platform, TouchableOpacity } from 'react-native'

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS === 'web') return
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}
WebBrowser.maybeCompleteAuthSession()

interface Props {
  // The OAuthStrategy type from Clerk allows you to specify the provider you want to use in this specific instance of the OAuthButton component
  strategy: OAuthStrategy
  children: React.ReactNode
}

export default function OAuthButton({ strategy, children }: Props) {
  useWarmUpBrowser()
  const { startSSOFlow } = useSSO()

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      if (createdSessionId) {
        setActive!({ session: createdSessionId })
      } else {
        throw new Error('Failed to create session')
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }, [startSSOFlow, strategy])

  return (
    <TouchableOpacity onPress={onPress} className={cn(
      "flex flex-row items-center justify-center gap-4",
      "w-1/2 rounded-md px-4 py-3",
      "bg-background active:bg-accent dark:bg-input/30 dark:active:bg-input/50",
      "shadow-sm shadow-black/5",
      "border border-border dark:border-input"
    )}>
      {children}
    </TouchableOpacity>
  )
}