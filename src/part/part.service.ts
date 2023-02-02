import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Part, PartDocument } from './schema/part.schema';

@Injectable()
export class PartService {
  constructor(@InjectModel(Part.name) private model: Model<PartDocument>) {}

  create(createPartDto: CreatePartDto) {
    return 'This action adds a new part';
  }

  findAll() {
    return `This action returns all part`;
  }

  findOne(id: number) {
    return `This action returns a #${id} part`;
  }

  update(id: number, updatePartDto: UpdatePartDto) {
    return `This action updates a #${id} part`;
  }

  remove(id: number) {
    return `This action removes a #${id} part`;
  }
}
