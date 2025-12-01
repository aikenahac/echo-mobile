import { FullScreenLoader } from '@/components/full-screen-loader';
import { LibraryDrawer } from '@/components/library-drawer';
import { LibraryViewSwitcher } from '@/components/library-view-switcher';
import { ScreenContainer } from '@/components/screen-container';
import { Text } from '@/components/ui/text';
import { useMyLibrary } from '@/hooks/api/library/use-get-my-library';
import { useLibraryTab } from '@/hooks/use-library-tab';
import { useLibraryView } from '@/hooks/use-library-view';
import { useAuth } from '@clerk/clerk-expo';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function LibraryScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();

  const { activeView, changeActiveView } = useLibraryView();
  const { activeTab, activeDataSource, changeActiveTab } = useLibraryTab();

  const { data: library, isLoading, error, refetch } = useMyLibrary();

  if (isLoading) {
    return (
      <FullScreenLoader />
    )
  }

  const getContent = () => {
    if (activeDataSource === "collection") {
      return "/";
    }

    return JSON.stringify(library?.[activeDataSource], null, 2)
  }

  return (
    <ScreenContainer className="flex flex-col  w-screen h-screen justify-between mt-8 mb-12">
      <Text className='font-extrabold text-4xl'>{t("library.title")}</Text>

      <View className='w-full flex flex-row items-center justify-between my-4'>
        <LibraryDrawer activeTab={activeTab} changeActiveTab={changeActiveTab} />
        <LibraryViewSwitcher activeView={activeView} changeActiveView={changeActiveView} />
      </View>

      <ScrollView>
        <Text>{getContent()}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

