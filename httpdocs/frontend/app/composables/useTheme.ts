import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from '~/utils/helpers';

export type ThemePreference = 'system' | 'light' | 'black';

export const useTheme = () => {
    const preference = useState<ThemePreference>('theme-preference', () => 'system');

    const apply = (value: ThemePreference) => {
        preference.value = value;
        if (!import.meta.client) return;

        if (value === 'system') {
            removeLocalStorageItem('baboons-theme');
            document.documentElement.removeAttribute('data-theme');
            return;
        }

        setLocalStorageItem('baboons-theme', value);
        document.documentElement.setAttribute('data-theme', value);
    };

    const init = () => {
        if (!import.meta.client) return;
        const stored = getLocalStorageItem('baboons-theme');
        apply(stored === 'light' || stored === 'black' ? stored : 'system');
    };

    return { preference, apply, init };
};
