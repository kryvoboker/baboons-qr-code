export type ThemePreference = 'system' | 'light' | 'black';

export const useTheme = () => {
    const preference = useState<ThemePreference>('theme-preference', () => 'system');

    const apply = (value: ThemePreference) => {
        preference.value = value;
        if (!import.meta.client) return;

        if (value === 'system') {
            localStorage.removeItem('baboons-theme');
            document.documentElement.removeAttribute('data-theme');
            return;
        }

        localStorage.setItem('baboons-theme', value);
        document.documentElement.setAttribute('data-theme', value);
    };

    const init = () => {
        if (!import.meta.client) return;
        const stored = localStorage.getItem('baboons-theme');
        apply(stored === 'light' || stored === 'black' ? stored : 'system');
    };

    return { preference, apply, init };
};
