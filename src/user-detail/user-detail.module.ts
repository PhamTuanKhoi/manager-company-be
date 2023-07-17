import { Module } from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { UserDetailController } from './user-detail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDetail, UserDetailSchema } from './schema/user-detail.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDetail.name, schema: UserDetailSchema },
    ]),
  ],
  controllers: [UserDetailController],
  providers: [UserDetailService],
  exports: [UserDetailService],
})
export class UserDetailModule {}
