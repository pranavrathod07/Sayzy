import colors from '@/constants/colors';
import { useSettings } from '@/context/SettingsContext';

export type AppColors = typeof colors.light & { radius: number };

/**
 * Returns the active design tokens based on the user's chosen theme mode
 * (light / dark / high-contrast) rather than only the system scheme, since
 * this app exposes an explicit accessibility toggle in Settings.
 */
export function useAppColors(): AppColors {
  const { settings } = useSettings();
  const palette =
    settings.themeMode === 'dark'
      ? colors.dark
      : settings.themeMode === 'highContrast'
        ? colors.highContrast
        : colors.light;
  return { ...palette, radius: colors.radius };
}
