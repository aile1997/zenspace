/**
 * UnoCSS 配置
 *
 * 使用 @uni-helper/unocss-preset-uni 专为 UniApp 打造的 preset
 * 编译期生成 CSS，支持 UniApp 全端（H5、小程序、App）
 */
import { defineConfig } from 'unocss'
import { presetUni } from '@uni-helper/unocss-preset-uni'

export default defineConfig({
  presets: [
    presetUni(), // 专为 UniApp 优化的 preset
  ],

  // 自定义快捷方式（常用组合）
  shortcuts: {
    // Flex 布局
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-column': 'flex flex-col items-center',
    'flex-row': 'flex flex-row items-center',
  },

  // 主题配置
  theme: {
    // iOS 26.2 高级感配色
    colors: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      accent: '#8E8E93',
      success: '#22c55e',
      warning: '#f97316',
      error: '#ef4444',
      info: '#3b82f6',
      'ios-bg': '#FFFFFF',
      'ios-gray': '#F5F5F7',
      'grid-line': 'rgba(0, 0, 0, 0.03)',
    },

    // 字体家族
    fontFamily: {
      serif: ['"Noto Serif SC"', 'serif'],
      display: ['"Manrope"', 'sans-serif'],
      sans: ['"Inter"', 'sans-serif'],
    },

    // iOS 超椭圆感圆角
    borderRadius: {
      '12': '12px',
      '24': '24px',
    },

    // 精细化阴影系统（严禁硬阴影）
    boxShadow: {
      'soft': '0 4px 24px -1px rgba(0, 0, 0, 0.06)',
      'float': '0 10px 40px -10px rgba(0, 0, 0, 0.12)',
      'glass': '0 4px 20px rgba(0, 0, 0, 0.03)',
      'elevation-1': '0 2px 8px rgba(0, 0, 0, 0.04)',
      'elevation-2': '0 8px 16px rgba(0, 0, 0, 0.06)',
    },

    // 动画
    animation: {
      'fade-in': 'fadeIn 0.5s ease-out forwards',
      'scale-up': 'scaleUp 0.5s ease-out forwards',
      'ping': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      'spin': 'spin 1s linear infinite',
      'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },

    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      scaleUp: {
        '0%': { transform: 'scale(0.8)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      ping: {
        '75%, 100%': { transform: 'scale(2)', opacity: '0' },
      },
      spin: {
        'to': { transform: 'rotate(360deg)' },
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },
    },
  },

  // 内容扫描路径
  content: {
    filesystem: ['./src/**/*.{html,vue,js,ts,jsx,tsx}'],
  },

  // UnoCSS 安全列表（识别动态类名）
  safelist: [
    'material-icons',
    'material-symbols-outlined',
  ],
})
