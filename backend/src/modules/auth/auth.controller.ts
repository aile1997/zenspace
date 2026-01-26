import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendCodeDto } from './dto/send-code.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { AuthResponse, AuthUserInfo } from './types/auth.types';

// 用户类型，用于参数类型注解
type UserType = AuthUserInfo;

/**
 * 认证控制器
 *
 * 处理所有认证相关的 API 端点
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 发送验证码
   *
   * POST /api/auth/send-code
   *
   * 发送 6 位数字验证码到用户手机
   * 开发环境下会在控制台打印验证码
   */
  @Post('send-code')
  @HttpCode(200)
  async sendCode(@Body() dto: SendCodeDto): Promise<{ message: string }> {
    return this.authService.sendCode(dto.phone);
  }

  /**
   * 手机验证码登录
   *
   * POST /api/auth/login
   *
   * 使用手机号和验证码登录
   * 如果用户不存在则自动注册
   */
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  /**
   * 用户登出
   *
   * POST /api/auth/logout
   *
   * 登出用户，删除刷新令牌
   * 需要认证
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@CurrentUser() user: UserType): Promise<{ message: string }> {
    return this.authService.logout(user.id);
  }

  /**
   * 刷新访问令牌
   *
   * POST /api/auth/refresh
   *
   * 使用刷新令牌获取新的访问令牌
   */
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Body() dto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  /**
   * 获取用户信息
   *
   * GET /api/auth/profile
   *
   * 获取当前登录用户的信息
   * 需要认证
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: UserType) {
    return this.authService.getProfile(user.id);
  }

  /**
   * 更新用户信息
   *
   * PUT /api/auth/update-profile
   *
   * 更新当前登录用户的昵称或头像
   * 需要认证
   */
  @Put('update-profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: UserType,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }
}
