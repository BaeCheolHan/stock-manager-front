<template>
  <v-snackbar v-model="ui.snackbar.show" :color="ui.snackbar.color" :timeout="ui.snackbar.timeout" location="bottom right" role="status" aria-live="polite" @update:model-value="onToggle">
    <span class="flex" style="align-items: center; gap: 6px">
      <v-icon v-if="iconFor(ui.snackbar.color)" :icon="iconFor(ui.snackbar.color)" size="18"/>
      {{ ui.snackbar.message }}
    </span>
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
import UiService from '@/service/UiService'

export default {
  name: 'GlobalSnackbar',
  setup() {
    const ui = useUiStore()
    const iconFor = (color) => {
      if (color === 'success') return 'mdi-check-circle-outline'
      if (color === 'error') return 'mdi-alert-circle-outline'
      if (color === 'info') return 'mdi-information-outline'
      return null
    }
    const onToggle = (visible) => {
      try { if (visible) UiService.vibrate(12) } catch(_) {}
    }
    return { ui, iconFor, onToggle }
  }
}
</script>

