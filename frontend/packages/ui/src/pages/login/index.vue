<!-- ZenSpace 登录页 -->
<template>
  <view class="flex flex-col h-screen w-full bg-white relative overflow-hidden">
    <!-- 背景装饰 -->
    <view class="absolute -top-20 -right-20 w-80 h-80 bg-gray-100 rounded-full blur-3xl opacity-50"></view>
    <view class="absolute top-40 -left-20 w-60 h-60 bg-gray-50 rounded-full blur-3xl opacity-60"></view>

    <view class="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
      <!-- Brand -->
      <view class="mb-12 flex flex-col items-center animate-fade-in">
        <view class="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 shadow-2xl shadow-black/20 transform rotate-3">
          <text class="material-symbols-outlined text-[40px]">spa</text>
        </view>
        <text class="font-serif text-3xl font-medium text-primary tracking-tight mb-2">ZenSpace</text>
        <text class="text-xs text-secondary tracking-[0.2em] uppercase">Find your flow</text>
      </view>

      <!-- Input Form -->
      <view class="w-full max-w-xs flex flex-col gap-4 animate-fade-in" style="animation-delay: 0.2s">
        <!-- 手机号输入 -->
        <view class="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-transparent transition-all duration-300">
          <text class="material-symbols-outlined text-gray-400">smartphone</text>
          <input
            v-model="phone"
            type="tel"
            placeholder="Mobile Number"
            class="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 text-primary"
          />
        </view>

        <!-- 验证码输入 -->
        <view class="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-transparent transition-all duration-300">
          <text class="material-symbols-outlined text-gray-400">lock</text>
          <input
            v-model="code"
            type="password"
            placeholder="Verification Code"
            class="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400 text-primary"
          />
          <button
            class="text-[10px] font-medium text-primary whitespace-nowrap px-2 py-1 rounded bg-gray-200"
            @tap="sendCode"
          >
            {{ countdown > 0 ? `${countdown}s` : 'Get Code' }}
          </button>
        </view>
      </view>
    </view>

    <!-- Action Area -->
    <view class="p-8 pb-12 relative z-10 animate-fade-in" style="animation-delay: 0.4s">
      <view
        class="w-full bg-primary text-white h-14 rounded-2xl font-medium tracking-wide shadow-xl shadow-black/10 flex items-center justify-center gap-2"
        :class="{ 'opacity-70': isLoading }"
        @tap="handleLogin"
      >
        <text v-if="!isLoading">Enter Space</text>
        <text v-if="!isLoading" class="material-symbols-outlined text-[18px]">arrow_forward</text>
        <text v-else class="material-symbols-outlined animate-spin text-[20px]">progress_activity</text>
      </view>

      <text class="text-[10px] text-center text-gray-400 mt-6">
        By entering, you agree to our <text class="underline">Terms</text> & <text class="underline">Privacy Policy</text>
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@zenspace/core/composables';
import { useUserStore } from '@zenspace/core/stores';
import { useToastStore } from '@zenspace/core/stores';
import { UniHttp } from '../../utils/adapters';

const phone = ref('');
const code = ref('');
const isLoading = ref(false);
const countdown = ref(0);

const http = new UniHttp('http://localhost:3000/api/v1');
const { sendSmsCode, smsLogin } = useAuth({ http });
const userStore = useUserStore();
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

// 处理登录
const handleLogin = async () => {
  if (!phone.value || !code.value) {
    toastStore.showError('请填写完整信息');
    return;
  }

  isLoading.value = true;

  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 更新用户状态
    userStore.setUser({
      id: 'user-1',
      phone: phone.value,
      nickname: '用户',
      avatar: 'person',
      level: 'NORMAL',
      points: 100,
      isAuthenticated: true
    });

    toastStore.showSuccess('登录成功');
    uni.switchTab({ url: '/pages/index/index' });
  } catch (error) {
    toastStore.showError('登录失败');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
// Material Icons 样式
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24rpx;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
