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
    console.log('SearchResultsProductCards')
    console.log("props: =>", {props})
    console.log("product: => ", props.products)
    console.log("product2: => ", Object.entries(props.products))
    console.log("product3: => ", Object.values(props.products))
    console.log("product4: => ", await props.products)
    const response = await fetch(`https://stg.bigbox.lt/module/mijoracategoryproducts/ajax?action=getFilteredProducts&ajax=1&params=ids=1027573`)
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
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
    <div v-if="!loading && !error" v-html="rawHtml"></div>
  </div>
</template>