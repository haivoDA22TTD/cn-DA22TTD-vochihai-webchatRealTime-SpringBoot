# Tên đề tài: Xây dựng web chat real-time với Angular và Spring Boot
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.io/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat&logo=sass&logoColor=white)](https://sass-lang.com/)<br>
  **Giáo viên hướng dẫn:** Ths. Ngô Thanh Huy<br>
  **Thời gian thực hiện:** Từ ngày 03/11/2025 đến 28/12/2025<br>
  **Sinh viên thực hiện:** Võ Chí Hải<br>
  **MSSV:** 110122068<br>
  **Email:** 1110122068@st.tvu.edu.vn<br>
 
## Mô tả hệ thống
 Dự án **web Chat Realtime** là một hệ thống trò chuyện trực tuyến được xây dựng bằng **Angular**, **SCSS** cho giao diện hiện đại và **Spring Boot**, **MySQL** cho xử lý và lưu trữ dữ liệu phía server. Ứng dụng cho phép chat 1-1, chat nhóm, tạo nhóm mới, chuyển quyền trưởng nhóm, hỗ trợ dark mode giúp trải nghiệm thân thiện với người dùng. Người dùng có thể upload avatar cá nhân, xem danh sách người dùng online, các cuộc trò chuyện gần đây, đồng thời mỗi tin nhắn đều hiển thị thời gian gửi và trạng thái đã xem. Hệ thống mang đến trải nghiệm trò chuyện mượt mà, realtime và bảo mật, đáp ứng nhu cầu giao tiếp nhanh chóng, tiện lợi trong môi trường trực tuyến.
## Sơ đồ kiến trúc hệ thống
<p align="center">
 <img src="../progress-report/so-do-kien-truc-he-thong.drawio.png" />
</p>

## Cơ sở dữ liệu
<p align="center">
  <img width="775" height="733" alt="image" src="https://github.com/user-attachments/assets/5eb35b0b-0783-4725-adc4-ff64f8d6637e" />
</p>


## ✨ Tính năng

### 🔐 Quản lý người dùng
- Đăng ký và đăng nhập người dùng
- Cập nhật thông tin cá nhân
- Upload và quản lý avatar
- Hiển thị trạng thái online/offline
- Tìm kiếm người dùng

### 💬 Nhắn tin
- Gửi tin nhắn realtime qua WebSocket
- Hỗ trợ nhiều loại tin nhắn (text, image, file)
- Upload và gửi file đính kèm
- Hiển thị trạng thái đã đọc/chưa đọc
- Rate limiting để tránh spam (Redis)

### 🏠 Phòng chat
- Tạo phòng chat 1-1 và nhóm
- Quản lý thành viên phòng chat
- Xem danh sách phòng chat
- Tìm kiếm và lọc phòng chat
- Tự động tạo room key duy nhất

### ⚡ Hiệu năng
- Cache dữ liệu với Redis
- WebSocket cho giao tiếp realtime
- Rate limiting với Redis
- Tối ưu truy vấn database

---

## 🛠 Công nghệ sử dụng

### Backend
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.12-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

- **Spring Boot 3.4.12** - Framework Java
- **Spring WebSocket** - Giao tiếp realtime
- **Spring Data JPA** - ORM
- **MySQL 8.0** - Database
- **Redis 7** - Cache & Rate limiting
- **Lombok** - Giảm boilerplate code
- **Swagger/OpenAPI** - API documentation
- **Maven** - Build tool

### Frontend
![Angular](https://img.shields.io/badge/Angular-16-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PrimeNG](https://img.shields.io/badge/PrimeNG-16-DD0031?style=for-the-badge&logo=prime&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=for-the-badge&logo=reactivex&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

- **Angular 16** - Framework TypeScript
- **PrimeNG** - UI Component library
- **STOMP.js** - WebSocket client
- **RxJS** - Reactive programming
- **SCSS** - Styling

### DevOps
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

- **Docker & Docker Compose** - Containerization
- **Nginx** - Web server cho frontend
- **RedisInsight** - Redis monitoring tool

---

## 📦 Yêu cầu hệ thống

### Chạy với Docker
![Docker](https://img.shields.io/badge/Docker-20.10+-2496ED?style=flat-square&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2.0+-2496ED?style=flat-square&logo=docker&logoColor=white)

- Docker Desktop 20.10+
- Docker Compose 2.0+
- 4GB RAM trở lên

### Chạy Local
![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-3.8+-C71A36?style=flat-square&logo=apache-maven&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)

- **Java 17** hoặc cao hơn
- **Node.js 16+** và npm
- **Maven 3.8+**
- **MySQL 8.0**
- **Redis 7**

---

## 🚀 Hướng dẫn cài đặt

### 1. Chạy với Docker (Khuyến nghị)

#### Bước 1: Clone dự án
```bash
git clone <repository-url>
cd chat-app
```

#### Bước 2: Chạy toàn bộ ứng dụng
```bash
docker-compose up -d
```

Lệnh này sẽ khởi động:
- MySQL (port 3306)
- Redis (port 6379)
- RedisInsight (port 8001)
- Backend Spring Boot (port 8080)
- Frontend Angular (port 80)

#### Bước 3: Kiểm tra trạng thái
```bash
docker-compose ps
```

#### Bước 4: Truy cập ứng dụng
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **RedisInsight**: http://localhost:8001
- **Redis**: http://localhost:6379

#### Dừng ứng dụng
```bash
docker-compose down
```

#### Xóa toàn bộ dữ liệu (bao gồm volumes)
```bash
docker-compose down -v
```

---

### 2. Chạy Local

#### A. Chuẩn bị Database

##### MySQL
```bash
# Khởi động MySQL
mysql -u root -p

# Tạo database và user
CREATE DATABASE chatdb;
CREATE USER 'chatuser'@'localhost' IDENTIFIED BY 'chatpass123';
GRANT ALL PRIVILEGES ON chatdb.* TO 'chatuser'@'localhost';
FLUSH PRIVILEGES;
```

##### Redis
```bash
# Cài đặt và khởi động Redis
# Windows: Tải từ https://github.com/microsoftarchive/redis/releases
# Linux/Mac: 
sudo apt-get install redis-server  # Ubuntu
brew install redis                  # macOS

# Khởi động Redis
redis-server
```

#### B. Chạy Backend

```bash
cd backend

# Cấu hình application.properties nếu cần
# File: src/main/resources/application.properties

# Build và chạy
./mvnw clean install
./mvnw spring-boot:run

# Hoặc trên Windows
mvnw.cmd clean install
mvnw.cmd spring-boot:run
```

Backend sẽ chạy tại: http://localhost:8080

#### C. Chạy Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

Frontend sẽ chạy tại: http://localhost:4200

---

## 📁 Cấu trúc dự án

```
chat-app/
├── backend/                      # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/org/chatapp/backend/
│   │   │   │   ├── config/      # Cấu hình (CORS, WebSocket, Redis, Swagger)
│   │   │   │   ├── user/        # Module quản lý người dùng
│   │   │   │   ├── messageroom/ # Module quản lý phòng chat
│   │   │   │   ├── messageroommember/ # Module thành viên phòng
│   │   │   │   ├── messagecontent/    # Module tin nhắn
│   │   │   │   └── utils/       # Utilities (FileUtils)
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── uploads/                 # Thư mục lưu file upload
│   │   ├── avatars/            # Avatar người dùng
│   │   └── messages/           # File đính kèm tin nhắn
│   ├── Dockerfile
│   ├── docker-compose.yml      # Redis local
│   └── pom.xml
│
├── frontend/                    # Angular Frontend
│   ├── src/
│   │   ├── app/                # Components, Services, Models
│   │   ├── assets/             # Static files
│   │   ├── environments/       # Environment configs
│   │   └── styles.scss
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml          # Docker Compose cho toàn bộ stack
```

---

## 📚 API Documentation

Sau khi chạy backend, truy cập Swagger UI để xem chi tiết API:

**URL**: http://localhost:8080/swagger-ui.html

### Các API chính:

#### User APIs
- `POST /api/users` - Tạo người dùng mới
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/{id}` - Lấy thông tin người dùng
- `PUT /api/users/{id}` - Cập nhật thông tin
- `POST /api/users/{id}/avatar` - Upload avatar

#### Message Room APIs
- `POST /api/rooms` - Tạo phòng chat
- `GET /api/rooms` - Lấy danh sách phòng
- `GET /api/rooms/{id}` - Chi tiết phòng chat

#### Message APIs
- `POST /api/messages` - Gửi tin nhắn
- `GET /api/messages/room/{roomId}` - Lấy tin nhắn theo phòng
- `POST /api/messages/upload` - Upload file

#### WebSocket Endpoints
- `/ws` - WebSocket connection
- `/app/chat.send` - Gửi tin nhắn
- `/topic/room/{roomId}` - Subscribe tin nhắn phòng

---

## 👨‍💻 Tác giả

**Võ Chí Hải (haivoDev)**

[![GitHub](https://img.shields.io/badge/GitHub-haivoDA22TTD-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/haivoDA22TTD/cn-DA22TTD-vochihai-chat-app-real-time-Spring-Boot)
[![Email](https://img.shields.io/badge/Email-110122068@st.tvu.edu.vn-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:110122068@st.tvu.edu.vn)

- GitHub: [haivoDA22TTD](https://github.com/haivoDA22TTD/cn-DA22TTD-vochihai-chat-app-real-time-Spring-Boot)
- Email: 110122068@st.tvu.edu.vn

---

## 📝 License

Dự án này được phát hành dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---

## 🐛 Báo lỗi

Nếu bạn gặp lỗi, vui lòng tạo issue tại [GitHub Issues](https://github.com/haivoDA22TTD/cn-DA22TTD-vochihai-chat-app-real-time-Spring-Boot/issues)

---

## ⭐ Support

Nếu dự án hữu ích, hãy cho một ⭐ trên GitHub!

