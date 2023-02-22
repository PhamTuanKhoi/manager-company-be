import { forwardRef, Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Rule, RuleSchema } from './schema/rule.schema';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    forwardRef(() => ProjectModule),
    MongooseModule.forFeature([{ name: Rule.name, schema: RuleSchema }]),
  ],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}
