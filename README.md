# Hướng dẫn

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Hướng dẫn](#hướng-dẫn)
  - [Yêu cầu](#yêu-cầu)
  - [Cấu hình](#cấu-hình)
  - [Sử dụng](#sử-dụng)
  - [Lưu ý](#lưu-ý)
  - [Vấn đề với Puppeteer](#vấn-đề-với-puppeteer)
  - [Miễn trừ trách nhiệm](#miễn-trừ-trách-nhiệm)

<!-- /code_chunk_output -->

Công cụ này kiểm tra điểm trên MyBK định kỳ, và gửi thông báo khi có điểm mới (bằng Notification của hệ điều hành hoặc thông qua Gmail).

## Yêu cầu

1. NodeJS
2. npm hoặc yarn

## Cấu hình

Tạo file `config.js` trong thư mục gốc theo mẫu của `config.js.example`:

```javascript
module.exports = {
  username: "1600000", // tên đăng nhập MyBK
  password: "password", // mật khẩu MyBK
  semester: "_20191", // học kỳ 191
  interval: 5, // thời gian nghỉ giữa hai lần kiểm tra (đơn vị: phút)
  notify: true, // gửi thông báo local
  useEmail: true, // gửi email thông báo khi có điểm
  email: "example@gmail.com", // email
  emailPassword: "emailpassword" // mật khẩu email
};
```

Trong đó:

- `username`: tên đăng nhập MyBK (MSSV).
- `password`: mật khẩu đăng nhập MyBK **(mình không đánh cắp password, có thể kiểm tra trong code)**.
- `semester`: học kỳ cần lấy điểm.
Format: `_20<học kỳ>` - ví dụ học kỳ 191 là `_20191`, học kỳ 192 là `_20192`.
- `interval`: thời gian nghỉ giữa hai lần kiểm tra điểm (đơn vị: phút). **Không nên đặt quá thấp. Nên đặt từ 1 phút trở lên.**
- `notify`: gửi thông báo đến mục Notifications của máy tính (hoạt động được trên cả Windows, Linux và Mac) khi có điểm mới .
- `useEmail`: gửi email thông báo khi có điểm mới. Chỉ sử dụng được cho Gmail.
**Lưu ý:** Cần bật `Allow less secure apps` tại [đây](https://myaccount.google.com/lesssecureapps) và bấm `Continue` ở [đây](https://accounts.google.com/b/0/displayunlockcaptcha).
- `email`: tài khoản Gmail.
- `emailPassword`: mật khẩu Gmail **(mình không đánh cắp password, có thể kiểm tra trong code)**.

## Sử dụng

1. Clone repo về :
`git clone https://github.com/huytc/grade-checker.git`
hoặc
`git clone git@github.com:huytc/grade-checker.git`

2. Vào thư mục gốc: `cd grade-checker`.

3. Chạy `yarn` hoặc `npm install` để cài đặt các dependencies.

4. Tạo file `config.js` theo hướng dẫn ở phần [Cấu hình](#cấu-hình).

5. Chạy chương trình:
`node index.js`

## Lưu ý

- Công cụ chỉ kiểm tra điểm khi đang chạy, nếu tắt máy thì công cụ cũng tắt.
- Nếu có VPS có thể deploy công cụ lên để chạy 24/24 và thiết lập thông báo bằng Gmail.

## Vấn đề với Puppeteer

Nếu chạy trên Linux bị lỗi `error while loading shared libraries: libX11-xcb.so.1: cannot open shared object file: No such file or directory` thì cài đặt các packages còn thiếu bằng lệnh này:

```sh
sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## Miễn trừ trách nhiệm

Code hoàn toàn an toàn, không đánh cắp bất cứ dữ liệu nào. Tuy nhiên, mình không chịu trách nhiệm cho bất kỳ sự cố ngoài ý muốn nào. **Use it at your own risk.**
