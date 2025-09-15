<template>
  <div class="bg-gray-100 text-gray-800">
    <div
      class="relative h-96 flex items-center justify-center text-center bg-cover bg-center"
      style="background-image: url('https://primefaces.org/static/images/hero-books.jpg')"
    >
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative z-10 text-white p-4">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
          Discover Your Next Great Read
        </h1>
        <p class="text-lg md:text-xl mb-6">Borrow from a vast collection of books, all for free.</p>
        <Button
          label="Browse Books"
          icon="pi pi-book"
          unstyled
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
          @click="goToBooks"
        />
      </div>
    </div>

    <section class="container mx-auto py-16 px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Why Choose Our Library?</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <i class="pi pi-search text-5xl text-blue-500 mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Easy to Search</h3>
          <p class="text-gray-600">Find books by title, author, or genre in seconds.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <i class="pi pi-sync text-5xl text-blue-500 mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Simple Borrowing</h3>
          <p class="text-gray-600">Borrow and return books with a few simple clicks.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <i class="pi pi-users text-5xl text-blue-500 mb-4"></i>
          <h3 class="text-xl font-semibold mb-2">Community Driven</h3>
          <p class="text-gray-600">Join a community of book lovers and share your favorites.</p>
        </div>
      </div>
    </section>

    <section class="bg-gray-200 py-16 px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Featured Books</h2>
      <div class="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card>
          <template #header>
            <img
              class="w-full h-64 object-cover"
              src="https://primefaces.org/static/images/book-1.jpg"
              alt="Book Cover"
            />
          </template>
          <template #title>The Great Gatsby</template>
          <template #subtitle>F. Scott Fitzgerald</template>
          <template #footer>
            <Button label="Borrow" icon="pi pi-plus" class="p-button-sm w-full" />
          </template>
        </Card>
        <Card>
          <template #header>
            <img
              class="w-full h-64 object-cover"
              src="https://primefaces.org/static/images/book-2.jpg"
              alt="Book Cover"
            />
          </template>
          <template #title>1984</template>
          <template #subtitle>George Orwell</template>
          <template #footer>
            <Button label="Borrow" icon="pi pi-plus" class="p-button-sm w-full" />
          </template>
        </Card>
        <Card>
          <template #header>
            <img
              class="w-full h-64 object-cover"
              src="https://primefaces.org/static/images/book-3.jpg"
              alt="Book Cover"
            />
          </template>
          <template #title>To Kill a Mockingbird</template>
          <template #subtitle>Harper Lee</template>
          <template #footer>
            <Button label="Borrow" icon="pi pi-plus" class="p-button-sm w-full" />
          </template>
        </Card>
        <Card>
          <template #header>
            <img
              class="w-full h-64 object-cover"
              src="https://primefaces.org/static/images/book-4.jpg"
              alt="Book Cover"
            />
          </template>
          <template #title>Pride and Prejudice</template>
          <template #subtitle>Jane Austen</template>
          <template #footer>
            <Button label="Borrow" icon="pi pi-plus" class="p-button-sm w-full" />
          </template>
        </Card>
      </div>
    </section>

    <section class="bg-blue-600 text-white py-16 px-4 text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to Start Reading?</h2>
      <p class="text-lg md:text-xl mb-8">
        Sign up today to get started with your free digital library card.
      </p>
      <Button
        label="Join Now"
        unstyled
        class="bg-white text-blue-600 font-bold py-3 px-6 rounded-full transition-colors duration-300 hover:bg-gray-200"
        @click="goToRegister"
      />
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'

const router = useRouter()

const goToBooks = () => {
  router.push('/books')
}

const goToRegister = () => {
  router.push('/auth/register')
}
</script>
