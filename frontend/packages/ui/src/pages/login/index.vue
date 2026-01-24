<!-- 登录页 -->
<template>
  <view class="login-page">
    <view class="login-container">
      <!-- Logo 和标题 -->
      <view class="logo-section">
        <text class="logo">ZenSpace</text>
        <text class="subtitle">智能自习室</text>
      </view>

      <!-- 登录表单 -->
      <view class="form-section">
        <!-- 手机号输入 -->
        <view class="input-group">
          <view class="input-wrapper">
            <text class="input-icon">📱</text>
            <input
              v-model="phone"
              type="number"
              maxlength="11"
              placeholder="请输入手机号"
              class="input"
            />
          </view>
        </view>

        <!-- 验证码输入 -->
        <view class="input-group">
          <view class="input-wrapper">
            <text class="input-icon">🔐</text>
            <input
              v-model="code"
              type="number"
              maxlength="6"
              placeholder="请输入验证码"
              class="input"
            />
            <button
              class="code-btn"
              :disabled="countdown > 0"
              @tap="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>
        </view>

        <!-- 登录按钮 -->
        <button class="login-btn" @tap="handleLogin">
          登录
        </button>

        <!-- 微信登录 -->
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">或</text>
          <view class="divider-line"></view>
        </view>

        <button class="wechat-login-btn" @tap="handleWechatLogin">
          <text class="wechat-icon">💬</text>
          <text>微信一键登录</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@zenspace/core/composables';
import { useToastStore } from '@zenspace/core/stores';
import { UniHttp } from '../../utils/adapters';

const phone = ref('');
const code = ref('');
const countdown = ref(0);

const http = new UniHttp('http://localhost:3000/api/v1');
const { sendSmsCode, smsLogin, wechatLogin } = useAuth({ http });
const toastStore = useToastStore();

// 发送验证码
const sendCode = async () => {
  if (!phone.value) {
    toastStore.showError('请输入手机号');
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    toastStore.showError('手机号格式不正确');
    return;
  }

  try {
    await sendSmsCode(phone.value);
    toastStore.showSuccess('验证码已发送');

    // 倒计时
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (error) {
    toastStore.showError('发送失败');
  }
};

// 验证码登录
const handleLogin = async () => {
  if (!phone.value || !code.value) {
    toastStore.showError('请填写完整信息');
    return;
  }

  try {
    await smsLogin({ phone: phone.value, code: code.value });
    toastStore.showSuccess('登录成功');
    uni.switchTab({ url: '/pages/index/index' });
  } catch (error) {
    toastStore.showError('登录失败');
  }
};

// 微信登录
const handleWechatLogin = async () => {
  try {
    const res = await uni.login({ provider: 'weixin' });
    await wechatLogin({ code: res.code || '' });
    toastStore.showSuccess('登录成功');
    uni.switchTab({ url: '/pages/index/index' });
  } catch (error) {
    toastStore.showError('微信登录失败');
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 120rpx 64rpx;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section {
  text-align: center;
  margin-bottom: 120rpx;
}

.logo {
  font-size: 80rpx;
  font-weight: bold;
  color: white;
  letter-spacing: 0.1em;
}

.subtitle {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 16rpx;
}

.form-section {
  width: 100%;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20rpx);
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.input-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.input {
  flex: 1;
  font-size: 32rpx;
  color: white;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.code-btn {
  padding: 16rpx 32rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 16rpx;
  font-size: 24rpx;
  color: white;
  border: none;
}

.code-btn[disabled] {
  opacity: 0.5;
}

.login-btn {
  width: 100%;
  padding: 32rpx;
  background: white;
  border-radius: 24rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  border: none;
  margin-top: 32rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin: 64rpx 0;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: rgba(255, 255, 255, 0.3);
}

.divider-text {
  padding: 0 32rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.wechat-login-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  font-size: 32rpx;
  color: white;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

.wechat-icon {
  font-size: 40rpx;
}
</style>
