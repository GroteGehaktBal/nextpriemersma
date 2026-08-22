'use client'

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Flex, Toast } from '.';
import styles from './Toaster.module.scss';

interface ToasterProps {
    toasts: { 
        id: string; 
        variant: 'success' | 'danger'; 
        message: string; 
        action?: React.ReactNode 
    }[];
    removeToast: (id: string) => void;
}

/**
 * Renders toasts into a portal on document.body.
 *
 * The portal is deferred until after mount. `document` does not exist while the
 * server renders, and this component is reachable from MDX content through
 * HeadingLink, so without the guard every statically generated page carrying MDX
 * fails to prerender with "document is not defined". It went unnoticed because
 * RouteGuard used to stop the server from rendering page content at all.
 */
const Toaster: React.FC<ToasterProps> = ({
    toasts,
    removeToast }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return createPortal(
        <Flex
            zIndex={11}
            fillWidth
            direction="column"
            maxWidth={32}
            className={styles.toastContainer}>
            {toasts.map((toast, index, array) => (
                <Flex
                    padding="4"
                    fillWidth
                    position="absolute"
                    key={toast.id}
                    className={styles.toastWrapper}
                    style={{
                        transformOrigin: 'bottom center',
                        transform: `scale(${1 - (array.length - 1 - index) * 0.05}) translateY(${1 - (array.length - 1 - index) * 10}%)`,
                        opacity: array.length - 1 - index === 0 ? 1 : 0.9
                    }}>
                    <Toast
                        className={styles.toastAnimation}
                        variant={toast.variant}
                        onClose={() => removeToast(toast.id)}
                        action={toast.action}>
                        {toast.message}
                    </Toast>
                </Flex>
            ))}
        </Flex>,
        document.body
    );
};

Toaster.displayName = 'Toaster';

export { Toaster };