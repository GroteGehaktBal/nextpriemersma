'use client';

import React, { forwardRef, ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import Link from 'next/link';
import { Icon } from '.';
import styles from './ToggleButton.module.scss';

interface CommonProps {
    label?: string;
    selected: boolean;
    size?: 's' | 'm' | 'l';
    align?: 'start' | 'center';
    width?: 'fit' | 'fill';
    weight?: 'default' | 'strong';
    truncate?: boolean;
    prefixIcon?: string;
    suffixIcon?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
    href?: string;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>;

const isExternalLink = (url: string) => /^https?:\/\//.test(url);

const ToggleButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | AnchorProps>(({
    label,
    selected,
    size = 'm',
    align = 'center',
    width = 'fit',
    weight = 'default',
    truncate = false,
    prefixIcon,
    suffixIcon,
    className,
    style,
    children,
    href,
    ...props
}, ref) => {
    const iconSize = size === 'l' ? 'm' : 's';

    const content = (
        <>
            <div className={styles.labelWrapper}>
                {prefixIcon && (
                    <Icon name={prefixIcon} size={iconSize} />
                )}
                {label && (
                    <div className={`font-s font-label ${styles.label} ${weight === 'strong' ? 'font-strong' : 'font-default'} ${truncate ? styles.truncate : ''}`}>
                        {label}
                    </div>
                )}
                {children}
            </div>
            {suffixIcon && (
                <Icon name={suffixIcon} size={iconSize} />
            )}
        </>
    );

    const commonProps = {
        className: `${styles.button} ${selected ? styles.selected : ''} ${styles[size]} ${styles[align]} ${styles[width]} ${className || ''}`,
        style: { ...style, textDecoration: 'none' },
        tabIndex: 0,
    };

    if (href) {
        const isExternal = isExternalLink(href);

        if (isExternal) {
            const anchorProps = props as AnchorProps;
            return (
                <a
                    href={href}
                    ref={ref as React.Ref<HTMLAnchorElement>}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...commonProps}
                    {...anchorProps}>
                    {content}
                </a>
            );
        }

        // Updated Link usage without <a> tag
        return (
            <Link
                href={href}
                ref={ref as React.Ref<HTMLAnchorElement>}
                {...commonProps}
                {...props as AnchorProps}
            >
                {content}
            </Link>
        );
    }

    const buttonProps = props as ButtonProps;
    return (
        <button
            ref={ref as React.Ref<HTMLButtonElement>}
            {...commonProps}
            {...buttonProps}
            aria-pressed={selected}>
            {content}
        </button>
    );
});

ToggleButton.displayName = 'ToggleButton';

export { ToggleButton };