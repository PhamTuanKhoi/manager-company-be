import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { PartService } from 'src/part/part.service';
import { UserService } from 'src/user/user.service';
import { CreateJoinPartDto } from './dto/create-join-part.dto';
import { UpdateJoinPartDto } from './dto/update-join-part.dto';
import { formatTime, timeCustom } from './format/formattime';
import { JoinPart, JoinPartDocument } from './schema/join-part.schema';
const ZKLib = require('zklib');
const excelJS = require('exceljs');

@Injectable()
export class JoinPartService {
  private readonly logger = new Logger(JoinPartService.name);

  constructor(
    @InjectModel(JoinPart.name) private model: Model<JoinPartDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => PartService))
    private partService: PartService,
  ) {}

  async create(createJoinPartDto: CreateJoinPartDto) {
    try {
      // check input data
      await Promise.all([
        this.userService.isModelExist(createJoinPartDto.joinor),
        this.partService.isModelExit(createJoinPartDto.part),
      ]);

      const created = await this.model.create(createJoinPartDto);

      this.logger.log(`created a new join-part by id#${created?._id}`);

      return created;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async findAll(res: Response) {
    const data = await this.model.aggregate([
      {
        $group: {
          _id: {
            id: '$id',
            date: '$date',
            sort: '$sort',
          },
          timein: {
            $push: '$hour.timein',
          },
          timeout: {
            $push: '$hour.timeout',
          },
        },
      },
      {
        $unwind: {
          path: '$timein',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$timeout',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id.id',
          date: '$_id.date',
          sort: '$_id.sort',
          timein: '$timein',
          timeout: '$timeout',
          subtract: {
            $cond: {
              if: {
                $gte: [{ $subtract: ['$timeout', '$timein'] }, 18000],
              },
              then: {
                $subtract: [{ $subtract: ['$timeout', '$timein'] }, 5400],
              },
              else: { $subtract: ['$timeout', '$timein'] },
            },
          },
        },
      },
      {
        $project: {
          id: '$id',
          date: '$date',
          sort: '$sort',
          timein: '$timein',
          timeout: '$timeout',
          subtract: '$subtract',
          result: {
            $cond: {
              if: {
                $and: [
                  {
                    $or: [
                      { $eq: ['$date', '4/2/2023'] },
                      { $eq: ['$date', '11/2/2023'] },
                      { $eq: ['$date', '18/2/2023'] },
                      { $eq: ['$date', '25/2/2023'] },
                    ],
                  },
                ],
              },
              then: {
                $cond: {
                  if: { $gte: ['$subtract', 19800] },
                  then: 1,
                  else: { $divide: ['$subtract', 19800] },
                },
              },
              else: {
                $cond: {
                  if: { $gte: ['$subtract', 28800] },
                  then: 1,
                  else: { $divide: ['$subtract', 28800] },
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          sort: 1,
        },
      },
    ]);

    const workbook = new excelJS.Workbook(); // Create a new workbook
    const worksheet = workbook.addWorksheet('My Users'); // New Worksheet
    const path = './files'; // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
      { header: 'S no.', key: 's_no', width: 10 },
      { header: 'id', key: 'id', width: 20 },
      { header: 'Giờ vào', key: 'timein', width: 10 },
      { header: 'Giờ ra', key: 'timeout', width: 10 },
      { header: 'Ngày', key: 'date', width: 20 },
      { header: 'Thời gian làm việc', key: 'subtract', width: 10 },
      { header: 'Công làm', key: 'result', width: 10 },
    ];

    // Looping through User data
    let counter = 1;
    data
      .filter((i) => i.id === 31)
      .forEach((user) => {
        user.s_no = counter;
        user.timein = timeCustom(user.timein);
        user.timeout = timeCustom(user.timeout);
        user.date = user.date;
        user.id = user.id === 31 ? 'Phạm Tuấn Khôi' : '';
        user.subtract = timeCustom(user.subtract);
        worksheet.addRow(user); // Add data in worksheet
        counter++;
      });

    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    try {
      await workbook.xlsx
        .writeFile('phamtuankhoi.xlsx')
        .then(() => {
          console.log('File saved!');
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      console.log('error', err);
    }

    return res.status(200).json(data.filter((i) => i.id === 26));
    // const ZK = new ZKLib({
    //   ip: '192.168.1.201',
    //   port: 4370,
    //   inport: 5200,
    //   timeout: 5000,
    // });
    // ZK.connect(function (err) {
    //   if (err) throw err;
    //   // read the time info from th device
    //   ZK.getAttendance(function (err, time) {
    //     if (err) throw err;
    //     let array = [];
    //     time.map((item) => {
    //       if (
    //         new Date(item.timestamp).getMonth() + 1 === 2 &&
    //         new Date(item.timestamp).getFullYear() === 2023
    //       ) {
    //         // console.log(moment(item.timestamp).format("DD/MM/YYYY"));
    //         array.push({
    //           id: item.id,
    //           sort: new Date(item.timestamp).getDate(),
    //           date: `${new Date(item.timestamp).getDate()}/${
    //             new Date(item.timestamp).getMonth() + 1
    //           }/${new Date(item.timestamp).getFullYear()}`,
    //           hour:
    //             formatTime(item.timestamp) <= 28800
    //               ? // true
    //                 { timein: 28800 }
    //               : // late
    //               formatTime(item.timestamp) > 28800 &&
    //                 formatTime(item.timestamp) < 39600
    //               ? { timein: formatTime(item.timestamp) }
    //               : formatTime(item.timestamp) >= 62100
    //               ? { timeout: 63000 }
    //               : { timeout: formatTime(item.timestamp) },
    //         });
    //       }
    //     });
    //     res.status(200).json(array);
    //     // console.log(array);
    //   });
    // });
  }

  async testSave(payload) {
    // const api = payload.map(item);
    const data = await this.model.insertMany(payload);
    console.log(data.length);

    return data.length;
  }

  findthanks(res: Response) {
    const ZK = new ZKLib({
      ip: '192.168.1.201',
      port: 4370,
      inport: 5200,
      timeout: 5000,
    });

    ZK.connect(function (err) {
      if (err) throw err;

      // read the time info from th device
      ZK.getUser(function (err, time) {
        if (err) throw err;
        res.status(200).json(time);
      });
    });
  }

  findOne(id: string) {
    return this.model.findById(id).lean();
  }

  update(id: number, updateJoinPartDto: UpdateJoinPartDto) {
    return `This action updates a #${id} joinPart`;
  }

  async remove(id: string) {
    try {
      await this.isModelExist(id);

      const removed = await this.model.findByIdAndDelete(id);

      this.logger.log(`removed a join-part by id#${removed?._id}`);

      return removed;
    } catch (error) {
      this.logger.error(error?.message, error.stack);
      throw new BadRequestException(error?.message);
    }
  }

  async isModelExist(id, opition = false, mess = '') {
    if (!id && opition) return;
    const message = mess || 'join-part not found';
    const isExist = await this.findOne(id);
    if (!isExist) throw new Error(message);
    return isExist;
  }
}
