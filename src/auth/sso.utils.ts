import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ModelService } from '../model/model.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';

/**
 * Utility decorator to get current user data who made the current request.
 * Assumes that the user is already authenticated.
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request: Express.Request = context.switchToHttp().getRequest();
    if (data) return request.user[data];
    return request.user;
  },
);

/**
 * Utility class that acts as a middleware / decorator.
 * Ensures that the user is authenticated when accessing an endpoint.
 * Otherwise, return 401 unauthorized status code.
 */
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}

/**
 * Utility class to provide secure authentication using jwt token.
 * Returns the user's data as object with removed password for security purpose.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private model: ModelService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: '123456', // setup as secret key
    });
  }

  async validate(payload: { sub: number; email: string }): Promise<User> {
    const user = await this.model.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    // in a rare case caused weird 500 error, probably when user is deleted after running test case,
    // but token still not expired (my guess), to be safe put try catch below here
    try {
      delete user.password;
    } catch (e) {}
    return user;
  }
}
