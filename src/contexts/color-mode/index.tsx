import { RefineThemes } from "@refinedev/antd";
import { ConfigProvider, theme } from "antd";
import {
  type PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";

type ColorModeContextType = {
  mode: string;
  setMode: (mode: string) => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

// Custom pastel theme with modern fonts
const customTheme = {
  token: {
    // Typography
    fontFamily: 'var(--font-body)',
    fontFamilyCode: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    
    // DikaFood brand colors (preserving dark theme)
    colorPrimary: '#AACC00', // DikaFood lime green
    colorSuccess: '#2D865D', // DikaFood success green
    colorWarning: '#F8B84A', // DikaFood warning yellow
    colorError: '#E84646', // DikaFood error red
    colorInfo: '#3D88CF', // DikaFood info blue
    
    // Secondary colors
    colorLink: '#AACC00',
    colorLinkHover: '#80AF2C',
    colorLinkActive: '#0A5C26',
    
    // Background colors (keeping dark theme)
    colorBgBase: '#141414',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#262626',
    colorBgLayout: '#0f0f0f',
    
    // Border colors
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',
    
    // Text colors
    colorText: '#ffffff',
    colorTextSecondary: '#bfbfbf',
    colorTextTertiary: '#8c8c8c',
    colorTextQuaternary: '#595959',
    
    // Component specific
    colorFillAlter: '#262626',
    colorFillContent: '#1f1f1f',
    colorFillContentHover: '#262626',
    colorFillSecondary: '#1a1a1a',
    
    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    // Shadows with DikaFood colors
    boxShadow: '0 2px 8px rgba(170, 204, 0, 0.1)',
    boxShadowSecondary: '0 4px 16px rgba(170, 204, 0, 0.08)',
  },
  components: {
    // Layout components
    Layout: {
      headerBg: '#1f1f1f',
      siderBg: '#141414',
      bodyBg: '#141414',
      headerHeight: 0, // Hide header
    },
    
    // Menu styling
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(170, 204, 0, 0.15)',
      itemHoverBg: 'rgba(170, 204, 0, 0.08)',
      itemActiveBg: 'rgba(170, 204, 0, 0.12)',
      itemSelectedColor: '#AACC00',
      itemColor: '#bfbfbf',
      iconSize: 16,
      fontSize: 14,
      fontFamily: 'var(--font-body)',
    },
    
    // Button styling
    Button: {
      fontFamily: 'var(--font-body)',
      borderRadius: 8,
      primaryShadow: '0 2px 8px rgba(170, 204, 0, 0.2)',
    },
    
    // Card styling
    Card: {
      headerBg: '#1f1f1f',
      actionsBg: '#1a1a1a',
      fontFamily: 'var(--font-body)',
    },
    
    // Table styling
    Table: {
      headerBg: '#1f1f1f',
      headerColor: '#ffffff',
      rowHoverBg: 'rgba(170, 204, 0, 0.05)',
      fontFamily: 'var(--font-body)',
    },
    
    // Typography
    Typography: {
      titleMarginTop: 0,
      titleMarginBottom: 16,
      fontFamilyCode: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    
    // Form components
    Input: {
      fontFamily: 'var(--font-body)',
      borderRadius: 6,
    },
    
    Select: {
      fontFamily: 'var(--font-body)',
      borderRadius: 6,
    },
    
    // Notification
    Notification: {
      fontFamily: 'var(--font-body)',
    },
    
    // Message
    Message: {
      fontFamily: 'var(--font-body)',
    },
  },
};

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const colorModeFromLocalStorage = localStorage.getItem("colorMode");
  const isSystemPreferenceDark = window?.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const systemPreference = isSystemPreferenceDark ? "dark" : "light";
  const [mode, setMode] = useState(
    colorModeFromLocalStorage || systemPreference
  );

  useEffect(() => {
    window.localStorage.setItem("colorMode", mode);
  }, [mode]);

  const setColorMode = () => {
    if (mode === "light") {
      setMode("dark");
    } else {
      setMode("light");
    }
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ConfigProvider
        theme={{
          ...customTheme,
          algorithm: mode === "light" ? defaultAlgorithm : darkAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
