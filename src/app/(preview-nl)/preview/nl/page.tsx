import { nl } from '@/components/preview/content.nl';
import { PreviewPage } from '@/components/preview/PreviewPage';

export default function DutchPreview() {
  return <PreviewPage content={nl} locale="nl" />;
}
