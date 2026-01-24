/**
 * 验证工具函数
 */

/**
 * 验证手机号
 * @param phone 手机号
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证验证码
 * @param code 验证码
 */
export function isValidSmsCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * 验证日期格式 YYYY-MM-DD
 */
export function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * 验证时间格式 HH:mm
 */
export function isValidTimeFormat(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}
