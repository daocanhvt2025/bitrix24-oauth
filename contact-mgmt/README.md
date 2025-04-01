Chạy ứng dụng
Chạy backend:
bash

Collapse

Wrap

Copy
cd bitrix24-oauth
npm start
Dùng ngrok:
bash

Collapse

Wrap

Copy
ngrok http 3000
Cập nhật API_URL trong scripts.js thành URL từ ngrok (ví dụ: https://abcd1234.ngrok.io/api/call).
Mở giao diện:
Copy các file index.html, styles.css, scripts.js vào thư mục tĩnh (hoặc dùng server đơn giản như live-server).
Truy cập http://localhost:8080 (hoặc port tùy chọn).
