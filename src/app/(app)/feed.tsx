import { ScreenContainer } from '@/components/screen-container';
import { UnderConstruction } from '@/components/under-construction';

export default function FeedScreen() {
  return (
    <ScreenContainer>
      <UnderConstruction
        title="Feed Coming Soon"
        message="We're working on bringing you an amazing feed experience!"
      />
    </ScreenContainer>
  );
}

