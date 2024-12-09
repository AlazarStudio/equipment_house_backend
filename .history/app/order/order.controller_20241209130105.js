const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru', // Используем SMTP сервер Mail.ru
  port: 465, // Порт для SSL
  secure: true, // Используем SSL
  auth: {
    user: 'adamej10@bk.ru', // Ваш email
    pass: 'Gadam-1997', // Ваш пароль (или пароль для приложения, если включена двухфакторная аутентификация)
  },
});