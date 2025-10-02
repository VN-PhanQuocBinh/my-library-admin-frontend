<style scoped>
:deep(.p-tabview-nav) {
  border: none;
  background-color: var(--my-secondary-color) !important;
}

/* :deep(.p-tablist-tab-list) {
  border: none !important;
} */

:deep(.p-tab) {
  color: var(--my-text-secondary-color) !important;
}

:deep(.p-tab-active) {
  color: var(--my-text-primary-color) !important;
}

:deep(.p-tablist-active-bar) {
  background-color: var(--my-secondary-color) !important;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { Toast } from 'primevue'
import ReaderTab from '@/components/pages/user/reader-tab.vue'
import AdminTab from '@/components/pages/user/admin-tab.vue'

const activeIndex = ref(0)
</script>

<template>
  <Toast position="bottom-right" />

  <div>
    <Tabs :value="'admin'">
      <TabList class="mb-4 border-b border-gray-300">
        <Tab :value="'admin'">Admin Accounts</Tab>
        <Tab :value="'reader'">Reader Accounts</Tab>
      </TabList>

      <TabPanels>
        <TabPanel :value="'admin'">
          <AdminTab />
        </TabPanel>
        <TabPanel :value="'reader'">
          <ReaderTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
