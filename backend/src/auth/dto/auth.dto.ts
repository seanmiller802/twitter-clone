import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';
import { User } from '../../users/entities/user.entity';

@InputType()
export class RegisterInput {
  @Field()
  @MinLength(3)
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}
