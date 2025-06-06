'use client';

import { motion } from 'framer-motion';

interface FadeInWhenVisibleProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    yOffset?: number;
    visibilityThreshold?: number;
}

export default function FadeInWhenVisible({ children, className, delay = 0.0, duration = 0.5, yOffset = 20, visibilityThreshold = 0.0 }: FadeInWhenVisibleProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: visibilityThreshold }}
            transition={{
                duration: duration,
                delay: delay,
                ease: 'easeInOut'
            }}
        >
            {children}
        </motion.div>
    );
}
