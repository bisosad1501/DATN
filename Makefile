.PHONY: help setup start stop restart logs clean status health

help: ## Hiển thị danh sách lệnh
	@echo "Các lệnh có sẵn:"
	@echo "  make setup   - Thiết lập ban đầu (tạo .env file)"
	@echo "  make start   - Khởi động tất cả services"
	@echo "  make stop    - Dừng tất cả services"
	@echo "  make restart - Khởi động lại tất cả services"
	@echo "  make logs    - Xem logs của tất cả services"
	@echo "  make health  - Kiểm tra health của các services"
	@echo "  make clean   - Dọn dẹp containers và volumes"
	@echo "  make status  - Kiểm tra trạng thái các services"

setup: ## Thiết lập môi trường ban đầu
	@echo "📦 Đang thiết lập môi trường..."
	@if [ ! -f .env ]; then \
		echo "📝 Tạo .env file từ template..."; \
		cp .env.example .env; \
		echo "✅ File .env đã được tạo. Vui lòng kiểm tra và cập nhật nếu cần!"; \
	else \
		echo "✅ File .env đã tồn tại"; \
	fi
	@chmod +x database/init/01-init-databases.sh
	@echo "✅ Đã cấp quyền thực thi cho init script"
	@echo ""
	@echo "🚀 Sẵn sàng! Chạy 'make start' để khởi động hệ thống"

start: setup ## Khởi động tất cả services
	@echo "🚀 Đang khởi động tất cả services..."
	@docker-compose up -d
	@echo ""
	@echo "✅ Hệ thống đã khởi động!"
	@echo ""
	@echo "📊 Các services đang chạy:"
	@docker-compose ps
	@echo ""
	@echo "🌐 Truy cập:"
	@echo "  - PgAdmin: http://localhost:5050 (admin@ielts.com / admin123)"
	@echo "  - RabbitMQ Management: http://localhost:15672 (admin / admin123)"
	@echo "  - Auth Service: http://localhost:8001"
	@echo ""
	@echo "📝 Xem logs: make logs"

stop: ## Dừng tất cả services
	@echo "🛑 Đang dừng tất cả services..."
	@docker-compose down
	@echo "✅ Đã dừng tất cả services"

restart: ## Khởi động lại tất cả services
	@echo "🔄 Đang khởi động lại hệ thống..."
	@docker-compose restart
	@echo "✅ Đã khởi động lại thành công"

logs: ## Xem logs của tất cả services
	@docker-compose logs -f

clean: ## Dọn dẹp containers, volumes, và images
	@echo "🧹 Đang dọn dẹp..."
	@docker-compose down -v --rmi local
	@echo "✅ Đã dọn dẹp xong"

status: ## Kiểm tra trạng thái các services
	@echo "📊 Trạng thái các services:"
	@docker-compose ps
	@echo ""
	@echo "💾 Trạng thái volumes:"
	@docker volume ls | grep datn || echo "Không có volume nào"

health: ## Kiểm tra health của các services
	@chmod +x scripts/health-check.sh
	@./scripts/health-check.sh
