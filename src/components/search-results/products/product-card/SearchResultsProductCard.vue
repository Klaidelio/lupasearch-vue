<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import type { ProductClickTrackingSettings } from '@/types/AnalyticsOptions'
import type { SearchResultsProductCardOptions } from '@/types/search-results/SearchResultsProductCardOptions'
import type { Document } from '@getlupa/client-sdk/Types'
import { computed, onMounted, ref } from 'vue'


const props = defineProps<{
  product: Document
  options: SearchResultsProductCardOptions
  isAdditionalPanel?: boolean
  clickTrackingSettings?: ProductClickTrackingSettings
}>()

const optionsStore = useOptionsStore()

const isInStock = ref(true)
const loading = ref(true)
const error = ref('')
const rawHtml = ref('')

const ssr = computed(() => Boolean(optionsStore.searchResultOptions.ssr))

onMounted(async () => {
  try {
    console.log("product: => ", props.product)
    const response = await fetch(window.location.origin + `/module/mijoracategoryproducts/ajax?action=getFilteredProducts&ajax=1&params=ids=1027573`)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const json = await response.json()
    rawHtml.value = json.html
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false

  }
})

const checkIfIsInStock = async (): Promise<void> => {
  isInStock.value = props.options.isInStock ? await props.options.isInStock(props.product) : true
}

if (ssr.value) {
  checkIfIsInStock()
}

</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
    <div v-if="!loading && !error" v-html="rawHtml"></div>
  </div>
</template>