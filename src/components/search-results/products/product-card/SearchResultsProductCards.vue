<script lang="ts" setup>
import { useOptionsStore } from '@/stores/options'
import type { Document } from '@getlupa/client-sdk/Types'
import { computed, onMounted, ref } from 'vue'


const props = defineProps<{
  products: Document[]
}>()

const optionsStore = useOptionsStore()

const isInStock = ref(true)
const loading = ref(true)
const error = ref('')
const rawHtml = ref('')

const ssr = computed(() => Boolean(optionsStore.searchResultOptions.ssr))

onMounted(async () => {
  try {
    // @ts-ignore
    const product_ids = Object.values(props.products).map(({id}) => id)
    const response = await fetch(`https://stg.bigbox.lt/module/mijoracategoryproducts/ajax?action=getFilteredProducts&ajax=1&params=ids=${product_ids.join()}`)
    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }
    const json = await response.json()
    console.log("Response json: ", json)
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
    <div class="loading-overlay active" v-if="loading"></div>
    <div v-if="error">{{ error }}</div>
    <div v-if="!loading && !error" v-html="rawHtml"></div>
  </div>
</template>