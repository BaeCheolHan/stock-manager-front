<template>
  <v-snackbar v-model="ui.snackbar.show" :color="ui.snackbar.color" :timeout="ui.snackbar.timeout" location="bottom right" role="status" aria-live="polite">
    {{ ui.snackbar.message }}
    <template #actions>
      <v-btn variant="text" @click="ui.hideSnackbar()">닫기</v-btn>
    </template>
  </v-snackbar>
  <v-overlay :model-value="ui.loading.active" class="align-center justify-center">
    <v-card class="pa-4" elevation="2">
      <v-progress-circular indeterminate color="primary" class="mr-3"/>
      <span>{{ ui.loading.message || '처리중입니다...' }}</span>
    </v-card>
  </v-overlay>
  
</template>

<script>
import { useUiStore } from '@/store/ui'

export default {
  name: 'GlobalSnackbar',
  setup() {
    const ui = useUiStore()
    return { ui }
  }
}
</script>

