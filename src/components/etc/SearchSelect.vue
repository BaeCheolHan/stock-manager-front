<template>
  <div class="searchSelect" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="enter">
    <div class="input_reset">
      <input class="form-control" :placeholder="placeholder" v-model="keyword" @input="onInput" @focus="open = true" :aria-expanded="open ? 'true' : 'false'"/>
      <i class="ti-angle-down" @click="open = !open"></i>
    </div>
    <ul class="searchSelectBox" v-show="open" role="listbox">
      <li v-for="(item, idx) in filtered" :key="itemKey(item, idx)" :class="{active: idx === activeIndex}" @mousedown.prevent="select(item)" role="option">
        <slot name="item" :item="item">{{ itemLabel(item) }}</slot>
      </li>
      <li v-if="!loading && filtered.length === 0" class="t-a-c pd-10">검색 결과가 없습니다</li>
      <li v-if="loading" class="t-a-c pd-10">로딩중...</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SearchSelect',
  props: {
    items: { type: Array, default: () => [] },
    label: { type: [String, Function], default: 'name' },
    keyField: { type: String, default: 'id' },
    placeholder: { type: String, default: '' },
    debounce: { type: Number, default: 250 },
    loading: { type: Boolean, default: false },
  },
  emits: ['select', 'input-change'],
  data() {
    return {
      keyword: '',
      open: false,
      filtered: [],
      activeIndex: -1,
      timer: null,
    }
  },
  watch: {
    items: {
      handler() { this.filterNow() },
      immediate: true,
    }
  },
  methods: {
    itemLabel(item) {
      if (typeof this.label === 'function') return this.label(item)
      return (item && item[this.label]) || ''
    },
    itemKey(item, idx) {
      return item[this.keyField] ?? this.itemLabel(item) ?? idx
    },
    onInput() {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$emit('input-change', this.keyword)
        this.filterNow()
      }, this.debounce)
    },
    filterNow() {
      const v = (this.keyword || '').toString().toLowerCase().replace(/\s+/g, '')
      this.filtered = this.items.filter(it => this.itemLabel(it).toString().toLowerCase().replace(/\s+/g, '').includes(v))
      this.activeIndex = this.filtered.length ? 0 : -1
    },
    select(item) {
      this.open = false
      this.$emit('select', item)
    },
    move(delta) {
      if (!this.open || this.filtered.length === 0) return
      const next = this.activeIndex + delta
      if (next < 0) this.activeIndex = this.filtered.length - 1
      else if (next >= this.filtered.length) this.activeIndex = 0
      else this.activeIndex = next
    },
    enter() {
      if (this.open && this.activeIndex >= 0) {
        this.select(this.filtered[this.activeIndex])
      }
    }
  }
}
</script>

<style scoped>
.active {
  background-color: #f1f1f1;
}
</style>
