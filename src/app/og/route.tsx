import { ImageResponse } from 'next/og';
import { baseURL, renderContent } from '@/app/resources';
import { getTranslations } from 'next-intl/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    let url = new URL(request.url);
    let title = url.searchParams.get('title') || 'Portfolio';
    const font = fetch(
        new URL('../../../public/fonts/Inter.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());
    const fontData = await font;

    const t = await getTranslations();
    const { person } = renderContent(t);

    return new ImageResponse(
        (
            <div className="og-container">
                <div className="og-content">
                    <span className="og-title">
                        {title}
                    </span>
                    <div>
                        <span style={{ fontSize: '4rem', lineHeight: '4rem', opacity: '0.6' }}>
                            {person.role}
                        </span>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1920,
            height: 1080,
            fonts: [
                {
                    name: 'Inter',
                    data: fontData,
                    style: 'normal',
                },
            ],
        }
    );
}