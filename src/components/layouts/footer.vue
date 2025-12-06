<template>
  <footer class="bg-(--my-secondary-color) text-white py-12 px-6">
    <div class="max-w-6xl mx-auto">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Cột 1: Thông tin thư viện -->
        <div class="space-y-4">
          <div class="flex flex-row gap-3 text-xl font-bold mb-4! text-(--my-primary-color)">
            <IconSvg name="logo" class="w-8 h-8 text-(--my-primary-color)" />
            <h3>MY LIBRARY ADMIN</h3>
          </div>
          <p class="text-gray-300 text-sm leading-relaxed">
            Thư viện hiện đại với hàng ngàn đầu sách phong phú, phục vụ nhu cầu học tập và nghiên
            cứu của cộng đồng.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-(--my-primary-color) transition-colors">
              <i class="pi pi-facebook text-lg"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-(--my-primary-color) transition-colors">
              <i class="pi pi-twitter text-lg"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-(--my-primary-color) transition-colors">
              <i class="pi pi-instagram text-lg"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-(--my-primary-color) transition-colors">
              <i class="pi pi-youtube text-lg"></i>
            </a>
          </div>
        </div>

        <!-- Cột 2: Liên kết nhanh -->
        <div class="space-y-4">
          <h3 class="text-xl font-bold mb-4! text-(--my-primary-color)">Liên kết nhanh</h3>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="text-gray-300 hover:text-white transition-colors text-sm">
                Trang chủ
              </router-link>
            </li>
            <li>
              <router-link
                to="/books"
                class="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Danh sách sách
              </router-link>
            </li>
            <li>
              <router-link
                to="/borrowings"
                class="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Lịch sử mượn sách
              </router-link>
            </li>
            <li>
              <router-link
                to="/about"
                class="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Về chúng tôi
              </router-link>
            </li>
            <li>
              <router-link
                to="/contact"
                class="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Liên hệ
              </router-link>
            </li>
            <li>
              <router-link
                to="/faq"
                class="text-gray-300 hover:text-white transition-colors text-sm"
              >
                Câu hỏi thường gặp
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Cột 3: Thông tin liên hệ -->
        <div class="space-y-4">
          <h3 class="text-xl font-bold mb-4! text-(--my-primary-color)">Thông tin liên hệ</h3>
          <div class="space-y-3">
            <div class="flex items-start space-x-3">
              <i class="pi pi-map-marker text-(--my-primary-color) mt-1"></i>
              <div>
                <p class="text-gray-300 text-sm">123 Đường Tri Thức, Quận 1</p>
                <p class="text-gray-300 text-sm">TP. Hồ Chí Minh, Việt Nam</p>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <i class="pi pi-phone text-(--my-primary-color)"></i>
              <a
                href="tel:+84123456789"
                class="text-gray-300 hover:text-white transition-colors text-sm"
              >
                +84 123 456 789
              </a>
            </div>

            <div class="flex items-center space-x-3">
              <i class="pi pi-envelope text-(--my-primary-color)"></i>
              <a
                href="mailto:info@mylibrary.com"
                class="text-gray-300 hover:text-white transition-colors text-sm"
              >
                info@mylibrary.com
              </a>
            </div>

            <div class="flex items-start space-x-3 mt-4">
              <i class="pi pi-clock text-(--my-primary-color) mt-1"></i>
              <div>
                <p class="text-gray-300 text-sm font-medium">Giờ mở cửa:</p>
                <p class="text-gray-300 text-sm">T2 - T6: 7:00 - 18:00</p>
                <p class="text-gray-300 text-sm">T7 - CN: 8:00 - 17:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <hr class="border-gray-700 mb-6" />

      <!-- Copyright -->
      <div class="text-center">
        <p class="text-gray-400 text-sm">© 2024 My Library. Tất cả quyền được bảo lưu.</p>
      </div>
    </div>
  </footer>
</template>
