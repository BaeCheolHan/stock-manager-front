<template>
  <div class="flex range-toggle" role="tablist" aria-label="기간 선택">
    <button class="mg-r-10" :class="buttonClass('D')" role="tab" :aria-selected="modelValue === 'D' ? 'true' : 'false'" @click="select('D')">일별</button>
    <button class="mg-r-10" :class="buttonClass('W')" role="tab" :aria-selected="modelValue === 'W' ? 'true' : 'false'" @click="select('W')">주별</button>
    <button class="mg-r-10" :class="buttonClass('M')" role="tab" :aria-selected="modelValue === 'M' ? 'true' : 'false'" @click="select('M')">월별</button>
    <button v-if="showYear" :class="buttonClass('Y')" role="tab" :aria-selected="modelValue === 'Y' ? 'true' : 'false'" @click="select('Y')">년별</button>
  </div>
</template>

<script>
export default {
  name: 'RangeToggle',
  props: {
    modelValue: { type: String, required: true },
    showYear: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  methods: {
    select(val) {
      if (this.modelValue !== val) this.$emit('update:modelValue', val)
    },
    buttonClass(val) {
      return this.modelValue === val ? 'redBtn' : 'border-radius-8'
    }
  }
}
</script>


