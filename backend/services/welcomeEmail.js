const { sendEmail } = require("./emailService");

const sendWelcomeEmail = async (user) => {
  return await sendEmail({
    to: user.email,
    subject: "Selamat Datang di BookLap 🎉",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Selamat Datang di BookLap</h1>

        <p>Halo <b>${user.nama}</b>,</p>

        <p>
          Akun Anda berhasil dibuat dan sudah aktif.
        </p>

        <p>
          Sekarang Anda dapat melakukan booking lapangan
          futsal dan mini soccer melalui BookLap.
        </p>

        <hr>

        <p>
          Email : ${user.email}
        </p>

        <p>
          Status : Aktif
        </p>

        <br>

        <p>
          Terima kasih telah bergabung bersama BookLap.
        </p>
      </div>
    `,
  });
};

module.exports = {
  sendWelcomeEmail,
};