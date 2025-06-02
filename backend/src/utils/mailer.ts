import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendAuctionWinnerEmail = async (to: string, nftName: string, amount: number) => {
  await transporter.sendMail({
    from: `"NFT Auction" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: '🎉 Chúc mừng! Bạn đã thắng đấu giá',
    html: `<p>Bạn vừa chiến thắng NFT <strong>${nftName}</strong> với giá <strong>$${amount}</strong>. NFT đã được chuyển vào ví của bạn.</p>`,
  });
};
