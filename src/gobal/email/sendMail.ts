import * as nodemailer from 'nodemailer';

export async function SendEmail(
  emailClient: string,
  clientName: string,
  content: string,
) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'fce.analytics73@gmail.com',
      pass: 'jcvuknpxdipbrzgy',
    },
  });

  var mailOptions = {
    from: '"FCE" <huynhanhpham734@gmail.com>',
    to: emailClient,
    subject: 'CONG TY TNHH GIẢI PHÁP NGUỒN NHÂN LỰC FCE',
    text: 'That was easy!',
    html: '<p><i>Hi!  ' + clientName + `</i></p><b>${content}</b>`,
  };

  const sendEmail = await transporter.sendMail(mailOptions);

  if (!sendEmail) {
    console.log(`error send mail`);
  }
  console.log('Email sent: ' + sendEmail?.response);
}
